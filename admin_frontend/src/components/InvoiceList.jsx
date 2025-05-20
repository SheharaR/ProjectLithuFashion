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
  MenuItem,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';
import { Download, FilterList, Print, Search } from '@mui/icons-material';
import React, { useEffect, useState } from 'react';

import autoTable from 'jspdf-autotable';
import axios from 'axios';
import { jsPDF } from 'jspdf';

const InvoiceList = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    paymentStatus: 'all',
    orderStatus: 'all'
  });

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const response = await axios.get('http://localhost:4000/api/quotation/get_all');
        if (response.data.success) {
          setInvoices(response.data.invoices);
        } else {
          setError('Failed to fetch invoices');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, []);

  const generateInvoicePDF = (invoice) => {
    const doc = new jsPDF();
    
    // Add title and header
    doc.setFontSize(18);
    doc.setTextColor(40, 53, 147);
    doc.text('MedalWorks INVOICE', 105, 15, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Invoice #: ${invoice.invoice_id}`, 14, 25);
    doc.text(`Date: ${new Date(invoice.created_at).toLocaleDateString()}`, 160, 25);
    
    // Add company info
    doc.setFontSize(10);
    doc.text('MedalWorks Manufacturing Co.', 14, 35);
    doc.text('123 Industrial Park', 14, 40);
    doc.text('Colombo, Sri Lanka', 14, 45);
    doc.text('Phone: +94 11 2345678', 14, 50);
    
    // Add customer info
    doc.setFontSize(12);
    doc.text('Bill To:', 14, 65);
    doc.setFontSize(10);
    doc.text(`Customer ID: ${invoice.customer_id}`, 14, 70);
    doc.text(`Quotation ID: ${invoice.quotation_id}`, 14, 75);
    
    // Add status info
    doc.setFontSize(12);
    doc.text(`Payment Status: ${invoice.payment_status}`, 160, 70);
    doc.text(`Order Status: ${invoice.order_status.replace('_', ' ')}`, 160, 75);
    
    // Add line items table
    doc.setFontSize(14);
    doc.text('Items', 14, 90);
    
    const itemsData = invoice.items.map(item => [
      item.material_name,
      item.quantity,
      `$${parseFloat(item.unit_price).toFixed(2)}`,
      `$${(item.quantity * parseFloat(item.unit_price)).toFixed(2)}`
    ]);
    
    // Add subtotal, tax, total
    itemsData.push(['', '', 'Subtotal:', `$${invoice.total_amount}`]);
    itemsData.push(['', '', 'Tax (0%):', '$0.00']);
    itemsData.push(['', '', 'Total:', `$${invoice.total_amount}`]);
    itemsData.push(['', '', 'Amount Paid:', `$${invoice.paid_amount}`]);
    itemsData.push(['', '', 'Balance Due:', `$${(parseFloat(invoice.total_amount) - parseFloat(invoice.paid_amount)).toFixed(2)}`]);
    
    autoTable(doc, {
      startY: 95,
      head: [['Description', 'Qty', 'Unit Price', 'Amount']],
      body: itemsData,
      margin: { left: 14 },
      styles: { 
        fontSize: 10,
        cellPadding: 3,
        overflow: 'linebreak'
      },
      headStyles: { 
        fillColor: [79, 70, 229],
        textColor: 255,
        fontStyle: 'bold'
      },
      columnStyles: {
        2: { halign: 'right' },
        3: { halign: 'right' }
      },
      bodyStyles: {
        0: { fontStyle: 'bold' } // Makes the first row bold
      },
      didParseCell: (data) => {
        if (data.section === 'body' && data.row.index >= invoice.items.length) {
          data.cell.styles.fontStyle = 'bold';
          if (data.column.index >= 2) {
            data.cell.styles.halign = 'right';
          }
        }
      }
    });
    
    // Add job description if exists
    if (invoice.job_description) {
      doc.setFontSize(12);
      doc.text('Job Description:', 14, doc.lastAutoTable.finalY + 15);
      doc.setFontSize(10);
      const splitDescription = doc.splitTextToSize(invoice.job_description, 180);
      doc.text(splitDescription, 14, doc.lastAutoTable.finalY + 20);
    }
    
    // Add footer
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('Thank you for your business!', 105, 280, { align: 'center' });
    doc.text('Terms: Payment due within 30 days', 105, 285, { align: 'center' });
    
    // Save the PDF
    doc.save(`MedalWorks_Invoice_${invoice.invoice_id}.pdf`);
  };

  const handleDownload = (invoice) => {
    try {
      generateInvoicePDF(invoice);
    } catch (error) {
      console.error('Error generating PDF:', error);
      setError('Failed to generate invoice PDF');
    }
  };

  const handlePrint = (invoice) => {
    handleDownload(invoice); // Same as download for now
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.invoice_id.toString().includes(searchQuery) ||
      invoice.customer_id.includes(searchQuery) ||
      invoice.job_description?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesPaymentStatus = filters.paymentStatus === 'all' || 
      invoice.payment_status === filters.paymentStatus;
      
    const matchesOrderStatus = filters.orderStatus === 'all' || 
      invoice.order_status === filters.orderStatus;

    return matchesSearch && matchesPaymentStatus && matchesOrderStatus;
  });

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box mt={4}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Container   maxWidth="lg">
      <Box mt={4} mb={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Invoice Management
        </Typography>

        {/* Control Bar */}
        <Card sx={{ mb: 3, p: 2, backgroundColor: 'background.paper' }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Search invoices..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: 'action.active' }} />
                }}
              />
            </Grid>
            <Grid item xs={6} md={3}>
              <TextField
                select
                fullWidth
                label="Payment Status"
                value={filters.paymentStatus}
                onChange={(e) => setFilters({ ...filters, paymentStatus: e.target.value })}
                variant="outlined"
              >
                <MenuItem value="all">All Payments</MenuItem>
                <MenuItem value="Paid">Paid</MenuItem>
                <MenuItem value="Partially Paid">Partially Paid</MenuItem>
                <MenuItem value="Unpaid">Unpaid</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={6} md={3}>
              <TextField
                select
                fullWidth
                label="Order Status"
                value={filters.orderStatus}
                onChange={(e) => setFilters({ ...filters, orderStatus: e.target.value })}
                variant="outlined"
              >
                <MenuItem value="all">All Orders</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="in_progress">In Progress</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<FilterList />}
                onClick={() => {
                  setFilters({ paymentStatus: 'all', orderStatus: 'all' });
                  setSearchQuery('');
                }}
                sx={{ height: 56 }}
              >
                Clear All
              </Button>
            </Grid>
          </Grid>
        </Card>

        {/* Results Section */}
        {filteredInvoices.length === 0 ? (
          <Box textAlign="center" p={4}>
            <Typography variant="h6" color="textSecondary">
              No invoices found matching your criteria
            </Typography>
          </Box>
        ) : (
          filteredInvoices.map((invoice) => (
            <Card key={invoice.invoice_id} sx={{ mb: 3, boxShadow: 3 }}>
              <CardHeader
                title={`Invoice #${invoice.invoice_id}`}
                subheader={
                  <Box>
                    <Typography variant="caption">
                      Created: {new Date(invoice.created_at).toLocaleDateString()}
                    </Typography>
                    <Typography variant="caption" display="block">
                      Last Updated: {new Date(invoice.updatedAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                }
                action={
                  <Box display="flex" gap={1} alignItems="center">
                    <Box>
                      <Chip
                        label={invoice.payment_status}
                        color={
                          invoice.payment_status === 'Paid' ? 'success' :
                          invoice.payment_status === 'Partially Paid' ? 'warning' : 'error'
                        }
                      />
                      <Chip
                        label={invoice.order_status.replace('_', ' ')}
                        color={
                          invoice.order_status === 'completed' ? 'success' :
                          invoice.order_status === 'in_progress' ? 'warning' : 'error'
                        }
                        sx={{ ml: 1 }}
                      />
                    </Box>
                    <Box>
                      <Tooltip title="Download Invoice">
                        <IconButton onClick={() => handleDownload(invoice)}>
                          <Download />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Print Invoice">
                        <IconButton onClick={() => handlePrint(invoice)}>
                          <Print />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                }
              />
              
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <List dense>
                      <ListItem>
                        <ListItemText 
                          primary="Quotation ID" 
                          secondary={invoice.quotation_id} 
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText 
                          primary="Customer ID" 
                          secondary={invoice.customer_id} 
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Payment Progress"
                          secondary={`$${invoice.paid_amount} of $${invoice.total_amount}`}
                        />
                      </ListItem>
                    </List>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <List dense>
                      <ListItem>
                        <ListItemText
                          primary="Total Amount"
                          secondary={`$${invoice.total_amount}`}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Amount Due"
                          secondary={`$${(parseFloat(invoice.total_amount) - parseFloat(invoice.paid_amount)).toFixed(2)}`}
                        />
                      </ListItem>
                    </List>
                  </Grid>
                </Grid>

                {invoice.job_description && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle2" gutterBottom>
                      Job Description:
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {invoice.job_description}
                    </Typography>
                  </>
                )}

                <Divider sx={{ my: 2 }} />

                <Typography variant="subtitle2" gutterBottom>
                  Items Breakdown:
                </Typography>
                <List dense>
                  {invoice.items.map((item, index) => (
                    <ListItem key={index}>
                      <ListItemText
                        primary={item.material_name}
                        secondary={`Quantity: ${item.quantity} × $${item.unit_price}`}
                      />
                      <Typography variant="body2">
                        ${(item.quantity * parseFloat(item.unit_price)).toFixed(2)}
                      </Typography>
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          ))
        )}
      </Box>
    </Container>
  );
};

export default InvoiceList;