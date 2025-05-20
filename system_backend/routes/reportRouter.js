import express from 'express';
import { generateReports } from '../controllers/reportController.js';

const reportrouter = express.Router();


reportrouter.get('/reports',generateReports);
 
export default reportrouter;
