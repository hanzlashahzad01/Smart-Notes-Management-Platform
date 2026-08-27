const express = require('express');
const router = express.Router();
const { summarizeNote, generateNote, rewriteNote, askNote } = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/summarize', summarizeNote);
router.post('/generate', generateNote);
router.post('/rewrite', rewriteNote);
router.post('/ask', askNote);

module.exports = router;
