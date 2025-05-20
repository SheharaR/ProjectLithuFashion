import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Container,
  Form,
  Modal,
  ProgressBar,
  Row,
  Spinner,
  Table
} from 'react-bootstrap';
import { useEffect, useState } from 'react';

import axios from 'axios';

const EmployeeTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showError, setShowError] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [completedQuantity, setCompletedQuantity] = useState(0);
  const [updating, setUpdating] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');

  // Fetch all assigned tasks
  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      setShowError(false);
      
      const token = localStorage.getItem('employeeToken');
      const response = await axios.get('http://localhost:4000/api/job/get_all', {
        headers: { token }
      });
      
      if (response.data.success) {
        setTasks(response.data.data);
      } else {
        throw new Error(response.data.message || 'Failed to fetch tasks');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Update completed quantity
  const updateCompletedQuantity = async () => {
    if (!currentTask || completedQuantity === null) return;

    try {
      setUpdating(true);
      setError(null);
      setShowError(false);
      
      const token = localStorage.getItem('employeeToken');
      const response = await axios.put(
        'http://localhost:4000/api/job/update_complete',
        {
          assignment_id: currentTask.assignment_id,
          completed_quantity: completedQuantity
        },
        { headers: { token } }
      );

      if (response.data.success) {
        // Update local state
        const updatedTasks = tasks.map(task => 
          task.assignment_id === currentTask.assignment_id
            ? { 
                ...task, 
                completed_quantity: completedQuantity,
                earned_amount: response.data.data.earnings,
                remaining_quantity: task.assigned_quantity - completedQuantity,
                // Update job_status to completed only if progress is 100%
                job_status: (completedQuantity >= task.assigned_quantity) ? 'completed' : task.job_status
              }
            : task
        );
        
        setTasks(updatedTasks);
        setShowUpdateModal(false);
      } else {
        throw new Error(response.data.message || 'Failed to update task');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      setShowError(true);
    } finally {
      setUpdating(false);
    }
  };

  // Status badge component with text-based indicators
  const StatusBadge = ({ status }) => {
    switch (status) {
      case 'accepted':
        return (
          <Badge bg="success" className="d-flex align-items-center gap-1">
            <span className="fw-bold">✓</span> Accepted
          </Badge>
        );
      case 'rejected':
        return (
          <Badge bg="danger" className="d-flex align-items-center gap-1">
            <span className="fw-bold">✗</span> Rejected
          </Badge>
        );
      case 'pending':
        return (
          <Badge bg="warning" className="d-flex align-items-center gap-1">
            <span className="fw-bold">⌛</span> Pending
          </Badge>
        );
      default:
        return (
          <Badge bg="secondary" className="d-flex align-items-center gap-1">
            <span className="fw-bold">?</span> Unknown
          </Badge>
        );
    }
  };

  // Job status badge component with text-based indicators
  const JobStatusBadge = ({ status }) => {
    switch (status) {
      case 'completed':
        return (
          <Badge bg="success" className="d-flex align-items-center gap-1">
            <span className="fw-bold">✓</span> Completed
          </Badge>
        );
      case 'in_progress':
        return (
          <Badge bg="primary" className="d-flex align-items-center gap-1">
            <span className="fw-bold">↻</span> In Progress
          </Badge>
        );
      case 'pending':
        return (
          <Badge bg="warning" className="d-flex align-items-center gap-1">
            <span className="fw-bold">⌛</span> Pending
          </Badge>
        );
      case 'rejected':
        return (
          <Badge bg="danger" className="d-flex align-items-center gap-1">
            <span className="fw-bold">✗</span> Rejected
          </Badge>
        );
      default:
        return (
          <Badge bg="secondary" className="d-flex align-items-center gap-1">
            <span className="fw-bold">!</span> Active
          </Badge>
        );
    }
  };

  // Filter tasks based on status
  const filteredTasks = filterStatus === 'all' 
    ? tasks 
    : tasks.filter(task => task.status === filterStatus);

  // Calculate completion percentage and determine if task is completed
  const getCompletionPercentage = (task) => {
    return Math.round((task.completed_quantity / task.assigned_quantity) * 100);
  };

  // Check if task is fully completed (100%)
  const isTaskCompleted = (task) => {
    return getCompletionPercentage(task) >= 100;
  };

  // Render loading spinner
  if (loading) {
    return (
      <Container className="d-flex flex-column align-items-center justify-content-center py-5">
        <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
        <p className="mt-3 text-muted">Loading your tasks...</p>
      </Container>
    );
  }

  return (
    <Container fluid className="p-4">
      <Card className="shadow-sm">
        <Card.Header className="bg-white border-0">
          <Row className="align-items-center">
            <Col>
              <h4 className="mb-0">My Assigned Tasks</h4>
              <p className="text-muted mb-0 small">Manage and update your task progress</p>
            </Col>
            <Col xs="auto">
              <Button 
                variant="outline-secondary" 
                size="sm" 
                onClick={fetchTasks}
                className="d-flex align-items-center gap-1"
              >
                <span className="fw-bold">↻</span> Refresh
              </Button>
            </Col>
          </Row>
        </Card.Header>
        
        <Card.Body>
          {/* Error Alert */}
          {showError && error && (
            <Alert 
              variant="danger" 
              className="mb-4"
              onClose={() => setShowError(false)} 
              dismissible
            >
              <Alert.Heading>Error!</Alert.Heading>
              <p>{error}</p>
            </Alert>
          )}

          {/* Filter Controls */}
          <Row className="mb-4">
            <Col md={4}>
              <Form.Group>
                <Form.Label className="text-muted small">Filter by status</Form.Label>
                <Form.Select 
                  size="sm"
                  value={filterStatus} 
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">All Tasks</option>
                  <option value="accepted">Accepted</option>
                  <option value="pending">Pending</option>
                  <option value="rejected">Rejected</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col className="text-end align-self-end">
              <small className="text-muted">
                Showing {filteredTasks.length} of {tasks.length} tasks
              </small>
            </Col>
          </Row>

          {/* Tasks Table */}
          {filteredTasks.length > 0 ? (
            <div className="table-responsive">
              <Table hover className="align-middle">
                <thead className="bg-light">
                  <tr>
                    <th style={{ width: '25%' }}>Job Details</th>
                    <th style={{ width: '15%' }}>Status</th>
                    <th style={{ width: '20%' }}>Progress</th>
                    <th style={{ width: '20%' }}>Payment</th>
                    <th style={{ width: '20%' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTasks.map(task => {
                    const completionPercentage = getCompletionPercentage(task);
                    const isCompleted = isTaskCompleted(task);
                    
                    return (
                      <tr key={task.assignment_id}>
                        <td>
                          <div className="fw-bold">{task.job_name}</div>
                          <div className="text-muted small">{task.description}</div>
                        </td>
                        <td>
                          <div className="mb-1"><StatusBadge status={task.status} /></div>
                          <div>
                            {/* Show completed status only when progress is 100% */}
                            <JobStatusBadge status={isCompleted ? 'completed' : task.job_status} />
                          </div>
                        </td>
                        <td>
                          <div className="d-flex justify-content-between mb-1">
                            <small>Completed: {task.completed_quantity}/{task.assigned_quantity}</small>
                            <small>{completionPercentage}%</small>
                          </div>
                          <ProgressBar 
                            now={completionPercentage}
                            variant={isCompleted ? 'success' : completionPercentage > 70 ? 'info' : 'primary'}
                          />
                        </td>
                        <td>
                          <div>Rate: <span className="fw-bold">LKR {parseFloat(task.pay_per_unit).toFixed(2)}</span>/unit</div>
                          <div>Earned: <span className="fw-bold text-success">LKR {parseFloat(task.earned_amount).toFixed(2)}</span></div>
                        </td>
                        <td>
                          {/* Only show update button if task is accepted and not completed (100%) */}
                          {task.status === 'accepted' && !isCompleted && (
                            <Button 
                              variant="outline-primary" 
                              size="sm"
                              className="w-100"
                              onClick={() => {
                                setCurrentTask(task);
                                setCompletedQuantity(task.completed_quantity);
                                setShowUpdateModal(true);
                              }}
                            >
                              Update Progress
                            </Button>
                          )}
                          {(task.status !== 'accepted' || isCompleted) && (
                            <Button variant="outline-secondary" size="sm" className="w-100" disabled>
                              {isCompleted ? 'Completed' : 'Awaiting Approval'}
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </div>
          ) : (
            <Card className="text-center p-5 bg-light">
              <Card.Body>
                <div className="fs-3 text-muted mb-3">⚠️</div>
                <h5>No Tasks Found</h5>
                <p className="text-muted">
                  {tasks.length > 0 
                    ? `No tasks matching the "${filterStatus}" filter. Try changing your filter.`
                    : 'You currently have no assigned tasks.'}
                </p>
              </Card.Body>
            </Card>
          )}
        </Card.Body>
      </Card>

      {/* Update Progress Modal */}
      <Modal 
        show={showUpdateModal} 
        onHide={() => setShowUpdateModal(false)}
        centered
      >
        <Modal.Header closeButton className="border-0">
          <Modal.Title>Update Task Progress</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentTask && (
            <>
              <div className="mb-4">
                <h5>{currentTask.job_name}</h5>
                <p className="text-muted mb-0">{currentTask.description}</p>
              </div>

              <div className="mb-4">
                <div className="d-flex justify-content-between mb-1">
                  <small>Current Progress</small>
                  <small>{getCompletionPercentage(currentTask)}%</small>
                </div>
                <ProgressBar 
                  now={getCompletionPercentage(currentTask)}
                  variant={isTaskCompleted(currentTask) ? 'success' : 'primary'}
                />
              </div>

              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Total Assigned Quantity</Form.Label>
                  <Form.Control 
                    plaintext 
                    readOnly 
                    value={currentTask.assigned_quantity}
                    className="fw-bold" 
                  />
                </Form.Group>
                
                <Form.Group className="mb-4">
                  <Form.Label>Completed Quantity</Form.Label>
                  <Form.Control 
                    type="number"
                    min="0"
                    max={currentTask.assigned_quantity}
                    value={completedQuantity}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      if (!isNaN(value) && value >= 0 && value <= currentTask.assigned_quantity) {
                        setCompletedQuantity(value);
                      }
                    }}
                  />
                  <Form.Text className="text-muted">
                    Enter a number between 0 and {currentTask.assigned_quantity}
                  </Form.Text>
                </Form.Group>
                
                <Card className="bg-light border-0 mb-3">
                  <Card.Body>
                    <div className="d-flex justify-content-between">
                      <span>Pay Rate:</span>
                      <span>LKR {parseFloat(currentTask.pay_per_unit).toFixed(2)}/unit</span>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span>Units Completed:</span>
                      <span>{completedQuantity}</span>
                    </div>
                    <hr />
                    <div className="d-flex justify-content-between fw-bold">
                      <span>Estimated Earnings:</span>
                      <span className="text-success">
                        LKR {(completedQuantity * parseFloat(currentTask.pay_per_unit || 0)).toFixed(2)}
                      </span>
                    </div>
                  </Card.Body>
                </Card>
              </Form>
            </>
          )}
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button variant="light" onClick={() => setShowUpdateModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={updateCompletedQuantity}
            disabled={
              updating || 
              completedQuantity === currentTask?.completed_quantity ||
              completedQuantity < 0 ||
              completedQuantity > currentTask?.assigned_quantity
            }
          >
            {updating ? (
              <>
                <Spinner as="span" size="sm" animation="border" role="status" aria-hidden="true" />
                {' Updating...'}
              </>
            ) : 'Update Progress'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default EmployeeTasks;