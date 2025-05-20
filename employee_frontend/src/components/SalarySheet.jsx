import './SalarySheet.css';

import React, { useEffect, useState } from 'react';

import autoTable from 'jspdf-autotable';
import axios from 'axios';
import jsPDF from 'jspdf';

const SalarySheet = () => {
  const [salaryData, setSalaryData] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('employeeToken'); // Get token from localStorage

  useEffect(() => {
    const fetchSalaryData = async () => {
      try {
        const response = await axios.get('http://localhost:4000/api/salaries/employee_id', {
          headers: {
            token,
          },
        });
        setSalaryData(response.data);
      } catch (error) {
        console.error('Error fetching salary data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSalaryData();
  }, [token]);

  const generatePDF = (record) => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Salary Sheet', 14, 20);

    doc.setFontSize(12);
    doc.text(`Employee Name: ${record.employee_name}`, 14, 30);
    doc.text(`Email: ${record.email}`, 14, 38);
    doc.text(`Phone: ${record.phone}`, 14, 46);
    doc.text(`Period: ${record.period}`, 14, 54);
    doc.text(`Base Salary: Rs. ${record.base_salary}`, 14, 62);
    doc.text(`Bonus: Rs. ${record.bonus}`, 14, 70);
    doc.text(`Total Salary: Rs. ${record.total_salary}`, 14, 78);
    doc.text(`Generated On: ${new Date().toLocaleDateString()}`, 14, 86);

    autoTable(doc, {
      startY: 96,
      head: [[
        'Job Name', 'Quantity', 'Pay/Unit', 'Subtotal',
        'Task Description', 'Completed', 'Assigned', '% Complete'
      ]],
      body: record.tasks.map(task => [
        task.job_name,
        task.quantity,
        `Rs. ${task.pay_per_unit}`,
        `Rs. ${task.subtotal}`,
        task.task_description,
        task.completed_quantity,
        task.assigned_quantity,
        `${task.completion_percentage}%`
      ]),
    });

    doc.save(`SalarySheet_${record.period}.pdf`);
  };

  if (loading) return <p className="text-center text-gray-600 mt-10">Loading salary data...</p>;

  if (salaryData.length === 0) return <p className="text-center text-red-600 mt-10">No salary records found.</p>;

  return (
    <div className="salary-container">
  <h2 className="salary-title">Salary Records</h2>
  {salaryData.map((record) => (
    <div key={record.salary_id} className="salary-card">
      <div className="salary-info">
        <p><strong>Employee:</strong> {record.employee_name}</p>
        <p><strong>Email:</strong> {record.email}</p>
        <p><strong>Phone:</strong> {record.phone}</p>
        <p><strong>Period:</strong> {record.period}</p>
        <p><strong>Base Salary:</strong> Rs. {record.base_salary}</p>
        <p><strong>Bonus:</strong> Rs. {record.bonus}</p>
        <p><strong>Total Salary:</strong> Rs. {record.total_salary}</p>
      </div>

      <h4 className="task-title">Tasks</h4>
      <table className="salary-table">
        <thead>
          <tr>
            <th>Job</th>
            <th>Qty</th>
            <th>Pay/Unit</th>
            <th>Subtotal</th>
            <th>Description</th>
            <th>Completed</th>
            <th>Assigned</th>
            <th>% Complete</th>
          </tr>
        </thead>
        <tbody>
          {record.tasks.map((task, i) => (
            <tr key={i}>
              <td>{task.job_name}</td>
              <td>{task.quantity}</td>
              <td>Rs. {task.pay_per_unit}</td>
              <td>Rs. {task.subtotal}</td>
              <td>{task.task_description}</td>
              <td>{task.completed_quantity}</td>
              <td>{task.assigned_quantity}</td>
              <td>{task.completion_percentage}%</td>
            </tr>
          ))}
        </tbody>
      </table>

      <button
        onClick={() => generatePDF(record)}
        className="pdf-button"
      >
        Download PDF
      </button>
    </div>
  ))}
</div>
  );
};

export default SalarySheet;
