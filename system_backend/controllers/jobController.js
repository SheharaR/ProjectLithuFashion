import fs from 'fs';
import path from 'path';
import pool from '../config/db.js';

export const createJob = async (req, res) => {
  // Validate required fields
  if (!req.body.job_name || !req.body.quantity || !req.body.pay_per_unit) {
    // Clean up uploaded file if validation fails
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    return res.status(400).json({
      success: false,
      message: 'Job name, quantity, and pay per unit are required fields'
    });
  }

  try {
    const { 
      job_name, 
      description, 
      start_date, 
      end_date, 
      quantity, 
      pay_per_unit 
    } = req.body;

    // Validate quantity and pay are numbers
    if (isNaN(quantity) || isNaN(pay_per_unit)) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'Quantity and pay per unit must be numbers'
      });
    }

    // Handle file upload
    let design_image_path = null;
    if (req.file) {
      // Create uploads directory if it doesn't exist
      const uploadDir = path.join(process.cwd(), 'uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      // Generate consistent filename
      const fileExt = path.extname(req.file.originalname);
      const fileName = `job-${Date.now()}${fileExt}`;
      const filePath = path.join(uploadDir, fileName);

      // Move file from temp location to uploads directory
      fs.renameSync(req.file.path, filePath);
      design_image_path = `/uploads/${fileName}`;
    }

    const [result] = await pool.query(
      `INSERT INTO jobs 
       (job_name, description, start_date, end_date, quantity, remaining_quantity, pay_per_unit, design_image) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        job_name, 
        description || null, 
        start_date || null, 
        end_date || null, 
        quantity, 
        quantity, // remaining_quantity same as initial quantity
        pay_per_unit, 
        design_image_path
      ]
    );
    
    res.status(201).json({ 
      success: true,
      id: result.insertId, 
      message: 'Job created successfully',
      imagePath: design_image_path
    });

  } catch (error) {
    // Clean up uploaded file if error occurs
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    console.error('Error creating job:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to create job. Please try again.'
    });
  }
};

export const getAvailableJobs = async (req, res) => {
  try {
    const employee_id  = req.body.userId;
    
    const [jobs] = await pool.query(`
      SELECT j.* FROM jobs j
      LEFT JOIN employee_job_assignments a ON j.job_id = a.job_id AND a.employee_id = ?
      WHERE j.is_active = TRUE AND (a.status IS NULL OR a.status != 'rejected')
    `, [employee_id]);
    
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateJobStatus = async (req, res) => {
  try {
    const employee_id = req.body.userId;
    const { status, completion_fraction, assigned_quantity, job_id } = req.body;

    // Start transaction for atomic operations
    await pool.query('START TRANSACTION');

    // Check if job exists and is active
    const [job] = await pool.query(
      `SELECT quantity, remaining_quantity, is_active 
       FROM jobs WHERE job_id = ? FOR UPDATE`,
      [job_id]
    );

    if (!job.length) {
      await pool.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    if (job[0].is_active === 0) {
      await pool.query('ROLLBACK');
      return res.status(400).json({ success: false, message: 'Job is no longer active' });
    }

    // Check existing assignment
    const [existing] = await pool.query(
      `SELECT * FROM employee_job_assignments 
       WHERE employee_id = ? AND job_id = ? FOR UPDATE`,
      [employee_id, job_id]
    );

    // Prevent status change if already accepted or rejected
    if (existing.length > 0) {
      if (existing[0].status === 'accepted' && status === 'rejected') {
        await pool.query('ROLLBACK');
        return res.status(400).json({ 
          success: false, 
          message: 'Cannot reject an already accepted job' 
        });
      }
      if (existing[0].status === 'rejected' && status === 'accepted') {
        await pool.query('ROLLBACK');
        return res.status(400).json({ 
          success: false, 
          message: 'Cannot accept an already rejected job' 
        });
      }
    }

    if (existing.length > 0) {
      // Calculate new total assigned quantity by adding to existing
      const newAssignedQuantity = (existing[0].assigned_quantity || 0) + assigned_quantity;
      
      // Calculate quantity difference for job remaining quantity update
      const quantityDifference = assigned_quantity;

      // Update existing assignment with the total assigned quantity
      await pool.query(
        `UPDATE employee_job_assignments 
         SET status = ?, 
             completion_fraction = ?,
             assigned_quantity = ?,
             completed_quantity = ?
         WHERE employee_id = ? AND job_id = ?`,
        [
          status,
          completion_fraction,
          newAssignedQuantity,
          Math.min(newAssignedQuantity, existing[0].completed_quantity || 0),
          employee_id,
          job_id
        ]
      );

      // Update job remaining quantity if status is accepted and quantity changed
      if (status === 'accepted' && quantityDifference !== 0) {
        if (job[0].remaining_quantity - quantityDifference < 0) {
          await pool.query('ROLLBACK');
          return res.status(400).json({ 
            success: false, 
            message: 'Not enough remaining quantity available' 
          });
        }

        await pool.query(
          `UPDATE jobs 
           SET remaining_quantity = remaining_quantity - ? 
           WHERE job_id = ?`,
          [quantityDifference, job_id]
        );
      }
    } else {
      if (status === 'accepted' && job[0].remaining_quantity < assigned_quantity) {
        await pool.query('ROLLBACK');
        return res.status(400).json({ 
          success: false, 
          message: 'Not enough remaining quantity available' 
        });
      }

      await pool.query(
        `INSERT INTO employee_job_assignments 
         (employee_id, job_id, status, completion_fraction, assigned_quantity)
         VALUES (?, ?, ?, ?, ?)`,
        [employee_id, job_id, status, completion_fraction, assigned_quantity]
      );

      if (status === 'accepted') {
        await pool.query(
          `UPDATE jobs 
           SET remaining_quantity = remaining_quantity - ? 
           WHERE job_id = ?`,
          [assigned_quantity, job_id]
        );
      }
    }

    const [updatedJob] = await pool.query(
      `SELECT remaining_quantity FROM jobs WHERE job_id = ?`,
      [job_id]
    );

    if (updatedJob[0].remaining_quantity <= 0) {
      await pool.query(
        `UPDATE jobs SET is_active = FALSE WHERE job_id = ?`,
        [job_id]
      );
    }

    await pool.query('COMMIT');
    res.json({ 
      success: true, 
      message: 'Job status updated successfully',
      remaining_quantity: updatedJob[0].remaining_quantity
    });
  } catch (error) {
    await pool.query('ROLLBACK');
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};
export const getAllJobs = async (req, res) => {
  try {
    const [jobs] = await pool.query(`
      SELECT 
        j.*,
        COUNT(CASE WHEN a.status = 'accepted' THEN 1 END) as accepted_count,
        COUNT(CASE WHEN a.status = 'rejected' THEN 1 END) as rejected_count,
        SUM(CASE WHEN a.status = 'accepted' THEN a.assigned_quantity ELSE 0 END) as total_assigned,
        SUM(CASE WHEN a.status = 'accepted' THEN a.completed_quantity ELSE 0 END) as total_completed,
        SUM(CASE WHEN a.status = 'accepted' THEN a.completed_quantity * j.pay_per_unit ELSE 0 END) as total_earned
      FROM jobs j
      LEFT JOIN employee_job_assignments a ON j.job_id = a.job_id
      GROUP BY j.job_id
      ORDER BY j.created_at DESC
    `);
    
    res.json({ success: true, data: jobs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getJobDetails = async (req, res) => {
  try {
    const { job_id } = req.body;
    
    // Get job basic info
    const [job] = await pool.query('SELECT * FROM jobs WHERE job_id = ?', [job_id]);
    
    // Get employee assignments for this job
    const [assignments] = await pool.query(`
      SELECT 
        a.*,
        e.employee_name,
        e.email,
        (a.completed_quantity * j.pay_per_unit) as earned_amount
      FROM employee_job_assignments a
      JOIN employees e ON a.employee_id = e.employee_id
      JOIN jobs j ON a.job_id = j.job_id
      WHERE a.job_id = ?
      ORDER BY a.status, a.updated_at DESC
    `, [job_id]);
    
    res.json({ 
      success: true, 
      data: {
        job: job[0],
        assignments
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
export const getAllAssignedJobsByEmployee = async (req, res) => {
  try {
    const employee_id = req.body.userId; // Get employee ID from authenticated user

    const [assignments] = await pool.query(`
      SELECT 
        a.*,
        j.job_name,
        j.description,
        j.pay_per_unit,
        j.design_image,
        j.is_active,
        (a.completed_quantity * j.pay_per_unit) as earned_amount,
        (a.assigned_quantity - a.completed_quantity) as remaining_quantity,
        CASE 
          WHEN j.is_active = 0 THEN 'completed'
          WHEN a.status = 'accepted' THEN 'in-progress'
          WHEN a.status = 'rejected' THEN 'rejected'
          ELSE a.status
        END as job_status
      FROM employee_job_assignments a
      JOIN jobs j ON a.job_id = j.job_id
      WHERE a.employee_id = ?
      ORDER BY 
        CASE 
          WHEN j.is_active = 0 THEN 3
          WHEN a.status = 'accepted' THEN 1
          WHEN a.status = 'rejected' THEN 2
          ELSE 4
        END,
        a.updated_at DESC
    `, [employee_id]);

    res.json({ 
      success: true, 
      data: assignments 
    });
  } catch (error) {
    console.error('Error fetching assigned jobs:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch assigned jobs' 
    });
  }
};
export const updateCompletedQuantity = async (req, res) => {
  try {
    const { assignment_id, completed_quantity } = req.body;
    const employee_id = req.body.userId;

    // Start transaction
    await pool.query('START TRANSACTION');

    // Verify assignment exists and belongs to employee
    const [assignment] = await pool.query(
      `SELECT * FROM employee_job_assignments 
       WHERE assignment_id = ? AND employee_id = ? FOR UPDATE`,
      [assignment_id, employee_id]
    );

    if (assignment.length === 0) {
      await pool.query('ROLLBACK');
      return res.status(404).json({ 
        success: false, 
        message: 'Assigned job not found' 
      });
    }

    // Validate completed quantity doesn't exceed assigned quantity
    if (completed_quantity > assignment[0].assigned_quantity) {
      await pool.query('ROLLBACK');
      return res.status(400).json({ 
        success: false, 
        message: 'Completed quantity cannot exceed assigned quantity' 
      });
    }

    // Get job details for pay calculation
    const [job] = await pool.query(
      `SELECT pay_per_unit FROM jobs WHERE job_id = ?`,
      [assignment[0].job_id]
    );

    // Update completed quantity
    await pool.query(
      `UPDATE employee_job_assignments 
       SET completed_quantity = ?,
           updated_at = CURRENT_TIMESTAMP
       WHERE assignment_id = ?`,
      [completed_quantity, assignment_id]
    );

    // Calculate earnings
    const earnings = completed_quantity * job[0].pay_per_unit;

    await pool.query('COMMIT');
    
    res.json({ 
      success: true,
      message: 'Completed quantity updated successfully',
      data: {
        completed_quantity,
        earnings
      }
    });
  } catch (error) {
    await pool.query('ROLLBACK');
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};