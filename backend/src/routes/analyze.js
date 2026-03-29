const express = require('express');
const router = express.Router();
const { analyzeResume } = require('../controllers/analyzeController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);
router.post('/resume', analyzeResume);

module.exports = router;
