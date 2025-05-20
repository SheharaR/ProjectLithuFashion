import React, { useEffect, useState } from 'react';
import axios from 'axios';

const CustomerList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch real customer data from database
    const fetchCustomers = async () => {
      try {
        const response = await axios.get('http://localhost:4000/api/user/get_users');
        if (response.data.success) {
          setUsers(response.data.users);
        } else {
          console.error('Failed to fetch users:', response.data.message);
        }
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch users', error);
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  // Avatar component with initials
  const Avatar = ({ name, src }) => {
    const getInitials = (name) => {
      return name ? name.charAt(0).toUpperCase() : '?';
    };

    const avatarStyle = {
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      backgroundColor: src ? 'transparent' : getRandomColor(name),
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontWeight: '500',
      fontSize: '16px'
    };

    return (
      <div style={avatarStyle}>
        {src ? (
          <img 
            src={src} 
            alt={name} 
            style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} 
          />
        ) : (
          getInitials(name)
        )}
      </div>
    );
  };

  // Generate consistent random color based on name
  const getRandomColor = (name) => {
    if (!name) return '#6B7280';
    
    const colors = [
      '#4F46E5', '#0891B2', '#2563EB', '#7C3AED', 
      '#DB2777', '#9333EA', '#16A34A', '#EA580C'
    ];
    
    // Simple hash function to get consistent color for same name
    const hash = name.split('').reduce((acc, char) => char.charCodeAt(0) + acc, 0);
    return colors[hash % colors.length];
  };

  const styles = {
    container: {
      padding: '24px',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
    },
    title: {
      fontSize: '1.5rem',
      fontWeight: '600',
      color: '#111827',
      marginBottom: '16px',
      padding: '0 0 12px 0',
      borderBottom: '1px solid #E5E7EB'
    },
    paper: {
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
      overflow: 'hidden'
    },
    tableContainer: {
      overflowX: 'auto',
      borderRadius: '8px'
    },
    table: {
      width: '100%',
      borderCollapse: 'separate',
      borderSpacing: '0',
      tableLayout: 'fixed'
    },
    tableHead: {
      backgroundColor: '#F9FAFB',
      position: 'sticky',
      top: 0
    },
    tableHeadCell: {
      padding: '12px 16px',
      textAlign: 'left',
      color: '#4B5563',
      fontWeight: '600',
      fontSize: '14px',
      borderBottom: '2px solid #E5E7EB',
      whiteSpace: 'nowrap'
    },
    tableBodyRow: {
      borderBottom: '1px solid #F3F4F6',
      transition: 'background-color 0.2s ease',
      ':hover': {
        backgroundColor: '#F9FAFB'
      }
    },
    tableBodyCell: {
      padding: '12px 16px',
      color: '#374151',
      fontSize: '14px',
      borderBottom: '1px solid #E5E7EB',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    },
    loadingContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '40px',
      height: '200px'
    },
    spinner: {
      width: '40px',
      height: '40px',
      border: '4px solid rgba(0, 0, 0, 0.1)',
      borderLeft: '4px solid #3B82F6',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    },
    '@keyframes spin': {
      '0%': { transform: 'rotate(0deg)' },
      '100%': { transform: 'rotate(360deg)' }
    }
  };

  // Custom Spinner component
  const Spinner = () => {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Customer List</h2>
      
      {loading ? (
        <div className="flex justify-center items-center min-h-64">
          <Spinner />
        </div>
      ) : (
        <div style={styles.paper}>
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead style={styles.tableHead}>
                <tr>
                  <th style={{ ...styles.tableHeadCell, width: '70px' }}>Profile</th>
                  <th style={styles.tableHeadCell}>Name</th>
                  <th style={styles.tableHeadCell}>Email</th>
                  <th style={styles.tableHeadCell}>Phone</th>
                  <th style={styles.tableHeadCell}>Shop Name</th>
                  <th style={{ ...styles.tableHeadCell, width: '200px' }}>Shop Address</th>
                  <th style={styles.tableHeadCell}>Join Date</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ ...styles.tableBodyCell, textAlign: 'center', padding: '24px' }}>
                      No customers found
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr 
                      key={user.customer_id} 
                      style={styles.tableBodyRow}
                      className="hover:bg-gray-50"
                    >
                      <td style={{ ...styles.tableBodyCell, width: '70px' }}>
                        <Avatar 
                          name={user.customer_name} 
                          src={user.profile_image ? `http://localhost:4000/uploads/${user.profile_image}` : null} 
                        />
                      </td>
                      <td style={styles.tableBodyCell}>{user.customer_name}</td>
                      <td style={styles.tableBodyCell}>{user.email}</td>
                      <td style={styles.tableBodyCell}>{user.phone}</td>
                      <td style={styles.tableBodyCell}>{user.shop_name || '—'}</td>
                      <td style={{ ...styles.tableBodyCell, width: '200px' }}>{user.shop_address || '—'}</td>
                      <td style={styles.tableBodyCell}>
                        {new Date(user.join_date).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerList;