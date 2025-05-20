import './OrderList.css';

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';
import React, { useEffect, useState } from 'react';

import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import EmailIcon from '@mui/icons-material/Email';
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';
import FilterListIcon from '@mui/icons-material/FilterList';
import HomeIcon from '@mui/icons-material/Home';
import InfoIcon from '@mui/icons-material/Info';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import PaymentIcon from '@mui/icons-material/Payment';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import ReceiptIcon from '@mui/icons-material/Receipt';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import axios from 'axios';

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const statusColors = {
    pending: 'warning',
    processing: 'info',
    shipped: 'success',
    delivered: 'success',
    cancelled: 'error',
    returned: 'error',
    default: 'default'
  };

  const paymentStatusColors = {
    paid: 'success',
    pending: 'warning',
    failed: 'error',
    refunded: 'info',
    default: 'default'
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:4000/api/order/all_order');
        setOrders(response.data);
        setFilteredOrders(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [refreshKey]);

  useEffect(() => {
    let filtered = orders;
    
    if (searchTerm) {
      filtered = filtered.filter(order => 
        order.order_id.toString().includes(searchTerm) ||
        (order.customer_id && order.customer_id.toString().includes(searchTerm)) ||
        (order.customer?.name && order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => 
        order.current_status.toLowerCase() === statusFilter
      );
    }
    
    setFilteredOrders(filtered);
  }, [searchTerm, statusFilter, orders]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusFilter = (status) => {
    setStatusFilter(status);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
  };

  const refreshOrders = () => {
    setRefreshKey(oldKey => oldKey + 1);
  };

  const toggleOrderExpansion = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const calculateTotalItems = (items) => {
    return items.reduce((sum, item) => sum + parseInt(item.quantity, 10), 0);
  };

  if (loading) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="60vh">
        <CircularProgress size={60} thickness={4} />
        <Typography variant="h6" mt={2} color="text.secondary">
          Loading orders...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box mt={4} display="flex" justifyContent="center">
        <Alert 
          severity="error" 
          sx={{ width: '100%', maxWidth: 800 }}
          action={
            <Button color="inherit" size="small" onClick={refreshOrders}>
              Try Again
            </Button>
          }
        >
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 3, mb: 5 }}>
      <Paper elevation={0} sx={{ p: 3, borderRadius: 2, backgroundColor: 'transparent' }}>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" component="h1" fontWeight="bold">
            Order Management
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<RefreshIcon />}
            onClick={refreshOrders}
          >
            Refresh
          </Button>
        </Box>

        {/* Search and Filter */}
        <Paper elevation={3} sx={{ p: 2, mb: 4, borderRadius: 2, backgroundColor: 'white' }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={5}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Search by Order ID, Customer ID or Name"
                value={searchTerm}
                onChange={handleSearch}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ color: 'action.active', mr: 1 }} />,
                }}
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={5}>
              <Box display="flex" gap={1} flexWrap="wrap">
                <Chip 
                  icon={<FilterListIcon />} 
                  label="All" 
                  onClick={() => handleStatusFilter('all')}
                  color={statusFilter === 'all' ? 'primary' : 'default'}
                  variant={statusFilter === 'all' ? 'filled' : 'outlined'}
                />
                <Chip 
                  label="Processing" 
                  onClick={() => handleStatusFilter('processing')}
                  color={statusFilter === 'processing' ? 'info' : 'default'}
                  variant={statusFilter === 'processing' ? 'filled' : 'outlined'}
                />
              </Box>
            </Grid>
            <Grid item xs={12} md={2}>
              <Box display="flex" justifyContent="flex-end">
                <Button 
                  variant="outlined" 
                  startIcon={<FilterAltOffIcon />}
                  onClick={resetFilters}
                  disabled={statusFilter === 'all' && !searchTerm}
                >
                  Reset
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Order count */}
        <Box mb={3}>
          <Typography variant="body1" color="text.secondary">
            Showing {filteredOrders.length} of {orders.length} orders
          </Typography>
        </Box>

        {/* Orders list */}
        {filteredOrders.length === 0 ? (
          <Box textAlign="center" py={5}>
            <Typography variant="h6" color="text.secondary">
              No orders found matching your criteria
            </Typography>
            <Button 
              variant="text" 
              color="primary" 
              onClick={resetFilters} 
              sx={{ mt: 2 }}
            >
              Reset Filters
            </Button>
          </Box>
        ) : (
          <Box className="orders-container">
            {filteredOrders.map((order) => (
              <Card 
                key={order.order_id} 
                sx={{ 
                  mb: 3, 
                  borderRadius: 2, 
                  overflow: 'hidden',
                  boxShadow: expandedOrder === order.order_id ? 4 : 2,
                  transition: 'box-shadow 0.3s ease-in-out',
                  border: expandedOrder === order.order_id ? '1px solid #e0e0ff' : 'none',
                }}
              >
                {/* Order Header */}
                <CardHeader
                  sx={{ 
                    backgroundColor: expandedOrder === order.order_id ? '#f5f7ff' : '#f9f9f9',
                    transition: 'background-color 0.3s ease',
                    borderBottom: '1px solid #eaeaea',
                    '&:hover': {
                      backgroundColor: '#f0f2fa'
                    }
                  }}
                  title={
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="h6" component="span">
                        Order #{order.order_id}
                      </Typography>
                      <Typography variant="caption" component="span" sx={{ ml: 1, fontSize: '0.8rem' }}>
                        ({calculateTotalItems(order.items)} items)
                      </Typography>
                    </Box>
                  }
                  subheader={
                    <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                      <CalendarTodayIcon fontSize="small" sx={{ color: 'text.secondary', fontSize: 16 }} />
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(order.order_date)}
                      </Typography>
                    </Box>
                  }
                  action={
                    <Box display="flex" alignItems="center" gap={1}>
                      <Chip
                        label={order.current_status}
                        size="small"
                        color={statusColors[order.current_status.toLowerCase()] || statusColors.default}
                        icon={<LocalShippingIcon />}
                      />
                      <Chip
                        label={order.payment.payment_status}
                        size="small"
                        color={paymentStatusColors[order.payment.payment_status.toLowerCase()] || paymentStatusColors.default}
                        icon={<PaymentIcon />}
                      />
                      <Tooltip title={expandedOrder === order.order_id ? "Hide Details" : "View Details"}>
                        <IconButton 
                          size="small" 
                          onClick={() => toggleOrderExpansion(order.order_id)}
                          sx={{ 
                            transform: expandedOrder === order.order_id ? 'rotate(90deg)' : 'none',
                            transition: 'transform 0.3s ease'
                          }}
                        >
                          <ArrowForwardIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  }
                />

                {/* Order Summary */}
                <CardContent sx={{ pt: 2, pb: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <PersonIcon fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                          Customer: <strong>{order.customer?.name || 'N/A'}</strong>
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <PaymentIcon fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                          Payment: <strong>{order.payment.payment_method}</strong>
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <ReceiptIcon fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                          Total: <strong>{formatCurrency(order.payment.total_amount)}</strong>
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>

                {/* Expanded details section */}
                {expandedOrder === order.order_id && (
                  <>
                    <Divider />
                    <CardContent>
                      <Grid container spacing={3}>
                        {/* Customer Details Column */}
                        <Grid item xs={12} md={4}>
                          <Paper sx={{ p: 2, backgroundColor: '#f9f9f9', borderRadius: 1 }}>
                            <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                              Customer Information
                            </Typography>
                            <List dense>
                              <ListItem>
                                <ListItemText
                                  primary={<Typography variant="body2">Name</Typography>}
                                  secondary={<Typography variant="body1" fontWeight="medium">{order.customer?.name || 'N/A'}</Typography>}
                                />
                              </ListItem>
                              <ListItem>
                                <ListItemText
                                  primary={<Typography variant="body2">Email</Typography>}
                                  secondary={
                                    <Box display="flex" alignItems="center" gap={1}>
                                      <EmailIcon fontSize="small" color="action" />
                                      <Typography variant="body1" fontWeight="medium">
                                        {order.customer?.email || 'N/A'}
                                      </Typography>
                                    </Box>
                                  }
                                />
                              </ListItem>
                              <ListItem>
                                <ListItemText
                                  primary={<Typography variant="body2">Contact</Typography>}
                                  secondary={
                                    <Box display="flex" alignItems="center" gap={1}>
                                      <PhoneIcon fontSize="small" color="action" />
                                      <Typography variant="body1" fontWeight="medium">
                                        {order.shipping.contact_number || order.customer?.contact_number || 'N/A'}
                                      </Typography>
                                    </Box>
                                  }
                                />
                              </ListItem>
                            
                            </List>
                          </Paper>
                        </Grid>

                        {/* Order Items Column */}
                        <Grid item xs={12} md={8}>
                          <Paper sx={{ p: 2, backgroundColor: '#f9f9f9', borderRadius: 1, mb: 2 }}>
                            <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                              Order Items ({order.items.length})
                            </Typography>
                            <TableContainer>
                              <Table size="small">
                                <TableHead>
                                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                                    <TableCell>Product ID</TableCell>
                                    <TableCell>Quantity</TableCell>
                                    <TableCell>Unit Price</TableCell>
                                    <TableCell align="right">Subtotal</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {order.items.map((item) => (
                                    <TableRow key={item.item_id}>
                                      <TableCell>{item.product_id}</TableCell>
                                      <TableCell>{item.quantity}</TableCell>
                                      <TableCell>{formatCurrency(item.unit_price)}</TableCell>
                                      <TableCell align="right">{formatCurrency(item.subtotal)}</TableCell>
                                    </TableRow>
                                  ))}
                                  <TableRow>
                                    <TableCell colSpan={3} sx={{ fontWeight: 'bold' }}>Total</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                                      {formatCurrency(order.payment.total_amount)}
                                    </TableCell>
                                  </TableRow>
                                </TableBody>
                              </Table>
                            </TableContainer>
                          </Paper>

                          {/* Payment Details */}
                          <Paper sx={{ p: 2, backgroundColor: '#f9f9f9', borderRadius: 1 }}>
                            <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                              Payment Details
                            </Typography>
                            <Grid container spacing={2}>
                              <Grid item xs={6}>
                                <Typography variant="body2" color="text.secondary">Status:</Typography>
                                <Typography variant="body1">
                                  <Chip 
                                    label={order.payment.payment_status} 
                                    size="small"
                                    color={paymentStatusColors[order.payment.payment_status.toLowerCase()] || 'default'}
                                  />
                                </Typography>
                              </Grid>
                              <Grid item xs={6}>
                                <Typography variant="body2" color="text.secondary">Method:</Typography>
                                <Typography variant="body1" fontWeight="medium">
                                  {order.payment.payment_method === 'full' ? 'Full Payment' : 'Advance Payment'}
                                </Typography>
                              </Grid>
                              <Grid item xs={6}>
                                <Typography variant="body2" color="text.secondary">Amount Paid:</Typography>
                                <Typography variant="body1" fontWeight="medium">
                                  {formatCurrency(order.payment.amount_paid)}
                                </Typography>
                              </Grid>
                              {order.payment.payment_method === 'advance' && (
                                <Grid item xs={6}>
                                  <Typography variant="body2" color="text.secondary">Balance:</Typography>
                                  <Typography variant="body1" fontWeight="medium">
                                    {formatCurrency(order.payment.balance)}
                                  </Typography>
                                </Grid>
                              )}
                              <Grid item xs={12}>
                                <Typography variant="body2" color="text.secondary">Payment Complete:</Typography>
                                <Typography variant="body1" fontWeight="medium">
                                  {order.payment.payment_complete ? 'Yes' : 'No'}
                                </Typography>
                              </Grid>
                            </Grid>
                          </Paper>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </>
                )}
              </Card>
            ))}
          </Box>
        )}
      </Paper>
    </Container>
  );
};

// Helper function to format currency (add this outside your component)
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR',
    minimumFractionDigits: 2
  }).format(amount || 0);
};

export default OrderList;