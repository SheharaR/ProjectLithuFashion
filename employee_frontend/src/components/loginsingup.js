import 'bootstrap/dist/css/bootstrap.min.css';

import React, { useState } from 'react';

import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const EmployeeAuth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    employee_name: '',
    email: '',
    password: '',
    phone: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const endpoint = isLogin ? 'http://localhost:4000/api/employees/login' : 'http://localhost:4000/api/employees/register';
      const response = await axios.post(endpoint, formData);

      if (response.data.success) {
        localStorage.setItem('employeeToken', response.data.token);
        localStorage.setItem('employee', JSON.stringify(response.data.employee));
        navigate('/available-task');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred');
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-4">
          <div className="card shadow">
            <div className="card-body">
              <h2 className="card-title text-center mb-4">
                {isLogin ? 'Employee Login' : 'Employee Registration'}
              </h2>
              
              {error && <div className="alert alert-danger">{error}</div>}

              <form onSubmit={handleSubmit}>
                {!isLogin && (
                  <div className="mb-3">
                    <label className="form-label">Full Name</label>
                    <input
                      type="text"
                      className="form-control"
                      name="employee_name"
                      value={formData.employee_name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                )}

                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    className="form-control"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    minLength="8"
                    required
                  />
                </div>

                {!isLogin && (
                  <div className="mb-3">
                    <label className="form-label">Phone Number</label>
                    <input
                      type="tel"
                      className="form-control"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                    />
                  </div>
                )}

                <button type="submit" className="btn btn-primary w-100">
                  {isLogin ? 'Login' : 'Register'}
                </button>
              </form>

              <div className="text-center mt-3">
                <button 
                  className="btn btn-link"
                  onClick={() => setIsLogin(!isLogin)}
                >
                  {isLogin ? 'Need an account? Register here' : 'Already have an account? Login'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeAuth;