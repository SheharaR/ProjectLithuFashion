import {
    createSalary,
    getEmployeesForSalary,
    getSalaryBreakdown,
    getSalaryDetailsForAdmin,
    getSalaryDetailsForEmployee
} from '../controllers/salaryController.js';

import authMiddleware from '../middleware/auth.js';
import express from 'express';

const router = express.Router();

// Admin routes
router.post('/employees', getEmployeesForSalary);
router.post('/', createSalary);
router.get('/admin', getSalaryDetailsForAdmin);

// Employee routes
router.get('/employee_id',authMiddleware, getSalaryDetailsForEmployee);
router.get('/:salary_id', getSalaryBreakdown);

export default router;