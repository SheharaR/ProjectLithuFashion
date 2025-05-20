import './App.css';

import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';

import AdminDashboard from './components/AdminDashboard';
import AdminInvoices from './components/AdminInvoices';
import AdminJobForm from './components/CreateJob';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import Auth from './components/Auth';
import { Box } from '@mui/material';
import CustomOrderList from './components/CustomOrderList';
import CustomerList from './components/CustomerList';
import EmployeeList from './components/EmployeeList';
import InvoiceList from './components/InvoiceList';
import OrderList from './components/OrderList';
import PriceCalculator from './components/PriceCalculator';
import Sidebar from './components/Sidebar';

const Layout = ({ children }) => {
  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        {children}
      </Box>
    </Box>
  );
};

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Auth />} />
        <Route path="*" element={
          <Layout>
            <Routes>
              <Route path="/invoices" element={<AdminInvoices />} />
              <Route path="/c-orders" element={<CustomOrderList />} />
              <Route path="/orders" element={<OrderList />} />
              <Route path="/bills" element={<InvoiceList />} />
              <Route path="/dashboard" element={<AdminDashboard />} />
              <Route path="/c-job" element={<AdminJobForm />} />
              <Route path="/report" element={<AnalyticsDashboard />} />
              <Route path="/cal" element={<PriceCalculator />} />
              <Route path="/e-list" element={<EmployeeList />} />
              <Route path="/c-list" element={<CustomerList />} />
            </Routes>
          </Layout>
        } />
      </Routes>
    </Router>
  );
};

export default App;