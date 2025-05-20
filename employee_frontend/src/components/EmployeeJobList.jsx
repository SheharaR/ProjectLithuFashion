import 'bootstrap/dist/css/bootstrap.min.css';

import React, { useEffect, useState } from 'react';

import axios from 'axios';

const EmployeeJobList = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuantities, setSelectedQuantities] = useState({});
  const [processingJobs, setProcessingJobs] = useState({});

  const fetchJobs = async () => {
    try {
      const token = localStorage.getItem('employeeToken');
      const response = await axios.get('http://localhost:4000/api/job/available', {
        headers: { token }
      });
      setJobs(response.data);

      const initialQuantities = {};
      response.data.forEach(job => {
        initialQuantities[job.job_id] = "";
      });
      setSelectedQuantities(initialQuantities);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleQuantityChange = (jobId, quantity) => {
    setSelectedQuantities(prev => ({
      ...prev,
      [jobId]: quantity
    }));
  };

  const handleJobAction = async (jobId, action) => {
    try {
      setProcessingJobs(prev => ({ ...prev, [jobId]: true }));

      const token = localStorage.getItem('employeeToken');
      const quantity = action === 'accepted' ? parseInt(selectedQuantities[jobId]) : 0;

      await axios.put(
        'http://localhost:4000/api/job/update',
        {
          status: action,
          completion_fraction: '0',
          assigned_quantity: quantity,
          job_id: jobId
        },
        {
          headers: { token }
        }
      );

      const actionText = action === 'accepted' ? 'accepted' : 'rejected';
      const jobName = jobs.find(job => job.job_id === jobId)?.job_name || 'Job';
      alert(`${jobName} has been ${actionText} successfully!`);

      // Reload the job list
      fetchJobs();

    } catch (error) {
      console.error('Error updating job status:', error);
      alert('Cannot reject an already accepted job');
    } finally {
      setProcessingJobs(prev => ({ ...prev, [jobId]: false }));
    }
  };

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading available Tasks...</p>
      </div>
    );
  }

  return (
    <div className="container mt-4 mb-5">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="mb-0">Available Tasks</h2>
            <span className="badge bg-primary rounded-pill">{jobs.length} Jobs</span>
          </div>

          {jobs.length === 0 ? (
            <div className="alert alert-info" role="alert">
              <i className="bi bi-info-circle me-2"></i>
              No Tasks are currently available. Please check back later.
            </div>
          ) : (
            <div className="row">
              {jobs.map((job) => (
                <div className="col-lg-6 col-12 mb-4" key={job.job_id}>
                  <div className="card h-100 shadow-sm">
                    <div className="card-header bg-light d-flex justify-content-between align-items-center">
                      <h5 className="card-title mb-0">{job.job_name}</h5>
                      <span className="badge bg-success">LKR{job.pay_per_unit} per unit</span>
                    </div>
                    <div className="card-body">
                      {job.design_image && (
                        <div className="mb-3 text-center">
                          <img
                            src={`http://localhost:4000${job.design_image}`}
                            alt="Job design"
                            className="img-fluid rounded"
                            style={{ maxHeight: '200px' }}
                          />
                        </div>
                      )}
                      <div className="mb-3">
                        <p className="card-text">{job.description}</p>
                      </div>

                      <div className="row g-3 mb-3">
                        <div className="col-md-6">
                          <div className="d-flex align-items-center">
                            <i className="bi bi-box me-2 text-secondary"></i>
                            <div>
                              <small className="text-muted">Quantity Available</small>
                              <p className="mb-0 fw-bold">{job.remaining_quantity} units</p>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="d-flex align-items-center">
                            <i className="bi bi-calendar me-2 text-secondary"></i>
                            <div>
                              <small className="text-muted">Deadline</small>
                              <p className="mb-0 fw-bold">
                                {job.end_date ? new Date(job.end_date).toLocaleDateString() : 'Not specified'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="row g-3 mb-3">
                        <div className="col-md-6">
                          <div className="d-flex align-items-center">
                            <i className="bi bi-currency-dollar me-2 text-secondary"></i>
                            <div>
                              <small className="text-muted">Potential earnings (full job)</small>
                              <p className="mb-0 fw-bold">LKR{(job.remaining_quantity * job.pay_per_unit).toFixed(2)}</p>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="d-flex align-items-center">
                            <i className="bi bi-clock me-2 text-secondary"></i>
                            <div>
                              <small className="text-muted">Posted</small>
                              <p className="mb-0 fw-bold">
                                {job.created_at ? new Date(job.created_at).toLocaleDateString() : 'Recently'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <hr className="my-3" />

                      <div className="row g-3 align-items-end">
                        <div className="col-md-6">
                          <label htmlFor={`quantity-${job.job_id}`} className="form-label">Select quantity to accept:</label>
                          <select
                            id={`quantity-${job.job_id}`}
                            className="form-select"
                            value={selectedQuantities[job.job_id]}
                            onChange={(e) => handleQuantityChange(job.job_id, e.target.value)}
                            disabled={processingJobs[job.job_id]}
                          >
                            <option value="">Choose quantity</option>
                            <option value={1}>1 unit</option>
                            <option value={Math.ceil(job.remaining_quantity / 4)}>
                              {Math.ceil(job.remaining_quantity / 4)} units (25%)
                            </option>
                            <option value={Math.ceil(job.remaining_quantity / 2)}>
                              {Math.ceil(job.remaining_quantity / 2)} units (50%)
                            </option>
                            <option value={Math.ceil(job.remaining_quantity * 0.75)}>
                              {Math.ceil(job.remaining_quantity * 0.75)} units (75%)
                            </option>
                            <option value={job.remaining_quantity}>
                              {job.remaining_quantity} units (100%)
                            </option>
                          </select>
                        </div>
                        <div className="col-md-6">
                          <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                            <button
                              className="btn btn-success"
                              onClick={() => handleJobAction(job.job_id, 'accepted')}
                              disabled={!selectedQuantities[job.job_id] || processingJobs[job.job_id]}
                            >
                              {processingJobs[job.job_id] ? (
                                <>
                                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                  Processing...
                                </>
                              ) : (
                                <>Accept Task</>
                              )}
                            </button>
                            <button
                              className="btn btn-outline-danger"
                              onClick={() => handleJobAction(job.job_id, 'rejected')}
                              disabled={processingJobs[job.job_id]}
                            >
                              {processingJobs[job.job_id] ? 'Processing...' : 'Reject'}
                            </button>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeJobList;
