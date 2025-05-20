import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import { Navigate, Route, BrowserRouter as Router, Routes, useLocation } from 'react-router-dom';

import AddProduct from './components/AddProduct';
import AdminDashboard from './components/ManageDashboard';
import Auth from './components/Auth';
import OrderManagement from './components/OrdersManagement';
import ProductList from './components/ProductList';
import React from 'react';
import SalaryDetails from './components/SalaryDetails';
import SalaryManagement from './components/SalaryManager';
import Sidebar from './components/Sidebar';

const AppLayout = () => {
  const location = useLocation();
  const hideSidebarRoutes = ['/'];

  return (
    <div className="container-fluid">
      <div className="row">
        {!hideSidebarRoutes.includes(location.pathname) && <Sidebar />}
        <div className={`main-content ${!hideSidebarRoutes.includes(location.pathname) ? 'col-md-9' : 'col-md-12'}`}>
          <Routes>
            <Route path="/" element={<Auth />} />
            <Route path="/salary" element={<SalaryManagement />} />
            <Route path="/Add-products" element={<AddProduct />} />
            <Route path="/list-products" element={<ProductList />} />
            <Route path="/list-task" element={<AdminDashboard />} />
            <Route path="/n-orders" element={<OrderManagement />} />
            <Route path="/salary-details/:salary_id" element={<SalaryDetails />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

const AppWrapper = () => {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
};

export default AppWrapper;
