import axios from 'axios';
import { Note } from './types/Note.ts';

const BASE_URL = 'http://localhost:3001/notes';

export async function fetchNotes(page: number, perPage: number): Promise<{ data: Note[]; total: number }> {
  const response = await axios.get(BASE_URL, {
    params: { _page: page, _per_page: perPage },
  });
  return {
    data: response.data,
    total: Number(response.headers['x-total-count']),
  };
}

export async function addNote(note: Omit<Note, '_id'>): Promise<Note> {
  const response = await axios.post(BASE_URL, note);
  return response.data;
}

export async function updateNote(id: string, note: Partial<Note>): Promise<Note> {
  const response = await axios.put(`${BASE_URL}/${id}`, note);
  return response.data;
}

export async function deleteNote(id: string): Promise<void> {
  await axios.delete(`${BASE_URL}/${id}`);
}
