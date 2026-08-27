const express = require('express');
const router = express.Router();
const {
  shareNoteWithUser,
  removeShareAccess,
  updatePublicShare,
  getPublicNote,
  reportNote,
} = require('../controllers/shareController');
const { protect } = require('../middleware/auth');

// Public route to view a shared link note
router.post('/public/:shareLink', getPublicNote);

// Protected share actions
router.use(protect);
router.post('/share', shareNoteWithUser);
router.delete('/unshare', removeShareAccess);
router.post('/public-link', updatePublicShare);
router.post('/report', reportNote);

module.exports = router;
