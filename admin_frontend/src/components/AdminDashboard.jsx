import 'bootstrap/dist/css/bootstrap.min.css';

import { Alert, Badge, Button, Card, Col, Container, Row, Spinner, Table } from 'react-bootstrap';
import {
  BiArrowBack,
  BiCalendar,
  BiCheckCircle,
  BiDollar,
  BiInfoCircle,
  BiRefresh,
  BiTask,
  BiUser,
  BiXCircle
} from 'react-icons/bi';
import React, { useEffect, useState } from 'react';

import axios from 'axios';

// Format currency as LKR
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR',
    minimumFractionDigits: 2
  }).format(amount || 0);
};

const AdminDashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [selectedJobDetails, setSelectedJobDetails] = useState(null);
  const [loading, setLoading] = useState({ 
    list: true, 
    details: false,
    refreshing: false
  });
  const [error, setError] = useState('');
  const [currentView, setCurrentView] = useState('list');

  const fetchAllJobs = async () => {
    try {
      setLoading(prev => ({ ...prev, list: true }));
      const response = await axios.get('http://localhost:4000/api/job/jobs');
      setJobs(response.data?.data || []);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load jobs');
    } finally {
      setLoading(prev => ({ ...prev, list: false }));
    }
  };

  const fetchJobDetails = async (job_id) => {
    try {
      setLoading(prev => ({ ...prev, details: true }));
      setError('');
      
      const response = await axios.post('http://localhost:4000/api/job/jobs_de', {
        job_id: job_id
      });

      if (!response.data?.data?.job) {
        throw new Error('Job details not found in response');
      }

      setSelectedJobDetails({
        job: response.data.data.job,
        assignments: response.data.data.assignments || []
      });
      setCurrentView('details');
    } catch (err) {
      setError(err.message || 'Failed to load job details');
      setSelectedJobDetails(null);
      setCurrentView('list');
    } finally {
      setLoading(prev => ({ ...prev, details: false }));
    }
  };

  const refreshJobDetails = async () => {
    if (!selectedJobDetails?.job?.job_id) return;
    
    try {
      setLoading(prev => ({ ...prev, refreshing: true }));
      const response = await axios.post('http://localhost:4000/api/job/jobs_de', {
        job_id: selectedJobDetails.job.job_id 
      });

      if (!response.data?.data?.job) {
        throw new Error('Job details not found in response');
      }

      setSelectedJobDetails({
        job: response.data.data.job,
        assignments: response.data.data.assignments || []
      });
    } catch (err) {
      setError(err.message || 'Failed to refresh job details');
    } finally {
      setLoading(prev => ({ ...prev, refreshing: false }));
    }
  };

  useEffect(() => {
    fetchAllJobs();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Invalid Date';
    }
  };

  const getCompletionPercentage = (job) => {
    if (!job?.quantity || isNaN(job.quantity)) return 0;
    const remaining = job.remaining_quantity || 0;
    return ((job.quantity - remaining) / job.quantity) * 100;
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 100) return 'success';
    if (percentage >= 75) return 'info';
    if (percentage >= 50) return 'primary';
    if (percentage >= 25) return 'warning';
    return 'danger';
  };

  if (loading.list) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="text-center">
          <Spinner animation="border" variant="primary" role="status" className="mb-3" />
          <h4 className="text-muted">Loading Tasks...</h4>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      {error && (
        <Alert variant="danger" onClose={() => setError('')} dismissible>
          <BiXCircle className="me-2" size={20} />
          {error}
        </Alert>
      )}

      {currentView === 'list' ? (
        <>
          <Row className="mb-4 align-items-center">
            <Col>
              <h1 className="display-5">
                <BiTask className="me-2" />
                Task Management Dashboard
              </h1>
            </Col>
            <Col className="text-end">
              <Button 
                variant="primary" 
                onClick={fetchAllJobs} 
                disabled={loading.list}
                className="d-flex align-items-center gap-2"
              >
                <BiRefresh size={18} /> 
                {loading.list ? 'Refreshing...' : 'Refresh Jobs'}
              </Button>
            </Col>
          </Row>

          <Row className="mb-4">
            <Col md={4}>
              <Card className="text-white bg-primary h-100">
                <Card.Body className="d-flex flex-column align-items-center">
                  <Card.Title className="text-center">
                    <BiTask size={30} className="mb-2" />
                    <div>Total Tasks</div>
                  </Card.Title>
                  <Card.Text className="display-4 mt-3 mb-0 fw-bold">{jobs.length}</Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="text-white bg-success h-100">
                <Card.Body className="d-flex flex-column align-items-center">
                  <Card.Title className="text-center">
                    <BiCheckCircle size={30} className="mb-2" />
                    <div>Active Tasks</div>
                  </Card.Title>
                  <Card.Text className="display-4 mt-3 mb-0 fw-bold">
                    {jobs.filter(job => job.is_active === 1).length}
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="text-white bg-secondary h-100">
                <Card.Body className="d-flex flex-column align-items-center">
                  <Card.Title className="text-center">
                    <BiXCircle size={30} className="mb-2" />
                    <div>Completed Tasks</div>
                  </Card.Title>
                  <Card.Text className="display-4 mt-3 mb-0 fw-bold">
                    {jobs.filter(job => job.is_active === 0).length}
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Card className="shadow-sm">
            <Card.Header className="bg-light">
              <h5 className="mb-0">Tasks List</h5>
            </Card.Header>
            <Card.Body>
              <Table striped bordered hover responsive>
                <thead className="table-light">
                  <tr>
                    <th>Tasks Name</th>
                    <th>Date Range</th>
                    <th>Quantity</th>
                    <th>Progress</th>
                    <th>Accepted</th>
                    <th>Rejected</th>
                    <th>Earnings (LKR)</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.length > 0 ? (
                    jobs.map(job => {
                      const completionPercentage = getCompletionPercentage(job);
                      const progressColor = getProgressColor(completionPercentage);
                      
                      return (
                        <tr key={job.job_id}>
                          <td className="fw-medium">{job.job_name || 'N/A'}</td>
                          <td>
                            <BiCalendar className="me-1 text-secondary" />
                            {formatDate(job.start_date)} - {formatDate(job.end_date)}
                          </td>
                          <td>
                            {job.remaining_quantity || 0}/{job.quantity || 0}
                          </td>
                          <td>
                            <div className="d-flex align-items-center">
                              <div className="progress w-100 me-2">
                                <div 
                                  className={`progress-bar bg-${progressColor}`}
                                  role="progressbar"
                                  style={{ width: `${completionPercentage}%` }}
                                  aria-valuenow={completionPercentage}
                                  aria-valuemin="0"
                                  aria-valuemax="100"
                                ></div>
                              </div>
                              <span>{Math.round(completionPercentage)}%</span>
                            </div>
                          </td>
                          <td>
                            <Badge bg="success" pill>
                              {job.accepted_count || 0}
                            </Badge>
                          </td>
                          <td>
                            <Badge bg="danger" pill>
                              {job.rejected_count || 0}
                            </Badge>
                          </td>
                          <td className="fw-bold">
                            {formatCurrency(job.total_earned)}
                          </td>
                          <td>
                            <Button 
                              variant="outline-info"
                              size="sm"
                              onClick={() => fetchJobDetails(job.job_id)}
                              disabled={loading.details}
                              className="d-flex align-items-center mx-auto"
                            >
                              {loading.details ? (
                                <Spinner as="span" animation="border" size="sm" />
                              ) : (
                                <>
                                  <BiInfoCircle className="me-1" /> View
                                </>
                              )}
                            </Button>
                          </td>
                        </tr>
                      )
                    })
                  ) : (
                    <tr>
                      <td colSpan="8" className="text-center py-4 text-muted">
                        No Tasks found
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </>
      ) : (
        <>
          <Row className="mb-4">
            <Col>
              <Button 
                variant="outline-secondary"
                onClick={() => setCurrentView('list')}
                className="d-flex align-items-center"
              >
                <BiArrowBack className="me-2" /> Back to All Tasks
              </Button>
              {selectedJobDetails?.job && (
                <Button
                  variant="outline-primary"
                  className="ms-2 d-inline-flex align-items-center"
                  onClick={refreshJobDetails}
                  disabled={loading.refreshing}
                >
                  {loading.refreshing ? (
                    <Spinner as="span" animation="border" size="sm" className="me-2" />
                  ) : (
                    <BiRefresh size={18} className="me-2" />
                  )}
                  Refresh Details
                </Button>
              )}
            </Col>
          </Row>

          {loading.details ? (
            <Row className="justify-content-center my-5">
              <Col md={6} className="text-center">
                <Spinner animation="border" variant="primary" role="status" className="mb-3" />
                <h4 className="text-muted">Loading Tasks details...</h4>
              </Col>
            </Row>
          ) : selectedJobDetails?.job ? (
            <>
              <Card className="mb-4 shadow-sm">
                <Card.Header className="bg-primary bg-gradient text-white">
                  <div className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">
                      <BiTask className="me-2" />
                      Task Details
                    </h5>
                    <Badge bg={selectedJobDetails.job.is_active ? 'light' : 'dark'} 
                      text={selectedJobDetails.job.is_active ? 'dark' : 'light'}>
                      {selectedJobDetails.job.is_active ? 'Active' : 'Completed'}
                    </Badge>
                  </div>
                </Card.Header>
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h4 className="mb-0">
                      {selectedJobDetails.job.job_name || 'Unnamed Job'}
                    </h4>
                  </div>

                  <Row className="g-4">
                    <Col md={6}>
                      <div className="mb-3">
                        <div className="text-muted mb-1">Description</div>
                        <p>{selectedJobDetails.job.description || 'No description available'}</p>
                      </div>
                      
                      <div className="mb-3">
                        <div className="text-muted mb-1">
                          <BiCalendar className="me-1" /> Date Range
                        </div>
                        <p className="mb-0">
                          {formatDate(selectedJobDetails.job.start_date)} to {formatDate(selectedJobDetails.job.end_date)}
                        </p>
                      </div>
                    </Col>
                    
                    <Col md={6}>
                      <Row className="g-3">
                        <Col sm={6}>
                          <Card className="bg-light h-100">
                            <Card.Body>
                              <Card.Title className="text-muted small mb-1">Total Quantity</Card.Title>
                              <Card.Text className="fs-4 fw-bold">{selectedJobDetails.job.quantity || 0}</Card.Text>
                            </Card.Body>
                          </Card>
                        </Col>
                        
                        <Col sm={6}>
                          <Card className="bg-light h-100">
                            <Card.Body>
                              <Card.Title className="text-muted small mb-1">Remaining</Card.Title>
                              <Card.Text className="fs-4 fw-bold">{selectedJobDetails.job.remaining_quantity || 0}</Card.Text>
                            </Card.Body>
                          </Card>
                        </Col>
                        
                        <Col sm={12}>
                          <Card className="bg-light h-100">
                            <Card.Body>
                              <Card.Title className="text-muted small mb-1">Pay Rate</Card.Title>
                              <Card.Text className="fs-4 fw-bold text-success">
                                {formatCurrency(selectedJobDetails.job.pay_per_unit)} per unit
                              </Card.Text>
                            </Card.Body>
                          </Card>
                        </Col>
                      </Row>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              <Card className="shadow-sm">
                <Card.Header className="bg-secondary bg-gradient text-white">
                  <h5 className="mb-0">
                    <BiUser className="me-2" />
                    Employee Assignments ({selectedJobDetails.assignments.length})
                  </h5>
                </Card.Header>
                <Card.Body>
                  {selectedJobDetails.assignments.length > 0 ? (
                    <Table striped bordered hover responsive>
                      <thead className="table-light">
                        <tr>
                          <th>Employee</th>
                          <th>Email</th>
                          <th>Status</th>
                          <th>Assigned</th>
                          <th>Completed</th>
                          <th>Earned (LKR)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedJobDetails.assignments.map(assignment => (
                          <tr key={assignment.assignment_id}>
                            <td className="fw-medium">{assignment.employee_name || 'N/A'}</td>
                            <td>{assignment.email || 'N/A'}</td>
                            <td>
                              <Badge 
                                bg={assignment.status === 'accepted' ? 'success' : 'danger'}
                                pill
                                className="px-3 py-2"
                              >
                                {assignment.status === 'accepted' ? (
                                  <><BiCheckCircle className="me-1" /> {assignment.status}</>
                                ) : (
                                  <><BiXCircle className="me-1" /> {assignment.status}</>
                                )}
                              </Badge>
                            </td>
                            <td>{assignment.assigned_quantity || 0}</td>
                            <td>{assignment.completed_quantity || 0}</td>
                            <td className="fw-bold">
                              {formatCurrency(assignment.earned_amount)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  ) : (
                    <Alert variant="info" className="d-flex align-items-center">
                      <BiInfoCircle className="me-2" size={24} />
                      No assignments found for this Task.
                    </Alert>
                  )}
                </Card.Body>
              </Card>
            </>
          ) : (
            <Card className="text-center shadow-sm">
              <Card.Body className="py-5">
                <BiInfoCircle size={48} className="text-muted mb-3" />
                <Card.Title>Task Details Not Available</Card.Title>
                <Card.Text>Please try again or select a different Task.</Card.Text>
                <Button 
                  variant="primary"
                  onClick={() => setCurrentView('list')}
                  className="mt-3"
                >
                  <BiArrowBack className="me-2" />
                  Back to Task List
                </Button>
              </Card.Body>
            </Card>
          )}
        </>
      )}
    </Container>
  );
};

export default AdminDashboard;