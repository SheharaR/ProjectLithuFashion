import './Sidebar.css';

import {
  AppBar,
  Avatar,
  Box,
  Button,
  CircularProgress,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  TextField,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
  Logout as LogoutIcon,
  Menu as MenuIcon,
  MonetizationOn as MonetizationOnIcon,
  Person as PersonIcon,
  Work as WorkIcon,
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';

import axios from 'axios';

const Sidebar = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [employee, setEmployee] = useState({});
  const [editMode, setEditMode] = useState(false);
  const navigate = useNavigate();

  const toggleDrawer = () => setOpen(!open);
  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  useEffect(() => {
    const fetchEmployee = async () => {
      const token = localStorage.getItem('employeeToken');
      try {
        const response = await axios.get('http://localhost:4000/api/employees/get', {
          headers: { token }
        });
        setEmployee(response.data.employee);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch employee:', error);
        setLoading(false);
      }
    };

    fetchEmployee();
  }, []);

  const handleUpdate = async () => {
    const token = localStorage.getItem('employeeToken');
    try {
      await axios.put(
        'http://localhost:4000/api/employees/update',
        {
          employee_id: employee.employee_id,
          employee_name: employee.employee_name,
          email: employee.email,
          phone: employee.phone
        },
        {
          headers: { token }
        }
      );
      alert('Employee updated successfully!');
      setEditMode(false);
    } catch (error) {
      console.error('Failed to update employee:', error);
      alert('Update failed.');
    }
  };

  const handleChange = (e) => {
    setEmployee({ ...employee, [e.target.name]: e.target.value });
  };

  const menuItems = [
    { text: 'Available Task', icon: <AssignmentIcon />, path: '/available-task' },
    { text: 'Job Management', icon: <WorkIcon />, path: '/job-management' },
    { text: 'My Salary', icon: <MonetizationOnIcon />, path: '/my-salary' },
  ];

  return (
    <Box>
      {isMobile && (
        <AppBar position="sticky" sx={{ backgroundColor: '#2c3e50' }}>
          <Toolbar>
            <IconButton
              color="inherit"
              edge="start"
              onClick={toggleDrawer}
              aria-label="menu"
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" sx={{ color: '#ecf0f1', fontWeight: 500 }}>Tour Management</Typography>
          </Toolbar>
        </AppBar>
      )}

      <Drawer
        sx={{
          width: 260,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 260,
            boxSizing: 'border-box',
            background: 'linear-gradient(to bottom, #2c3e50, #34495e)',
            color: '#ecf0f1',
            paddingTop: '20px',
          },
        }}
        variant={isMobile ? 'temporary' : 'permanent'}
        anchor="left"
        open={open}
        onClose={toggleDrawer}
        ModalProps={{ keepMounted: true }}
      >
        <Box sx={{ textAlign: 'center', padding: '20px', marginBottom: '20px', backgroundColor: 'rgba(0,0,0,0.15)' }}>
          <Avatar
            sx={{
              bgcolor: '#ecf0f1',
              color: '#2c3e50',
              width: '80px',
              height: '80px',
              margin: '0 auto',
              boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
            }}
          >
            <PersonIcon sx={{ fontSize: '40px' }} />
          </Avatar>
          {loading ? (
            <CircularProgress sx={{ color: '#3498db', mt: 2 }} size={24} />
          ) : (
            <>
              {editMode ? (
                <>
                  <TextField
                    fullWidth
                    variant="standard"
                    name="employee_name"
                    value={employee.employee_name}
                    onChange={handleChange}
                    sx={{ input: { color: '#ecf0f1' }, mt: 1 }}
                  />
                  <TextField
                    fullWidth
                    variant="standard"
                    name="email"
                    value={employee.email}
                    onChange={handleChange}
                    sx={{ input: { color: '#ecf0f1' }, mt: 1 }}
                  />
                  <TextField
                    fullWidth
                    variant="standard"
                    name="phone"
                    value={employee.phone}
                    onChange={handleChange}
                    sx={{ input: { color: '#ecf0f1' }, mt: 1 }}
                  />
                  <Button
                    onClick={handleUpdate}
                    variant="contained"
                    sx={{ mt: 2, backgroundColor: '#27ae60', color: '#fff' }}
                  >
                    Save
                  </Button>
                </>
              ) : (
                <>
                  <Typography variant="h6" sx={{ color: '#ecf0f1', fontWeight: 600, mt: 2 }}>
                    {employee.employee_name}
                  </Typography>
                  <Typography variant="body2">{employee.email}</Typography>
                  <Typography variant="body2">{employee.phone}</Typography>
                  <Button
                    onClick={() => setEditMode(true)}
                    sx={{ mt: 2, color: '#3498db', borderColor: '#3498db' }}
                    variant="outlined"
                  >
                    Edit
                  </Button>
                </>
              )}
            </>
          )}
        </Box>

        <Divider sx={{ backgroundColor: 'rgba(236,240,241,0.15)', mb: 2 }} />

        <List sx={{ px: 1 }}>
          {menuItems.map((item, index) => (
            <React.Fragment key={item.text}>
              <ListItem
                button
                component={Link}
                to={item.path}
                sx={{
                  borderRadius: '8px',
                  mb: 1,
                  '&:hover': {
                    backgroundColor: 'rgba(52, 152, 219, 0.15)',
                  },
                }}
              >
                <ListItemIcon sx={{ color: '#3498db', minWidth: '40px' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    sx: { color: '#ecf0f1', fontWeight: 500 }
                  }}
                />
              </ListItem>
              {index < menuItems.length - 1 && (
                <Divider sx={{ my: 1, backgroundColor: 'rgba(236,240,241,0.1)', mx: 2 }} />
              )}
            </React.Fragment>
          ))}
        </List>

        <Box sx={{ position: 'absolute', bottom: '20px', width: 'calc(100% - 32px)', mx: '16px' }}>
          <Button
            variant="contained"
            fullWidth
            onClick={handleLogout}
            startIcon={<LogoutIcon />}
            sx={{
              backgroundColor: '#e74c3c',
              '&:hover': {
                backgroundColor: '#c0392b',
              },
              borderRadius: '8px',
              py: 1,
              textTransform: 'none',
              fontWeight: 600,
              boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
            }}
          >
            Logout
          </Button>
        </Box>
      </Drawer>

      <Box sx={{ marginLeft: isMobile ? 0 : 260, transition: 'margin 0.3s' }}>
        {/* Main content goes here */}
      </Box>
    </Box>
  );
};

export default Sidebar;
