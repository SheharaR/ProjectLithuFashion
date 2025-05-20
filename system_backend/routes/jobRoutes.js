import {
  createJob,
  getAllAssignedJobsByEmployee,
  getAllJobs,
  getAvailableJobs,
  getJobDetails,
  updateCompletedQuantity,
  updateJobStatus
} from '../controllers/jobController.js';

import authMiddleware from '../middleware/auth.js';
import express from 'express';
import upload from '../middleware/uploadMiddleware.js';

const JobRouter = express.Router();

// Admin routes
JobRouter.post('/', upload.single('design_image'), createJob);

// Employee routes
JobRouter.get('/available', authMiddleware, getAvailableJobs);
JobRouter.put('/update', authMiddleware, updateJobStatus);
JobRouter.put('/update_complete', authMiddleware, updateCompletedQuantity);
// General routes
JobRouter.get('/jobs', getAllJobs);
JobRouter.post('/jobs_de', getJobDetails);
JobRouter.get('/get_all',authMiddleware,getAllAssignedJobsByEmployee);
export default JobRouter;