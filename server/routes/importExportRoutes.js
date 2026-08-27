const express = require('express');
const router = express.Router();
const { exportUserData, importNotes } = require('../controllers/importExportController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/export', exportUserData);
router.post('/import', importNotes);

module.exports = router;
