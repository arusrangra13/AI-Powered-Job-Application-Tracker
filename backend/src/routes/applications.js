const express = require('express');
const router = express.Router();
const {
  getApplications, createApplication, getApplication,
  updateApplication, updateStatus, deleteApplication
} = require('../controllers/applicationController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);
router.get('/', getApplications);
router.post('/', createApplication);
router.get('/:id', getApplication);
router.put('/:id', updateApplication);
router.put('/:id/status', updateStatus);
router.delete('/:id', deleteApplication);

module.exports = router;
