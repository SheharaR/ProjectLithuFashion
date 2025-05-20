import {
  Alert,
  Button,
  Card,
  Col,
  Container,
  Form,
  InputGroup,
  Row,
  Spinner
} from 'react-bootstrap';
import {
  BiCalendar,
  BiDetail,
  BiDollar,
  BiImageAlt,
  BiReset,
  BiSave,
  BiTask
} from 'react-icons/bi';
import React, { useState } from 'react';

import axios from 'axios';

const AdminJobForm = () => {
  const [formData, setFormData] = useState({
    job_name: '',
    description: '',
    start_date: '',
    end_date: '',
    quantity: '',
    pay_per_unit: '',
    design_image: null
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const [fileName, setFileName] = useState('No file chosen');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFormData({ ...formData, design_image: e.target.files[0] });
      setFileName(e.target.files[0].name);
    } else {
      setFormData({ ...formData, design_image: null });
      setFileName('No file chosen');
    }
  };

  const resetForm = () => {
    setFormData({
      job_name: '',
      description: '',
      start_date: '',
      end_date: '',
      quantity: '',
      pay_per_unit: '',
      design_image: null
    });
    setFileName('No file chosen');
    setFeedback({ type: '', message: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedback({ type: '', message: '' });
    
    const data = new FormData();
    for (const key in formData) {
      data.append(key, formData[key]);
    }
    
    try {
      await axios.post('http://localhost:4000/api/job', data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setFeedback({ 
        type: 'success', 
        message: 'Job created successfully!'
      });
      
      resetForm();
    } catch (error) {
      console.error('Error creating job:', error);
      setFeedback({ 
        type: 'danger', 
        message: error.response?.data?.message || 'Error creating job. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col lg={8} md={10}>
          <Card className="shadow-sm">
            <Card.Header className="bg-primary text-white">
              <h4 className="mb-0">
                <BiTask className="me-2" />
                Create New Task
              </h4>
            </Card.Header>
            
            <Card.Body className="p-4">
              {feedback.message && (
                <Alert 
                  variant={feedback.type} 
                  dismissible 
                  onClose={() => setFeedback({ type: '', message: '' })}
                >
                  {feedback.message}
                </Alert>
              )}
              
              <Form onSubmit={handleSubmit}>
                <Row className="mb-4">
                  <Col md={12}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        <BiTask className="me-1" /> Tsk Name
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="job_name"
                        placeholder="Enter job name"
                        value={formData.job_name}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                
                  <Col md={12}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        <BiDetail className="me-1" /> Description
                      </Form.Label>
                      <Form.Control
                        as="textarea"
                        name="description"
                        placeholder="Enter job description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={4}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>
                
                <Row className="mb-4">
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        <BiCalendar className="me-1" /> Start Date
                      </Form.Label>
                      <Form.Control
                        type="date"
                        name="start_date"
                        value={formData.start_date}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        <BiCalendar className="me-1" /> End Date
                      </Form.Label>
                      <Form.Control
                        type="date"
                        name="end_date"
                        value={formData.end_date}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>
                
                <Row className="mb-4">
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Quantity</Form.Label>
                      <Form.Control
                        type="number"
                        name="quantity"
                        placeholder="Enter quantity"
                        value={formData.quantity}
                        onChange={handleChange}
                        min="1"
                        required
                      />
                    </Form.Group>
                  </Col>
                  
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Pay Per Unit</Form.Label>
                      <InputGroup>
                        <InputGroup.Text>
                          <BiDollar />
                        </InputGroup.Text>
                        <Form.Control
                          type="number"
                          step="0.01"
                          name="pay_per_unit"
                          placeholder="0.00"
                          value={formData.pay_per_unit}
                          onChange={handleChange}
                          min="0.01"
                          required
                        />
                      </InputGroup>
                    </Form.Group>
                  </Col>
                </Row>
                
                <Form.Group className="mb-4">
                  <Form.Label>
                    <BiImageAlt className="me-1" /> Design Image
                  </Form.Label>
                  <InputGroup>
                    <Form.Control
                      type="file"
                      id="design-image"
                      name="design_image"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="d-none"
                    />
                    <Form.Control
                      readOnly
                      placeholder="No file chosen"
                      value={fileName}
                      onClick={() => document.getElementById('design-image').click()}
                      style={{ cursor: 'pointer' }}
                    />
                    <Button 
                      variant="outline-secondary"
                      onClick={() => document.getElementById('design-image').click()}
                    >
                      Browse
                    </Button>
                  </InputGroup>
                  <Form.Text className="text-muted">
                    Upload an image for this Task (optional)
                  </Form.Text>
                </Form.Group>
                
                <div className="d-flex gap-2 mt-4 justify-content-end">
                  <Button 
                    variant="outline-secondary" 
                    onClick={resetForm}
                    disabled={isSubmitting}
                  >
                    <BiReset className="me-1" /> Reset
                  </Button>
                  <Button 
                    type="submit" 
                    variant="primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Spinner 
                          as="span" 
                          animation="border" 
                          size="sm" 
                          className="me-2"
                        />
                        Creating...
                      </>
                    ) : (
                      <>
                        <BiSave className="me-1" /> Create Task
                      </>
                    )}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AdminJobForm;