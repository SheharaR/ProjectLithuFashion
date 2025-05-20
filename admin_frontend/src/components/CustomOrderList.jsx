import {
  Alert,
  Box,
  Card,
  CardContent,
  CardHeader,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Grid,
  Link,
  List,
  ListItem,
  ListItemText,
  Typography
} from '@mui/material';
import React, { useEffect, useState } from 'react';

import axios from 'axios';

const CustomOrderList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get('http://localhost:4000/api/order/all_custom_order');
        if (response.data.success) {
          setOrders(response.data.orders);
        } else {
          setError('Failed to fetch orders');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in_progress':
        return 'warning';
      case 'pending':
        return 'info';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Typography variant="body1">
          Unable to load custom orders. Please try again later.
        </Typography>
      </Container>
    );
  }

  return (
    <Container   maxWidth="md" sx={{ py: 4 }}>
      <Typography 
        variant="h4" 
        component="h1" 
        gutterBottom 
        sx={{ 
          mb: 4, 
          fontWeight: 'medium',
          borderBottom: '2px solid #f0f0f0',
          pb: 2
        }}
      >
        Custom Orders
      </Typography>
      
      {orders.length === 0 ? (
        <Box 
          sx={{ 
            textAlign: 'center', 
            py: 4, 
            backgroundColor: '#f9f9f9', 
            borderRadius: 2 
          }}
        >
          <Typography variant="h6">No custom orders found</Typography>
          <Typography variant="body2" color="text.secondary">
            When customers place custom orders, they will appear here.
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {orders.map((order) => (
            <Grid item xs={12} key={order.orderId}>
              <Card sx={{ 
                boxShadow: 2, 
                transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                '&:hover': {
                  boxShadow: 4,
                  transform: 'translateY(-2px)'
                }
              }}>
                <CardHeader
                  title={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="h6">
                        Custom Order #{order.orderId}
                      </Typography>
                      <Chip
                        label={order.status.replace('_', ' ')}
                        color={getStatusColor(order.status)}
                        sx={{ textTransform: 'capitalize' }}
                      />
                    </Box>
                  }
                  subheader={
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="caption" sx={{ display: 'block' }}>
                        Created: {formatDate(order.createdAt)}
                      </Typography>
                      <Typography variant="caption" sx={{ display: 'block' }}>
                        Updated: {formatDate(order.updatedAt)}
                      </Typography>
                    </Box>
                  }
                />
                
                <CardContent>
                  <Typography 
                    variant="body1" 
                    paragraph 
                    sx={{ 
                      backgroundColor: '#f8f9fa', 
                      p: 2, 
                      borderRadius: 1, 
                      fontStyle: order.description ? 'normal' : 'italic' 
                    }}
                  >
                    {order.description || 'No description provided'}
                  </Typography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <List dense>
                        <ListItem disablePadding sx={{ py: 0.5 }}>
                          <ListItemText 
                            primary={<Typography variant="subtitle2">Customer ID</Typography>}
                            secondary={order.customerId} 
                          />
                        </ListItem>
                        <ListItem disablePadding sx={{ py: 0.5 }}>
                          <ListItemText 
                            primary={<Typography variant="subtitle2">Quantity</Typography>}
                            secondary={order.quantity} 
                          />
                        </ListItem>
                      </List>
                    </Grid>
                    
                    {order.specialNotes && (
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2">Special Notes</Typography>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            mt: 0.5, 
                            color: 'text.secondary',
                            backgroundColor: '#fff9e6',
                            p: 1.5,
                            borderRadius: 1,
                            borderLeft: '4px solid #ffd54f'
                          }}
                        >
                          {order.specialNotes}
                        </Typography>
                      </Grid>
                    )}
                  </Grid>

                  {order.designFiles && order.designFiles.length > 0 && (
                    <>
                      <Divider sx={{ my: 2 }} />
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        Design Files
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {order.designFiles.map((file, index) => (
                          <Chip
                            key={index}
                            label={file.split('-').pop()}
                            component={Link}
                            href={`http://localhost:4000/images/${file}`}
                            target="_blank"
                            rel="noopener"
                            clickable
                            size="small"
                            sx={{ 
                              backgroundColor: '#e3f2fd',
                              '&:hover': {
                                backgroundColor: '#bbdefb'
                              }
                            }}
                          />
                        ))}
                      </Box>
                    </>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default CustomOrderList;