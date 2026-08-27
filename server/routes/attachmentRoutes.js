const express = require('express');
const router = express.Router();
const { upload, uploadAttachment, deleteAttachment } = require('../controllers/attachmentController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/upload', upload.single('file'), uploadAttachment);
router.delete('/:id', deleteAttachment);

module.exports = router;
