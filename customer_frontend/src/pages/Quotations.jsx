import './Quotations.css';

import { Alert, Button, Form, Spinner, Table } from 'react-bootstrap';
import React, { useEffect, useState } from 'react';

import { jwtDecode } from 'jwt-decode';

const Quotations = () => {
  const [orders, setOrders] = useState([]);
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [item, setItem] = useState(''); // Changed from specialNotes to item
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [designFiles, setDesignFiles] = useState([]);
  const [customerId, setCustomerId] = useState(null);

  // Item options for dropdown
  const itemOptions = [
    { value: '', label: 'Select an item' },
    { value: 'Medal', label: 'Medal' },
    { value: 'Batch', label: 'Batch' },
    { value: 'Mugs', label: 'Mugs' },
    { value: 'Sunirous', label: 'Sunirous' }
  ];

  // Decode token to get customer ID
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setCustomerId(decoded.id);
      } catch (err) {
        console.error('Error decoding token:', err);
      }
    }
  }, []);

  useEffect(() => {
    const fetchOrders = async () => {
      const token = localStorage.getItem('token');

      try {
        const response = await fetch('http://localhost:4000/api/order/all_customer_order_Id', {
          method: 'GET',
          headers: {
            token,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch orders');
        }

        const data = await response.json();
        setOrders(Array.isArray(data.orders) ? data.orders : []);
      } catch (err) {
        setError('Error fetching orders');
        console.error(err);
      }
    };

    if (customerId) {
      fetchOrders();
    }
  }, [customerId]);

  const handleFileChange = (e) => {
    setDesignFiles([...e.target.files]);
  };

  const handleCreateOrder = async () => {
    if (!description || !customerId) {
      setError('Description is required and you must be logged in');
      return;
    }

    setLoading(true);
    setError(null);

    const token = localStorage.getItem('token');
    const formData = new FormData();

    formData.append('customerId', customerId);
    formData.append('description', description);
    formData.append('quantity', quantity);
    formData.append('specialNotes', item); // Changed from specialNotes to item

    designFiles.forEach(file => {
      formData.append('designFiles', file);
    });

    try {
      const response = await fetch('http://localhost:4000/api/order/custom-order', {
        method: 'POST',
        headers: {
          token,
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setDescription('');
        setQuantity(1);
        setItem('');
        setDesignFiles([]);
        setLoading(false);
        setOrders(prevOrders => [...(Array.isArray(prevOrders) ? prevOrders : []), data.order || data]);
      } else {
        setError(data.message || 'Error creating order');
      }
    } catch (err) {
      setError('Error creating order');
      setLoading(false);
      console.error(err);
    }
  };

  return (
    <div className="quotations-container">
      <h2>Custom Orders</h2>

      {/* Form for creating a new order */}
      <div className="order-form-container mb-3">
        <h3>Create New Custom Order</h3>
        <Form>
          <Form.Group controlId="description" className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter order description"
            />
          </Form.Group>

          <Form.Group controlId="quantity" className="mb-3">
            <Form.Label>Quantity</Form.Label>
            <Form.Control
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </Form.Group>

          <Form.Group controlId="item" className="mb-3">
            <Form.Label>Item</Form.Label>
            <Form.Select
              value={item}
              onChange={(e) => setItem(e.target.value)}
            >
              {itemOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group controlId="designFiles" className="mb-3">
            <Form.Label>Design Files</Form.Label>
            <Form.Control
              type="file"
              multiple
              onChange={handleFileChange}
            />
            <Form.Text muted>
              Upload design files (images, PDFs, etc.)
            </Form.Text>
          </Form.Group>

          <Button 
            onClick={handleCreateOrder} 
            disabled={loading || !customerId} 
            variant="primary"
          >
            {loading ? (
              <>
                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> Creating...
              </>
            ) : (
              'Create Order'
            )}
          </Button>
        </Form>
      </div>

      {/* Error message */}
      {error && <Alert variant="danger">{error}</Alert>}

      {/* Display list of orders in a table */}
      {Array.isArray(orders) && orders.length > 0 ? (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>#</th>
              <th>Description</th>
              <th>Quantity</th>
              <th>Item</th> {/* Changed from Special Notes to Item */}
              <th>Status</th>
              <th>Created At</th>
              <th>Design Files</th>
            </tr>
          </thead>
          <tbody>
            {orders.filter(order => order).map((order, index) => (
              <tr key={order.orderId || index}>
                <td>{index + 1}</td>
                <td>{order.description || 'No description'}</td>
                <td>{order.quantity || 0}</td>
                <td>{order.specialNotes || 'N/A'}</td> {/* This will show the selected item */}
                <td>{order.status || 'Pending'}</td>
                <td>{order.createdAt ? new Date(order.createdAt).toLocaleString() : 'N/A'}</td>
                <td>
                  {order.designFiles && Array.isArray(order.designFiles) && order.designFiles.length > 0 ? (
                    <ul className="list-unstyled">
                      {order.designFiles.map((file, i) => (
                        <li key={i}>
                          <a 
                            href={`http://localhost:4000/images/${file}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                          >
                            {file}
                          </a>
                        </li>
                      ))}
                    </ul>
                  ) : 'No files'}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <p>No orders found.</p>
      )}
    </div>
  );
};

export default Quotations;