import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import pool from '../config/db.js';

export const generateReports = async (req, res) => {
  try {
    // 1. Fetch all necessary data in parallel
    const [
      orders, 
      jobs, 
      assignments, 
      customers,
      employees,
      orderItems,
      salaries
    ] = await Promise.all([
      pool.query('SELECT * FROM orders'),
      pool.query('SELECT * FROM jobs'),
      pool.query('SELECT * FROM employee_job_assignments'),
      pool.query('SELECT * FROM customers'),
      pool.query('SELECT * FROM employees'),
      pool.query('SELECT * FROM order_items'),
      pool.query('SELECT * FROM salaries')
    ]);

    // 2. Process data for analytics
    const analytics = {
      // Order analytics
      orderStats: {
        totalOrders: orders[0].length,
        totalRevenue: orders[0].reduce((sum, order) => sum + parseFloat(order.total_amount), 0),
        paymentMethods: orders[0].reduce((acc, order) => {
          acc[order.payment_method] = (acc[order.payment_method] || 0) + 1;
          return acc;
        }, {}),
        orderStatuses: orders[0].reduce((acc, order) => {
          acc[order.current_status] = (acc[order.current_status] || 0) + 1;
          return acc;
        }, {})
      },

      // Job analytics
      jobStats: {
        totalJobs: jobs[0].length,
        activeJobs: jobs[0].filter(job => job.is_active).length,
        completedJobs: jobs[0].filter(job => !job.is_active).length,
        jobStatuses: jobs[0].reduce((acc, job) => {
          const status = job.is_active ? 'active' : 'completed';
          acc[status] = (acc[status] || 0) + 1;
          return acc;
        }, {})
      },

      // Employee assignment analytics
      assignmentStats: {
        totalAssignments: assignments[0].length,
        assignmentStatuses: assignments[0].reduce((acc, assignment) => {
          acc[assignment.status] = (acc[assignment.status] || 0) + 1;
          return acc;
        }, {}),
        completionStats: assignments[0].reduce((acc, assignment) => {
          const percent = Math.round((assignment.completed_quantity / assignment.assigned_quantity) * 100) || 0;
          const range = Math.floor(percent / 25) * 25;
          const key = `${range}-${range + 25}%`;
          acc[key] = (acc[key] || 0) + 1;
          return acc;
        }, {})
      },

      // Customer analytics
      customerStats: {
        totalCustomers: customers[0].length,
        customersWithOrders: [...new Set(orders[0].map(order => order.customer_id))].length,
        topCustomers: []
      },

      // Employee analytics
      employeeStats: {
        totalEmployees: employees[0].length,
        topPerformers: []
      }
    };

    // Calculate top customers by order value
    const customerOrderTotals = {};
    orders[0].forEach(order => {
      if (!customerOrderTotals[order.customer_id]) {
        customerOrderTotals[order.customer_id] = 0;
      }
      customerOrderTotals[order.customer_id] += parseFloat(order.total_amount);
    });

    // Get top 5 customers
    analytics.customerStats.topCustomers = Object.entries(customerOrderTotals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([customerId, total]) => {
        const customer = customers[0].find(c => c.CustomerID == customerId);
        return {
          customerId,
          customerName: customer ? customer.customer_name : 'Unknown',
          totalSpent: total,
          orderCount: orders[0].filter(o => o.customer_id == customerId).length
        };
      });

    // Calculate top employees by completed tasks and earnings
    const employeePerformance = {};
    assignments[0].forEach(assignment => {
      if (assignment.status === 'accepted') {
        if (!employeePerformance[assignment.employee_id]) {
          employeePerformance[assignment.employee_id] = {
            completedTasks: 0,
            totalEarnings: 0,
            completedQuantity: 0
          };
        }
        employeePerformance[assignment.employee_id].completedTasks++;
        employeePerformance[assignment.employee_id].completedQuantity += assignment.completed_quantity;
      }
    });

    // Add salary information to employee performance
    salaries[0].forEach(salary => {
      if (employeePerformance[salary.employee_id]) {
        employeePerformance[salary.employee_id].totalEarnings += parseFloat(salary.total_salary);
      }
    });

    // Get top 5 employees
    analytics.employeeStats.topPerformers = Object.entries(employeePerformance)
      .sort((a, b) => b[1].completedQuantity - a[1].completedQuantity)
      .slice(0, 5)
      .map(([employeeId, stats]) => {
        const employee = employees[0].find(e => e.employee_id == employeeId);
        return {
          employeeId,
          employeeName: employee ? employee.employee_name : 'Unknown',
          completedTasks: stats.completedTasks,
          completedQuantity: stats.completedQuantity,
          totalEarnings: stats.totalEarnings
        };
      });

    // 3. Generate PDF report if requested
    if (req.query.download === 'pdf') {
      const doc = new PDFDocument();
      const filePath = path.join(process.cwd(), 'reports', `report-${Date.now()}.pdf`);
      
      // Ensure reports directory exists
      if (!fs.existsSync(path.dirname(filePath))) {
        fs.mkdirSync(path.dirname(filePath), { recursive: true });
      }

      // Pipe PDF to file
      doc.pipe(fs.createWriteStream(filePath));
      
      // PDF Content
      doc.fontSize(20).text('Business Analytics Report', { align: 'center' });
      doc.moveDown();
      
      // Order Statistics
      doc.fontSize(16).text('Order Statistics', { underline: true });
      doc.fontSize(12).text(`Total Orders: ${analytics.orderStats.totalOrders}`);
      doc.text(`Total Revenue: LKR${analytics.orderStats.totalRevenue.toFixed(2)}`);
      
      // Payment Methods
      doc.moveDown();
      doc.text('Payment Methods:');
      Object.entries(analytics.orderStats.paymentMethods).forEach(([method, count]) => {
        doc.text(`- ${method}: ${count} orders`);
      });
      
      // Order Statuses
      doc.moveDown();
      doc.text('Order Statuses:');
      Object.entries(analytics.orderStats.orderStatuses).forEach(([status, count]) => {
        doc.text(`- ${status}: ${count} orders`);
      });
      
      // Top Customers
      doc.addPage();
      doc.fontSize(16).text('Top Customers', { underline: true });
      analytics.customerStats.topCustomers.forEach((customer, index) => {
        doc.moveDown();
        doc.text(`${index + 1}. ${customer.customerName}`);
        doc.text(`   Customer ID: ${customer.customerId}`);
        doc.text(`   Total Spent: LKR${customer.totalSpent.toFixed(2)}`);
        doc.text(`   Orders Placed: ${customer.orderCount}`);
      });
      
      // Top Employees
      doc.addPage();
      doc.fontSize(16).text('Top Performing Employees', { underline: true });
      analytics.employeeStats.topPerformers.forEach((employee, index) => {
        doc.moveDown();
        doc.text(`${index + 1}. ${employee.employeeName}`);
        doc.text(`   Employee ID: ${employee.employeeId}`);
        doc.text(`   Completed Tasks: ${employee.completedTasks}`);
        doc.text(`   Completed Quantity: ${employee.completedQuantity}`);
        doc.text(`   Total Earnings: LKR${employee.totalEarnings.toFixed(2)}`);
      });
      
      // Job Statistics
      doc.addPage();
      doc.fontSize(16).text('Job Statistics', { underline: true });
      doc.text(`Total Jobs: ${analytics.jobStats.totalJobs}`);
      doc.text(`Active Jobs: ${analytics.jobStats.activeJobs}`);
      doc.text(`Completed Jobs: ${analytics.jobStats.completedJobs}`);
      
      doc.end();
      
      // Send file when ready
      doc.on('finish', () => {
        res.download(filePath, 'business-report.pdf', (err) => {
          if (err) console.error('Error sending PDF:', err);
          fs.unlinkSync(filePath); // Delete temp file
        });
      });
      
      return;
    }

    // 4. Return JSON data if not downloading PDF
    res.json({
      success: true,
      data: analytics,
      charts: {
        paymentMethodChart: Object.entries(analytics.orderStats.paymentMethods).map(([method, count]) => ({
          name: method,
          value: count
        })),
        jobStatusChart: Object.entries(analytics.jobStats.jobStatuses).map(([status, count]) => ({
          name: status,
          value: count
        })),
        assignmentStatusChart: Object.entries(analytics.assignmentStats.assignmentStatuses).map(([status, count]) => ({
          name: status,
          value: count
        })),
        completionRateChart: Object.entries(analytics.assignmentStats.completionStats).map(([range, count]) => ({
          name: range,
          value: count
        })),
        topCustomersChart: analytics.customerStats.topCustomers.map(customer => ({
          name: customer.customerName,
          value: customer.totalSpent
        })),
        topEmployeesChart: analytics.employeeStats.topPerformers.map(employee => ({
          name: employee.employeeName,
          value: employee.completedQuantity
        }))
      }
    });

  } catch (error) {
    console.error('Error generating reports:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to generate reports',
      error: error.message
    });
  }
};