import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import { Route, BrowserRouter as Router, Routes, useLocation } from 'react-router-dom';

import EmployeeAuth from './components/loginsingup';
import EmployeeJobList from './components/EmployeeJobList';
import EmployeeTasks from './components/EmployeeTasks';
import React from 'react';
import SalarySheet from './components/SalarySheet';
import Sidebar from './components/Sidebar';

const App = () => {
  const location = useLocation();
  const hideSidebarRoutes = ['/', '/']; // Routes where Sidebar should not appear

  return (
    <div className="container-fluid">
      <div className="row">
        {/* Conditionally render Sidebar based on the current route */}
        {!hideSidebarRoutes.includes(location.pathname) && <Sidebar />}
        <div className={`main-content ${!hideSidebarRoutes.includes(location.pathname) ? 'col-md-9' : 'col-md-12'}`}>
          <Routes>
           
            <Route path="/available-task" element={<EmployeeJobList/>} />
            
         
            
            <Route path="/my-salary" element={<SalarySheet/>} />
           
         
            <Route path="/job-management" element={<EmployeeTasks />} />
          </Routes>
          
        </div>
        <Routes>
            <Route path="/" element={< EmployeeAuth/>} />
          </Routes>
      </div>
    </div>
  );
};

const AppWrapper = () => {
  return (
    <Router>
      <App />
    </Router>
  );
};

export default AppWrapper;
