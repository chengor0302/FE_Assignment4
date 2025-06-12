import { Request, Response } from 'express';
import * as noteService from '../services/noteService';
import { AuthRequest } from '../middlewares/authMiddleware';

export const getAllNotes = async (req: Request, res: Response): Promise<void> => {
  const { notes, count } = await noteService.getAllNotes(req.query);
  res.set('X-Total-Count', count.toString());
  res.status(200).json(notes);
};

export const getNoteById = async (req: Request, res: Response): Promise<void> => {
  const note = await noteService.getNoteById(req.params.id);
  if (!note) {
    res.status(404).json({ message: 'Note not found' });
    return;
  }
  res.status(200).json(note);
};

export const createNote = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user || !req.user.id) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  const noteData = { ...req.body, user: req.user.id };
  const note = await noteService.createNote(noteData);
  res.status(201).json(note);
};

export const updateNoteById = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user || !req.user.id) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  const note = await noteService.getNoteById(req.params.id);
  if (!note) {
    res.status(404).json({ message: 'Note not found' });
    return;
  }
  if (note.user.toString() !== req.user.id) {
    res.status(403).json({ error: 'Forbidden: not the author' });
    return;
  }
  const updatedNote = await noteService.updateNoteById(req.params.id, req.body);
  res.status(200).json(updatedNote);
};

export const deleteNoteById = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user || !req.user.id) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  const note = await noteService.getNoteById(req.params.id);
  if (!note) {
    res.status(404).json({ message: 'Note not found' });
    return;
  }
  if (note.user.toString() !== req.user.id) {
    res.status(403).json({ error: 'Forbidden: not the author' });
    return;
  }
  await noteService.deleteNoteById(req.params.id);
  res.status(204).send();
};

export const getNoteByIndex = async (req: Request, res: Response): Promise<void> => {
  const index = parseInt(req.params.i);
  const note = await noteService.getNoteByIndex(index);
  if (!note) {
    res.status(404).json({ message: 'Note not found' });
    return;
  }
  res.status(200).json(note);
};

export const updateNoteByIndex = async (req: Request, res: Response): Promise<void> => {
  const index = parseInt(req.params.i);
  const note = await noteService.updateNoteByIndex(index, req.body);
  if (!note) {
    res.status(404).json({ message: 'Note not found' });
    return;
  }
  res.status(200).json(note);
};

export const deleteNoteByIndex = async (req: Request, res: Response): Promise<void> => {
  const index = parseInt(req.params.i);
  const note = await noteService.deleteNoteByIndex(index);
  if (!note) {
    res.status(404).json({ message: 'Note not found' });
    return;
  }
  res.status(204).send();
};
