import { NoteModel } from '../models/noteModel';

export const getAllNotes = async (query: any) => {
  const page = parseInt(query._page) || 1;
  const limit = parseInt(query._limit) || 10;
  const skip = (page - 1) * limit;

  const [notes, count] = await Promise.all([
    NoteModel.find().sort({ _id: -1 }).skip(skip).limit(limit),
    NoteModel.countDocuments()
  ]);

  return { notes, count };
};

export const getNoteById = async (id: string) => {
  return NoteModel.findById(id);
};

export const createNote = async (noteData: any) => {
  return NoteModel.create(noteData);
};

export const updateNoteById = async (id: string, noteData: any) => {
  return NoteModel.findByIdAndUpdate(id, noteData, { new: true });
};

export const deleteNoteById = async (id: string) => {
  return NoteModel.findByIdAndDelete(id);
};

export const getNoteByIndex = async (index: number) => {
  const notes = await NoteModel.find().sort({ _id: -1 }).skip(index).limit(1);
  return notes[0] || null;
};

export const updateNoteByIndex = async (index: number, noteData: any) => {
  const note = await getNoteByIndex(index);
  if (!note) return null;
  return updateNoteById((note._id as string).toString(), noteData);
};

export const deleteNoteByIndex = async (index: number) => {
  const note = await getNoteByIndex(index);
  if (!note) return null;
  return deleteNoteById((note._id as string).toString());
};
