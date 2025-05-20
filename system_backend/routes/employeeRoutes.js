import { getAllEmployees, getEmployeeById, loginEmployee, registerEmployee, updateEmployeeDetails } from '../controllers/employeeController.js';

import authMiddleware from '../middleware/auth.js';
import express from 'express';

const EmployeeRouter = express.Router();

// Employee authentication routes
EmployeeRouter.post('/register', registerEmployee);
EmployeeRouter.post('/login', loginEmployee);
EmployeeRouter.get('/get',authMiddleware, getEmployeeById);
EmployeeRouter.get('/get_all',getAllEmployees);
EmployeeRouter.put('/update',authMiddleware, updateEmployeeDetails);
export default EmployeeRouter;