import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';

import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import RefreshIcon from '@mui/icons-material/Refresh';
import axios from 'axios';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const AnalyticsDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const dashboardRef = useRef(null);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('http://localhost:4000/api/reports');
      setAnalytics(response.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = async () => {
    if (!dashboardRef.current) return;

    try {
      setLoading(true);
      
      const canvas = await html2canvas(dashboardRef.current, {
        scale: 2,
        logging: false,
        useCORS: true,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('landscape', 'pt', [canvas.width, canvas.height]);
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save('business-analytics-report.pdf');
    } catch (err) {
      console.error('PDF generation failed:', err);
      setError('Failed to generate PDF');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <Typography variant="h6">Loading analytics...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <Typography color="error">{error}</Typography>
        <Button onClick={() => fetchAnalytics()} startIcon={<RefreshIcon />}>
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }} ref={dashboardRef}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" component="h1">
          Business Analytics Dashboard
        </Typography>
        <Box>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<RefreshIcon />}
            onClick={() => fetchAnalytics()}
            sx={{ mr: 2 }}
          >
            Refresh
          </Button>
          <Button 
            variant="contained" 
            color="secondary" 
            startIcon={<PictureAsPdfIcon />}
            onClick={generatePDF}
            disabled={loading}
          >
            {loading ? 'Generating PDF...' : 'Export PDF'}
          </Button>
        </Box>
      </Box>

      {analytics && (
        <Grid container spacing={3}>
          {/* Summary Cards */}
          <Grid item xs={12} md={3}>
            <Card elevation={3}>
              <CardContent>
                <Typography variant="h6" color="textSecondary">
                  Total Orders
                </Typography>
                <Typography variant="h3">
                  {analytics.data.orderStats.totalOrders}
                </Typography>
                <Typography variant="subtitle2" color="textSecondary">
                  {analytics.data.orderStats.totalRevenue.toFixed(2)} LKR revenue
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Card elevation={3}>
              <CardContent>
                <Typography variant="h6" color="textSecondary">
                  Total Jobs
                </Typography>
                <Typography variant="h3">
                  {analytics.data.jobStats.totalJobs}
                </Typography>
                <Typography variant="subtitle2" color="textSecondary">
                  {analytics.data.jobStats.activeJobs} active
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Card elevation={3}>
              <CardContent>
                <Typography variant="h6" color="textSecondary">
                  Assignments
                </Typography>
                <Typography variant="h3">
                  {analytics.data.assignmentStats.totalAssignments}
                </Typography>
                <Typography variant="subtitle2" color="textSecondary">
                  {analytics.data.assignmentStats.assignmentStatuses.accepted || 0} accepted
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Card elevation={3}>
              <CardContent>
                <Typography variant="h6" color="textSecondary">
                  Customers
                </Typography>
                <Typography variant="h3">
                  {analytics.data.customerStats.totalCustomers}
                </Typography>
                <Typography variant="subtitle2" color="textSecondary">
                  {analytics.data.customerStats.customersWithOrders} with orders
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Order Analytics */}
         

          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 2, height: '400px' }}>
              <Typography variant="h6" gutterBottom>
                Payment Methods
              </Typography>
              <ResponsiveContainer width="100%" height="90%">
                <BarChart
                  data={analytics.charts.paymentMethodChart}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value} orders`, 'Count']} />
                  <Bar dataKey="value" name="Orders">
                    {analytics.charts.paymentMethodChart.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                    <LabelList dataKey="value" position="top" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* Job Analytics */}
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 2, height: '400px' }}>
              <Typography variant="h6" gutterBottom>
                Job Status Distribution
              </Typography>
              <ResponsiveContainer width="100%" height="90%">
                <PieChart>
                  <Pie
                    data={analytics.charts.jobStatusChart}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {analytics.charts.jobStatusChart.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} jobs`, 'Count']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 2, height: '400px' }}>
              <Typography variant="h6" gutterBottom>
                Assignment Status
              </Typography>
              <ResponsiveContainer width="100%" height="90%">
                <BarChart
                  data={analytics.charts.assignmentStatusChart}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value} assignments`, 'Count']} />
                  <Bar dataKey="value" name="Assignments">
                    {analytics.charts.assignmentStatusChart.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                    <LabelList dataKey="value" position="top" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* Completion Rates */}
          <Grid item xs={12}>
            <Paper elevation={3} sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Assignment Completion Rates
              </Typography>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  data={analytics.charts.completionRateChart}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value} assignments`, 'Count']} />
                  <Legend />
                  <Bar dataKey="value" name="Assignments">
                    {analytics.charts.completionRateChart.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                    <LabelList dataKey="value" position="top" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* Top Customers */}
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Top Customers by Spending
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={analytics.data.customerStats.topCustomers}
                  layout="vertical"
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="customerName" type="category" width={100} />
                  <Tooltip 
                    formatter={(value, name, props) => [
                      `LKR${value.toFixed(2)}`, 
                      'Total Spent',
                      `Orders: ${props.payload.orderCount}`
                    ]}
                  />
                  <Bar dataKey="totalSpent" name="Total Spent">
                    {analytics.data.customerStats.topCustomers.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* Top Employees */}
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Top Performing Employees
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Employee</TableCell>
                      <TableCell align="right">Completed Tasks</TableCell>
                      <TableCell align="right">Completed Quantity</TableCell>
                      <TableCell align="right">Earnings (LKR)</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {analytics.data.employeeStats.topPerformers.map((employee, index) => (
                      <TableRow key={employee.employeeId}>
                        <TableCell>
                          <Typography fontWeight="bold">
                            {employee.employeeName}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            ID: {employee.employeeId}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">{employee.completedTasks}</TableCell>
                        <TableCell align="right">{employee.completedQuantity}</TableCell>
                        <TableCell align="right">{employee.totalEarnings.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Container>
  );
};

export default AnalyticsDashboard;  