import React, { useEffect, useState } from 'react';
import axios from 'axios';

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch real employee data from database
    const fetchEmployees = async () => {
      try {
        const response = await axios.get('http://localhost:4000/api/employees/get_all');
        if (response.data.success) {
          setEmployees(response.data.employees);
        } else {
          console.error('Failed to fetch employees:', response.data.message);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching employees:', error);
        setLoading(false);
      }
    };
    
    fetchEmployees();
  }, []);

  // Custom styles
  const styles = {
    container: {
      padding: "2rem",
      maxWidth: "1200px",
      margin: "0 auto",
      fontFamily: "Inter, system-ui, sans-serif"
    },
    header: {
      fontSize: "1.875rem",
      fontWeight: "700",
      marginBottom: "1.5rem",
      color: "#1e293b",
      borderBottom: "2px solid #e2e8f0",
      paddingBottom: "0.75rem"
    },
    table: {
      width: "100%",
      borderCollapse: "separate",
      borderSpacing: "0",
      borderRadius: "0.5rem",
      overflow: "hidden",
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
    },
    tableHead: {
      backgroundColor: "#f1f5f9"
    },
    tableHeaderCell: {
      padding: "1rem",
      textAlign: "left",
      fontWeight: "600",
      color: "#475569",
      borderBottom: "2px solid #e2e8f0"
    },
    tableRow: {
      transition: "background-color 0.2s"
    },
    tableRowHover: {
      backgroundColor: "#f8fafc"
    },
    tableCell: {
      padding: "1rem",
      borderBottom: "1px solid #e2e8f0",
      color: "#334155"
    },
    loadingState: {
      padding: "2rem",
      textAlign: "center",
      color: "#64748b",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "200px"
    },
    emptyState: {
      padding: "3rem",
      textAlign: "center",
      color: "#64748b",
      fontStyle: "italic"
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64" style={styles.loadingState}>
        <div className="text-lg">Loading employees data...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>Employee Directory</h2>
      
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table style={styles.table}>
          <thead style={styles.tableHead}>
            <tr>
              <th style={styles.tableHeaderCell}>ID</th>
              <th style={styles.tableHeaderCell}>Name</th>
              <th style={styles.tableHeaderCell}>Email</th>
              <th style={styles.tableHeaderCell}>Phone</th>
            </tr>
          </thead>
          <tbody>
            {employees.length === 0 ? (
              <tr>
                <td colSpan="4" style={styles.emptyState}>No employees found in the database.</td>
              </tr>
            ) : (
              employees.map((emp, index) => (
                <tr 
                  key={emp.employee_id} 
                  style={{
                    ...styles.tableRow,
                    backgroundColor: index % 2 === 0 ? 'white' : '#f8fafc'
                  }}
                  className="hover:bg-gray-50"
                >
                  <td style={styles.tableCell}>{emp.employee_id}</td>
                  <td style={styles.tableCell}>{emp.employee_name}</td>
                  <td style={styles.tableCell}>{emp.email}</td>
                  <td style={styles.tableCell}>{emp.phone}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EmployeeList;