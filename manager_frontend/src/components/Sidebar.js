import './Sidebar.css';

import {
  AppBar,
  Avatar,
  Box,
  Chip,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';

import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import TaskIcon from '@mui/icons-material/Task';
import axios from 'axios';

// Import more appropriate icons










const Sidebar = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true);

  const toggleDrawer = () => {
    setOpen(!open);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  useEffect(() => {
    const fetchUsername = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await axios.get('http://localhost:4000/api/guides/get_guide', {
          headers: {
            token: token
          }
        });
        setUsername(response.data.user.supervisor_name);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching username:', error);
        setLoading(false);
      }
    };

    fetchUsername();
  }, []);

  // Updated menu items with more appropriate icons
  const menuItems = [
    { text: 'Add Products', icon: <AddShoppingCartIcon />, path: '/Add-products' },
    { text: 'List Products', icon: <FormatListBulletedIcon />, path: '/list-products' },
    { text: 'List Task', icon: <TaskIcon />, path: '/list-task' },
    { text: 'Orders', icon: <ShoppingCartIcon />, path: '/n-orders' },
    { text: 'Salary Management', icon: <MonetizationOnIcon />, path: '/salary' },
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
            <Typography variant="h6" sx={{ color: '#ecf0f1', fontWeight: 500 }}>Production Manager</Typography>
          </Toolbar>
        </AppBar>
      )}

      <Drawer
        sx={{
          width: 280,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 280,
            boxSizing: 'border-box',
            background: 'linear-gradient(to bottom, #2c3e50, #34495e)',
            color: '#ecf0f1',
          },
        }}
        variant={isMobile ? 'temporary' : 'permanent'}
        anchor="left"
        open={open}
        onClose={toggleDrawer}
        ModalProps={{
          keepMounted: true,
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '20px 10px',
            backgroundColor: 'rgba(0,0,0,0.15)'
          }}
        >
          <Avatar
            sx={{
              bgcolor: '#ecf0f1',
              color: '#2c3e50',
              width: 70,
              height: 70,
              mb: 1,
              boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
            }}
          >
            <BusinessCenterIcon sx={{ fontSize: 40 }} />
          </Avatar>

          <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.2rem', color: '#ecf0f1' }}>
            Production Management
          </Typography>

          <Chip
            label={loading ? "Loading..." : "Production Manager"}
            variant="outlined"
            size="small"
            sx={{
              color: '#ecf0f1',
              borderColor: 'rgba(236,240,241,0.6)',
              mt: 1,
              fontSize: '0.85rem',
              '& .MuiChip-label': {
                fontWeight: 500
              }
            }}
          />
        </Box>

        <Box sx={{ overflow: 'auto', overflowX: 'hidden', mt: 2, flexGrow: 1 }}>
          <List>
            {menuItems.map((item, index) => (
              <React.Fragment key={item.text}>
                <ListItem
                  button
                  component={Link}
                  to={item.path}
                  sx={{
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.1)',
                    },
                    borderRadius: '4px',
                    mx: 1,
                    mb: 0.5
                  }}
                >
                  <ListItemIcon sx={{ color: 'rgba(255,255,255,0.8)', minWidth: '40px' }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItem>
                {index < menuItems.length - 1 && (
                  <Divider sx={{ my: 0.5, backgroundColor: 'rgba(255,255,255,0.1)', mx: 2 }} />
                )}
              </React.Fragment>
            ))}
          </List>
        </Box>

        {/* Logout button */}
        <Divider sx={{ backgroundColor: 'rgba(255,255,255,0.2)', mt: 2 }} />
        <List>
          <ListItem
            button
            onClick={handleLogout}
            sx={{
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.1)',
              },
              borderRadius: '4px',
              mx: 1,
              mt: 1,
              mb: 2
            }}
          >
            <ListItemIcon sx={{ color: 'rgba(255,255,255,0.8)', minWidth: '40px' }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItem>
        </List>
      </Drawer>

      <Box sx={{ marginLeft: isMobile ? 0 : 280, transition: 'margin 0.3s' }}>
        {/* Main content goes here */}
      </Box>
    </Box>
  );
};

export default Sidebar;