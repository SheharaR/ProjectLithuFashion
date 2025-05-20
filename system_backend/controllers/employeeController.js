import bcrypt from 'bcrypt';
import { createToken } from '../middleware/token.js';
import pool from '../config/db.js';
import validator from 'validator';

// Register Employee
const registerEmployee = async (req, res) => {
  const { employee_name, email, password, phone } = req.body;
  
  try {
    // Validation checks
    if (!validator.isEmail(email)) {
      return res.status(400).json({ success: false, message: 'Please enter a valid email' });
    }
    if (password.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters' });
    }
    if (!validator.isMobilePhone(phone)) {
      return res.status(400).json({ success: false, message: 'Please enter a valid phone number' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert employee into the database
    const INSERT_EMPLOYEE_QUERY =
      'INSERT INTO employees (employee_name, email, password, phone) VALUES (?, ?, ?, ?)';
    const [result] = await pool.query(INSERT_EMPLOYEE_QUERY, [
      employee_name,
      email,
      hashedPassword,
      phone
    ]);

    // Generate token for the newly registered employee
    const token = createToken(result.insertId);

    res.status(201).json({ 
      success: true, 
      token,
      employee: {
        employee_id: result.insertId,
        employee_name,
        email,
        phone
      }
    });
  } catch (error) {
    console.error(error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }
    res.status(500).json({ success: false, message: 'Error registering employee' });
  }
};

// Login Employee
const loginEmployee = async (req, res) => {
  const { email, password } = req.body;
  try {
    const SELECT_EMPLOYEE_QUERY = 'SELECT * FROM employees WHERE email = ?';
    const [rows] = await pool.query(SELECT_EMPLOYEE_QUERY, [email]);

    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const employee = rows[0];
    const isMatch = await bcrypt.compare(password, employee.password);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = createToken(employee.employee_id);

    res.json({ 
      success: true, 
      token,
      employee: {
        employee_id: employee.employee_id,
        employee_name: employee.employee_name,
        email: employee.email,
        phone: employee.phone
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error logging in employee' });
  }
};

const getEmployeeById = async (req, res) => {
  const id  = req.body.userId;
  try {
    const GET_EMPLOYEE_QUERY = 'SELECT employee_id, employee_name, email, phone FROM employees WHERE employee_id = ?';
    const [rows] = await pool.query(GET_EMPLOYEE_QUERY, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    res.json({ success: true, employee: rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error fetching employee details' });
  }
};
const updateEmployeeDetails = async (req, res) => {
  const  id  = req.body.userId;
  const { employee_name, email, phone } = req.body;

  try {
    // Validation checks
    if (!validator.isEmail(email)) {
      return res.status(400).json({ success: false, message: 'Invalid email format' });
    }
    if (!validator.isMobilePhone(phone)) {
      return res.status(400).json({ success: false, message: 'Invalid phone number' });
    }

    const UPDATE_EMPLOYEE_QUERY =
      'UPDATE employees SET employee_name = ?, email = ?, phone = ? WHERE employee_id = ?';
    const [result] = await pool.query(UPDATE_EMPLOYEE_QUERY, [
      employee_name,
      email,
      phone,
      id,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    res.json({ success: true, message: 'Employee details updated successfully' });
  } catch (error) {
    console.error(error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }
    res.status(500).json({ success: false, message: 'Error updating employee details' });
  }
};
const getAllEmployees = async (req, res) => {
  try {
    const GET_ALL_EMPLOYEES_QUERY = 'SELECT employee_id, employee_name, email, phone FROM employees';
    const [rows] = await pool.query(GET_ALL_EMPLOYEES_QUERY);

    res.json({ success: true, employees: rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error fetching employees' });
  }
};


export { registerEmployee, loginEmployee,getEmployeeById,updateEmployeeDetails,getAllEmployees };