const express = require('express');
const router = express.Router();
const { getJobs, createJob, getJob, updateJob, deleteJob } = require('../controllers/jobController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);
router.get('/', getJobs);
router.post('/', createJob);
router.get('/:id', getJob);
router.put('/:id', updateJob);
router.delete('/:id', deleteJob);

module.exports = router;
