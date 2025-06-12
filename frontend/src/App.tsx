import { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';
import { useNotesContext } from './contexts/NotesContext';
import { addNote } from './api';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import { Note } from './types/Note';

const PER_PAGE = 10;
const NOTES_URL = 'http://localhost:3001/notes';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState('');
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalNotes, setTotalNotes] = useState(0);
  const [isAdding, setIsAdding] = useState(false);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [editNoteId, setEditNoteId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [notification, setNotification] = useState('Notification area');
  const { state, dispatch } = useNotesContext();
  const [notesCache, setNotesCache] = useState<{ [page: number]: Note[] }>({});

  const fetchNotesPage = async (page: number) => {
    try {
      const response = await axios.get(
        `${NOTES_URL}?_page=${page}&_limit=${PER_PAGE}`
      );
      const mapped = response.data.map((note: { _id: any }) => ({
        ...note,
        id: note._id,
      }));
      setNotesCache(prev => ({ ...prev, [page]: mapped }));
      const total = response.headers['x-total-count'];
      if (total) setTotalNotes(Number(total));
      return mapped;
    } catch (error) {
      console.error('Failed to fetch notes', error);
      return [];
    }
  };

  const getVisiblePages = () => pageButtons();

  useEffect(() => {
    let isMounted = true;
    const visiblePages = getVisiblePages();

    // If current page is cached, use it
    if (notesCache[currentPage]) {
      console.log(`Loaded page ${currentPage} from cache`);
      dispatch({ type: 'SET_NOTES', payload: notesCache[currentPage] });
    } else {
      console.log(`Fetching page ${currentPage} from server`);
      fetchNotesPage(currentPage).then(notes => {
        if (isMounted) dispatch({ type: 'SET_NOTES', payload: notes });
      });
    }

    visiblePages.forEach(page => {
      if (!notesCache[page]) {
        fetchNotesPage(page);
      }
    });

    return () => { isMounted = false; };
  }, [currentPage, totalNotes]);

  const invalidateCache = (pages: number[] = []) => {
    setNotesCache(prev => {
      if (pages.length === 0) return {};
      const newCache = { ...prev };
      pages.forEach(page => { delete newCache[page]; });
      return newCache;
    });
  };

  const totalPages = Math.max(1, Math.ceil(totalNotes / PER_PAGE));
  const noNotes = totalNotes === 0;

  const handleLogin = (token: string, user: any) => {
    setIsLoggedIn(true);
    setToken(token);
    setUser(user);
  };

  // Helper to check if the logged-in user is the author
  const isAuthor = (note: Note) => {
    if (!user || !note.author) return false;
    return note.author.email === user.email;
  };

  const pageButtons = () => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (currentPage < 3) return [1, 2, 3, 4, 5];
    if (currentPage > totalPages - 3) return [totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [currentPage - 2, currentPage - 1, currentPage, currentPage + 1, currentPage + 2];
  };

  return (
    <Router>
      <nav>
        <Link to="/login">
          <button data-testid="go_to_login_button">Go to Login</button>
        </Link>
        <Link to="/create-user">
          <button data-testid="go_to_create_user_button">Create New User</button>
        </Link>
      </nav>
      <Routes>
        <Route path="/login" element={<LoginForm onLogin={handleLogin} />} />
        <Route path="/create-user" element={<RegisterForm />} />
        <Route path="/" element={
          <div>
            <h1>Notes</h1>
            {isLoggedIn && (
              <button
                data-testid="logout"
                onClick={() => {
                  setToken('');
                  setIsLoggedIn(false);
                  setUser(null);
                  setNotification('Logged out');
                }}
              >
                Logout
              </button>
            )}
            <div className="notification">{notification}</div>
            {state.notes.map((note: Note) => (
              <div key={note._id} className="note" data-testid={note._id}>
                <h2>{note.title}</h2>
                <small>
                  {note.author?.name
                    ? `By ${note.author.name} (${note.author.email})`
                    : 'By Anonymous'}
                </small>
                {editNoteId === note._id ? (
                  <>
                    <textarea
                      data-testid={`text_input-${note._id}`}
                      name={`text_input-${note._id}`}
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                    />
                    <button
                      data-testid={`text_input_save-${note._id}`}
                      onClick={async () => {
                        try {
                          const updated = await axios.put(
                            `${NOTES_URL}/${note._id}`,
                            { ...note, content: editContent },
                            token ? { headers: { Authorization: `Bearer ${token}` } } : {}
                          );
                          dispatch({ type: 'UPDATE_NOTE', payload: updated.data });
                          setEditNoteId(null);
                          setNotification('Note updated');
                          invalidateCache([currentPage]);
                        } catch (err) {
                          console.error('Failed to update note', err);
                        }
                      }}
                    >
                      Save
                    </button>
                    <button
                      data-testid={`text_input_cancel-${note._id}`}
                      onClick={() => setEditNoteId(null)}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <p>{note.content}</p>
                    {isLoggedIn && isAuthor(note) && (
                      <button
                        data-testid={`edit-${note._id}`}
                        onClick={() => {
                          setEditNoteId(note._id);
                          setEditContent(note.content);
                        }}
                      >
                        Edit
                      </button>
                    )}
                  </>
                )}
                {isLoggedIn && isAuthor(note) && (
                  <button
                    name={`delete-${note._id}`}
                    onClick={async () => {
                      try {
                        await axios.delete(`${NOTES_URL}/${note._id}`, token ? { headers: { Authorization: `Bearer ${token}` } } : {});
                        const newTotal = totalNotes - 1;
                        const newLastPage = Math.ceil(newTotal / PER_PAGE) || 1;
                        setTotalNotes(newTotal);
                        setNotification('Note deleted');
                        if (currentPage > newLastPage) {
                          setCurrentPage(newLastPage);
                        } else {
                          invalidateCache([currentPage]);
                        }
                      } catch (err) {
                        console.error('Failed to delete note', err);
                      }
                    }}
                  >
                    Delete
                  </button>
                )}
              </div>
            ))}
            {isLoggedIn && !isAdding && (
              <button name="add_new_note" onClick={() => setIsAdding(true)}>
                Add New Note
              </button>
            )}
            {isLoggedIn && isAdding && (
              <div>
                <input
                  type="text"
                  value={newNoteContent}
                  name="text_input_new_note"
                  onChange={(e) => setNewNoteContent(e.target.value)}
                />
                <button
                  name="text_input_save_new_note"
                  onClick={async () => {
                    try {
                      const created = await axios.post(
                        NOTES_URL,
                        {
                          content: `Content for note ${newNoteContent}`,
                          title: `Note ${newNoteContent}`,
                          author: {
                            name: user?.name || '',
                            email: user?.email || '',
                          },
                        },
                        token ? { headers: { Authorization: `Bearer ${token}` } } : {}
                      );
                      const newTotal = totalNotes + 1;
                      const newLastPage = Math.ceil(newTotal / PER_PAGE);
                      setTotalNotes(newTotal);
                      setCurrentPage(newLastPage);
                      setIsAdding(false);
                      setNewNoteContent('');
                      setNotification('Added a new note');
                      invalidateCache([currentPage]);
                      fetchNotesPage(newLastPage).then(notes => dispatch({ type: 'SET_NOTES', payload: notes }));
                    } catch (err) {
                      console.error(err);
                    }
                  }}
                >
                  Save
                </button>
                <button
                  name="text_input_cancel_new_note"
                  onClick={() => {
                    setIsAdding(false);
                    setNewNoteContent('');
                  }}
                >
                  Cancel
                </button>
              </div>
            )}
            <div>
              <button
                name="first"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1 || noNotes}
              >
                First
              </button>
              <button
                name="previous"
                onClick={() => setCurrentPage((p) => p - 1)}
                disabled={currentPage === 1 || noNotes}
              >
                Previous
              </button>
              {pageButtons().map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={currentPage === page ? 'active' : ''}
                  disabled={noNotes}
                >
                  {page}
                </button>
              ))}
              <button
                name="next"
                onClick={() => setCurrentPage((p) => p + 1)}
                disabled={currentPage === totalPages || noNotes}
              >
                Next
              </button>
              <button
                name="last"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages || noNotes}
              >
                Last
              </button>
            </div>
          </div>
        } />
      </Routes>
    </Router>
  );
}

export default App;
