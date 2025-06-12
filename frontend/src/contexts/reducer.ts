// src/contexts/reducer.ts

export interface Author {
    name: string;
    email: string;
  }
  
  export interface Note {
    _id: string;
    title: string;
    content: string;
    author: Author | null;
  }
  
  export interface State {
    notes: Note[];
    notification: string;
  }
  
  export type Action =
    | { type: 'SET_NOTES'; payload: Note[] }
    | { type: 'ADD_NOTE'; payload: Note }
    | { type: 'DELETE_NOTE'; payload: string } // note _id
    | { type: 'UPDATE_NOTE'; payload: Note }
    | { type: 'SET_NOTIFICATION'; payload: string };
  
  export function notesReducer(state: State, action: Action): State {
    switch (action.type) {
      case 'SET_NOTES':
        return { ...state, notes: action.payload };
  
      case 'ADD_NOTE':
        return {
          ...state,
          notes: [action.payload, ...state.notes],
          notification: 'Added a new note',
        };
  
        case 'DELETE_NOTE':
            return {
              ...state,
              notes: state.notes.filter(note => note._id !== action.payload),
            };
          
  
            case 'UPDATE_NOTE':
                return {
                  ...state,
                  notes: state.notes.map((note) =>
                    note._id === action.payload._id ? action.payload : note
                  ),
                };
              
      case 'SET_NOTIFICATION':
        return {
          ...state,
          notification: action.payload,
        };
  
      default:
        return state;
    }
  }
  