import pool from '../config/db.js';

// Get employees for salary calculation
export const getEmployeesForSalary = async (req, res) => {
  try {
    const { month, year } = req.body;
    const [employees] = await pool.query(`
      SELECT 
        e.employee_id, 
        e.employee_name,
        CAST(SUM(eja.completed_quantity * j.pay_per_unit) AS DECIMAL(10,2)) AS base_salary
      FROM 
        employees e
      JOIN 
        employee_job_assignments eja ON e.employee_id = eja.employee_id
      JOIN 
        jobs j ON eja.job_id = j.job_id
      WHERE 
        eja.status = 'accepted' 
        AND eja.completed_quantity > 0
        AND MONTH(eja.updated_at) = ? 
        AND YEAR(eja.updated_at) = ?
      GROUP BY 
        e.employee_id
    `, [month, year]);

    const formatted = employees.map(e => ({
      ...e,
      base_salary: Number(e.base_salary)
    }));

    res.json(formatted);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Create salary for an employee
export const createSalary = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { employee_id, month, year, bonus } = req.body;

    // 🔒 Check for existing salary for the same employee and period
    const [existingSalary] = await connection.query(`
      SELECT salary_id FROM salaries 
      WHERE employee_id = ? AND month = ? AND year = ?
    `, [employee_id, month, year]);

    if (existingSalary.length > 0) {
      return res.status(400).json({ message: 'Salary already created for this employee in the specified period' });
    }

    const [completedJobs] = await connection.query(`
      SELECT 
        eja.job_id,
        j.job_name,
        eja.completed_quantity,
        j.pay_per_unit,
        (eja.completed_quantity * j.pay_per_unit) AS subtotal
      FROM 
        employee_job_assignments eja
      JOIN 
        jobs j ON eja.job_id = j.job_id
      WHERE 
        eja.employee_id = ? 
        AND eja.status = 'accepted' 
        AND eja.completed_quantity > 0
        AND MONTH(eja.updated_at) = ? 
        AND YEAR(eja.updated_at) = ?
    `, [employee_id, month, year]);

    if (completedJobs.length === 0) {
      return res.status(400).json({ message: 'No completed jobs found for this employee in the specified period' });
    }

    const jobs = completedJobs.map(job => ({
      ...job,
      subtotal: Number(job.subtotal),
      pay_per_unit: Number(job.pay_per_unit),
      completed_quantity: Number(job.completed_quantity)
    }));

    const base_salary = jobs.reduce((sum, job) => sum + job.subtotal, 0);
    const total_salary = base_salary + Number(bonus || 0);

    const [salaryResult] = await connection.query(`
      INSERT INTO salaries 
        (employee_id, month, year, base_salary, bonus, total_salary)
      VALUES 
        (?, ?, ?, ?, ?, ?)
    `, [employee_id, month, year, base_salary, bonus, total_salary]);

    const salary_id = salaryResult.insertId;

    for (const job of jobs) {
      await connection.query(`
        INSERT INTO salary_details 
          (salary_id, job_id, quantity, pay_per_unit, subtotal)
        VALUES 
          (?, ?, ?, ?, ?)
      `, [salary_id, job.job_id, job.completed_quantity, job.pay_per_unit, job.subtotal]);
    }

    await connection.commit();
    res.status(201).json({ message: 'Salary created successfully', salary_id });
  } catch (error) {
    await connection.rollback();
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  } finally {
    connection.release();
  }
};

// Get salary details for admin
export const getSalaryDetailsForAdmin = async (req, res) => {
  try {
    const [salaries] = await pool.query(`
      SELECT 
        s.salary_id,
        e.employee_id,
        e.employee_name,
        s.month,
        s.year,
        s.base_salary,
        s.bonus,
        s.total_salary,
        s.created_at
      FROM 
        salaries s
      JOIN 
        employees e ON s.employee_id = e.employee_id
      ORDER BY 
        s.year DESC, s.month DESC, e.employee_name ASC
    `);

    const formatted = salaries.map(s => ({
      ...s,
      base_salary: Number(s.base_salary),
      bonus: Number(s.bonus),
      total_salary: Number(s.total_salary)
    }));

    res.json(formatted);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const getSalaryDetailsForEmployee = async (req, res) => {
  try {
    const employee_id = req.body.userId;

    // Get basic salary information along with employee details
    const [salaryData] = await pool.query(`
      SELECT 
        s.salary_id,
        s.month,
        s.year,
        s.base_salary,
        s.bonus,
        s.total_salary,
        s.created_at,
        e.employee_name,
        e.email,
        e.phone
      FROM 
        salaries s
      JOIN 
        employees e ON s.employee_id = e.employee_id
      WHERE 
        s.employee_id = ?
      ORDER BY 
        s.year DESC, s.month DESC
    `, [employee_id]);

    // Get detailed breakdown for each salary record
    const salariesWithDetails = await Promise.all(
      salaryData.map(async (salary) => {
        // Get all completed tasks for this salary
        const [tasks] = await pool.query(`
          SELECT 
            sd.job_id,
            j.job_name,
            sd.quantity,
            sd.pay_per_unit,
            sd.subtotal,
            j.description as task_description,
            eja.completed_quantity,
            eja.assigned_quantity
          FROM 
            salary_details sd
          JOIN 
            jobs j ON sd.job_id = j.job_id
          LEFT JOIN
            employee_job_assignments eja ON eja.job_id = j.job_id AND eja.employee_id = ?
          WHERE 
            sd.salary_id = ?
        `, [employee_id, salary.salary_id]);

        return {
          ...salary,
          base_salary: Number(salary.base_salary),
          bonus: Number(salary.bonus),
          total_salary: Number(salary.total_salary),
          period: `${salary.month}/${salary.year}`,
           
          tasks: tasks.map(task => ({
            ...task,
            quantity: Number(task.quantity),
            pay_per_unit: Number(task.pay_per_unit),
            subtotal: Number(task.subtotal),
            completed_quantity: Number(task.completed_quantity || 0),
            assigned_quantity: Number(task.assigned_quantity || 0),
            completion_percentage: task.assigned_quantity > 0 
              ? Math.round((task.completed_quantity / task.assigned_quantity) * 100)
              : 0
          }))
        };
      })
    );

    res.json(salariesWithDetails);
  } catch (error) {
    console.error('Error in getSalaryDetailsForEmployee:', error);
    res.status(500).json({ 
      message: 'Server Error',
      error: error.message 
    });
  }
};
// Get salary breakdown
export const getSalaryBreakdown = async (req, res) => {
  try {
    const { salary_id } = req.params;

    const [salary] = await pool.query(`
      SELECT 
        s.*,
        e.employee_name,
        e.email
      FROM 
        salaries s
      JOIN 
        employees e ON s.employee_id = e.employee_id
      WHERE 
        s.salary_id = ?
    `, [salary_id]);

    if (salary.length === 0) {
      return res.status(404).json({ message: 'Salary record not found' });
    }

    const [details] = await pool.query(`
      SELECT 
        sd.*,
        j.job_name
      FROM 
        salary_details sd
      JOIN 
        jobs j ON sd.job_id = j.job_id
      WHERE 
        sd.salary_id = ?
    `, [salary_id]);

    const formattedDetails = details.map(d => ({
      ...d,
      quantity: Number(d.quantity),
      pay_per_unit: Number(d.pay_per_unit),
      subtotal: Number(d.subtotal)
    }));

    res.json({
      ...salary[0],
      base_salary: Number(salary[0].base_salary),
      bonus: Number(salary[0].bonus),
      total_salary: Number(salary[0].total_salary),
      details: formattedDetails
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};
