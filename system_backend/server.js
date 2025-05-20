import 'dotenv/config';

import AnalyticsRouter from './routes/analyticsRoutes.js';
import EmployeeRouter from './routes/employeeRoutes.js';
import JobRouter from './routes/jobRoutes.js';
import OrderRoutes from './routes/orderRoutes.js';
import ProductRouter from './routes/productRoutes.js';
import SalaryRouter from './routes/salaryRoutes.js';
import assignRouter from './routes/assignEmployeesRouter.js';
import billRoutes from './routes/billRoutes.js';
import cors from 'cors';
import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';
import pool from './config/db.js';
import quotationRouter from './routes/addquotation.js';
import reportRouter from './routes/reportRouter.js';
import salaryRoutes from './routes/salaryRoutes.js';
import supervisorsRouter from './routes/supervisorsRouter.js';
import userRouter from './routes/userRouter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

















const app = express();
const port = process.env.PORT || 4000;
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// Middleware
app.use(express.json());
app.use(cors());

// Serve static images
app.use('/images', express.static('uploads'));

// API endpoints
app.use('/api/salaries', salaryRoutes);

app.use('/api/user', userRouter); 

app.use('/api', reportRouter);
app.use('/api/guides', supervisorsRouter);
app.use('/api/quotation', quotationRouter);
app.use('/api/product', ProductRouter);
app.use('/api/jobs', assignRouter);
app.use('/api/order',OrderRoutes);
app.use('/api/analytics',AnalyticsRouter);
app.use('/api/bill', billRoutes);
app.use('/api/employees', EmployeeRouter);
app.use('/api/job', JobRouter);
app.use('/api/salaries',SalaryRouter);
// Test database connection
app.get('/test-db', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT 1 + 1 AS solution');
        res.json({ success: true, message: 'Database connected!', result: rows[0] });
    } catch (error) {
        console.error('Error connecting to the database:', error);
        res.status(500).json({ success: false, message: 'Error connecting to the database', error });
    }
});

// Root route
app.get('/', (req, res) => {
    res.send('API WORKING');
});

// Start the server
app.listen(port, () => {
    console.log(`Server starting on http://localhost:${port}`);
});
