import express from 'express';
import {
  getAllNotes,
  getNoteById,
  createNote,
  updateNoteById,
  deleteNoteById,
  getNoteByIndex,
  updateNoteByIndex,
  deleteNoteByIndex
} from '../controllers/noteController';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = express.Router();

router.get('/', getAllNotes);
router.get('/:id', getNoteById);
router.post('/', authenticateToken, createNote);
router.put('/:id', authenticateToken, updateNoteById);
router.delete('/:id', authenticateToken, deleteNoteById);

router.get('/by-index/:i', getNoteByIndex);
router.put('/by-index/:i', updateNoteByIndex);
router.delete('/by-index/:i', deleteNoteByIndex);

export default router;
