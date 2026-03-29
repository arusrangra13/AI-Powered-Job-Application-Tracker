const express = require('express');
const router = express.Router();
const { getReminders, createReminder, updateReminder, deleteReminder, completeReminder } = require('../controllers/reminderController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);
router.get('/', getReminders);
router.post('/', createReminder);
router.put('/:id', updateReminder);
router.put('/:id/complete', completeReminder);
router.delete('/:id', deleteReminder);

module.exports = router;
