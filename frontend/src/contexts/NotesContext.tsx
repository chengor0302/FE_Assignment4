import React, { createContext, useReducer, useContext, ReactNode } from 'react';
import { Note } from '../types/Note.ts';



type NotesState = {
  notes: Note[];
};

type Action =
  | { type: 'SET_NOTES'; payload: Note[] }
  | { type: 'ADD_NOTE'; payload: Note }
  | { type: 'UPDATE_NOTE'; payload: Note }
  | { type: 'DELETE_NOTE'; payload: string };

const initialState: NotesState = {
  notes: [],
};

function notesReducer(state: NotesState, action: Action): NotesState {
  switch (action.type) {
    case 'SET_NOTES':
      return { notes: action.payload };
    case 'ADD_NOTE':
      return { notes: [action.payload, ...state.notes] };
    case 'UPDATE_NOTE':
      return {
        notes: state.notes.map((n) =>
          n._id === action.payload._id ? action.payload : n
        ),
      };
    case 'DELETE_NOTE':
      return { notes: state.notes.filter((n) => n._id !== action.payload) };
    default:
      return state;
  }
}

const NotesContext = createContext<{
  state: NotesState;
  dispatch: React.Dispatch<Action>;
} | null>(null);

export const NotesProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(notesReducer, initialState);
  return (
    <NotesContext.Provider value={{ state, dispatch }}>
      {children}
    </NotesContext.Provider>
  );
};

export const useNotesContext = () => {
  const context = useContext(NotesContext);
  if (!context) {
    throw new Error('useNotesContext must be used within NotesProvider');
  }
  return context;
};
