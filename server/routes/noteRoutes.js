const express = require('express');
const router = express.Router();
const {
  createNote,
  getNotes,
  getNoteById,
  updateNote,
  deleteNote,
  restoreNote,
  permanentDeleteNote,
  duplicateNote,
  getDashboardStats,
} = require('../controllers/noteController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/dashboard/stats', getDashboardStats);
router.post('/', createNote);
router.get('/', getNotes);
router.get('/:id', getNoteById);
router.put('/:id', updateNote);
router.delete('/:id', deleteNote);
router.patch('/:id/restore', restoreNote);
router.delete('/:id/permanent', permanentDeleteNote);
router.post('/:id/duplicate', duplicateNote);

module.exports = router;
