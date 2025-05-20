import { Alert, Badge, Button, Dropdown, Form, FormControl, InputGroup, Modal, Spinner, Table } from 'react-bootstrap';
import { useEffect, useState } from 'react';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showError, setShowError] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showItemsModal, setShowItemsModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showPaymentMethodModal, setShowPaymentMethodModal] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [newPaymentStatus, setNewPaymentStatus] = useState('');
  const [newPaymentMethod, setNewPaymentMethod] = useState('');
  const [updating, setUpdating] = useState(false);
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch all orders
  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      setShowError(false);
      
      const response = await fetch('http://localhost:4000/api/order/all_order');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to fetch orders');
      }

      setOrders(data);
      setFilteredOrders(data);
    } catch (err) {
      setError(err.message);
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Apply filters
  useEffect(() => {
    let result = [...orders];
    
    if (statusFilter !== 'all') {
      result = result.filter(order => order.current_status === statusFilter);
    }
    
    if (paymentFilter !== 'all') {
      result = result.filter(order => order.payment?.payment_status === paymentFilter);
    }
    
    if (methodFilter !== 'all') {
      result = result.filter(order => order.payment?.payment_method === methodFilter);
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(order => 
        order.order_id.toString().includes(term) ||
        (order.customer?.name && order.customer.name.toLowerCase().includes(term)) ||
        (order.customer?.contact_number && order.customer.contact_number.includes(term))
      );
    }
    
    setFilteredOrders(result);
  }, [orders, statusFilter, paymentFilter, methodFilter, searchTerm]);

  // Update order status
  const updateOrderStatus = async () => {
    if (!currentOrder || !newStatus) return;

    try {
      setUpdating(true);
      setError(null);
      setShowError(false);
      
      const response = await fetch('http://localhost:4000/api/order/all_order_update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          order_id: currentOrder.order_id,
          new_status: newStatus
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || result.message || 'Failed to update order status');
      }

      const updatedOrders = orders.map(order => 
        order.order_id === currentOrder.order_id 
          ? { ...order, current_status: newStatus } 
          : order
      );
      
      setOrders(updatedOrders);
      setShowStatusModal(false);
    } catch (err) {
      setError(err.message);
      setShowError(true);
    } finally {
      setUpdating(false);
    }
  };

  // Update payment status
  const updatePaymentStatus = async () => {
    if (!currentOrder || !newPaymentStatus) return;

    try {
      setUpdating(true);
      setError(null);
      setShowError(false);
      
      const response = await fetch('http://localhost:4000/api/order/update_payment', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          order_id: currentOrder.order_id,
          payment_status: newPaymentStatus
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || result.message || 'Failed to update payment status');
      }

      const updatedOrders = orders.map(order => 
        order.order_id === currentOrder.order_id 
          ? { 
              ...order, 
              payment: {
                ...order.payment,
                payment_status: newPaymentStatus
              }
            } 
          : order
      );
      
      setOrders(updatedOrders);
      setShowPaymentModal(false);
    } catch (err) {
      setError(err.message);
      setShowError(true);
    } finally {
      setUpdating(false);
    }
  };

  // Update payment method (with restriction for full payment)
  const updatePaymentMethod = async () => {
    if (!currentOrder || !newPaymentMethod || currentOrder.payment?.payment_method === 'full') return;

    try {
      setUpdating(true);
      setError(null);
      setShowError(false);
      
      const response = await fetch('http://localhost:4000/api/order/update_payment_method', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          order_id: currentOrder.order_id,
          payment_method: newPaymentMethod,
          update_amount: newPaymentMethod === 'full' && currentOrder.payment?.payment_method === 'advance'
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || result.message || 'Failed to update payment method');
      }

      const updatedOrders = orders.map(order => 
        order.order_id === currentOrder.order_id 
          ? { 
              ...order, 
              payment: {
                ...order.payment,
                payment_method: newPaymentMethod,
                amount_paid: newPaymentMethod === 'full' && order.payment?.payment_method === 'advance'
                  ? order.payment?.total_amount
                  : order.payment?.amount_paid,
                balance: newPaymentMethod === 'full' && order.payment?.payment_method === 'advance'
                  ? 0
                  : order.payment?.balance,
                payment_status: newPaymentMethod === 'full' && order.payment?.payment_method === 'advance'
                  ? 'paid'
                  : order.payment?.payment_status
              }
            } 
          : order
      );
      
      setOrders(updatedOrders);
      setShowPaymentMethodModal(false);
    } catch (err) {
      setError(err.message);
      setShowError(true);
    } finally {
      setUpdating(false);
    }
  };

  // Status badge component
  const StatusBadge = ({ status }) => {
    switch (status) {
      case 'processing': return <Badge bg="warning">Processing</Badge>;
      case 'completed': return <Badge bg="info">Completed</Badge>;
      case 'delivered': return <Badge bg="success">Delivered</Badge>;
      case 'cancelled': return <Badge bg="danger">Cancelled</Badge>;
      case 'returned': return <Badge bg="secondary">Returned</Badge>;
      default: return <Badge bg="secondary">Unknown</Badge>;
    }
  };

  // Payment status badge
  const PaymentBadge = ({ status }) => {
    switch (status) {
      case 'paid': return <Badge bg="success">Paid</Badge>;
      case 'pending': return <Badge bg="warning">Pending</Badge>;
      case 'failed': return <Badge bg="danger">Failed</Badge>;
      case 'refunded': return <Badge bg="info">Refunded</Badge>;
      default: return <Badge bg="secondary">Unknown</Badge>;
    }
  };

  // Payment method badge
  const PaymentMethodBadge = ({ method }) => {
    switch (method) {
      case 'full': return <Badge bg="primary">Full Payment</Badge>;
      case 'advance': return <Badge bg="info">Advance Payment</Badge>;
      default: return <Badge bg="secondary">Unknown</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" />
        <p>Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="mb-4">Order Management</h2>
      
      {showError && error && (
        <Alert variant="danger" className="my-4" onClose={() => setShowError(false)} dismissible>
          <Alert.Heading>Error!</Alert.Heading>
          <p>{error}</p>
        </Alert>
      )}

      {/* Filters */}
      <div className="mb-4 p-3 bg-light rounded">
        <div className="row g-3">
          <div className="col-md-3">
            <Form.Group>
              <Form.Label>Order Status</Form.Label>
              <Form.Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="all">All Statuses</option>
                <option value="processing">Processing</option>
                <option value="completed">Completed</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
                <option value="returned">Returned</option>
              </Form.Select>
            </Form.Group>
          </div>
          
          <div className="col-md-3">
            <Form.Group>
              <Form.Label>Payment Status</Form.Label>
              <Form.Select value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)}>
                <option value="all">All Payments</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </Form.Select>
            </Form.Group>
          </div>

          <div className="col-md-3">
            <Form.Group>
              <Form.Label>Payment Method</Form.Label>
              <Form.Select value={methodFilter} onChange={(e) => setMethodFilter(e.target.value)}>
                <option value="all">All Methods</option>
                <option value="full">Full Payment</option>
                <option value="advance">Advance Payment</option>
              </Form.Select>
            </Form.Group>
          </div>
          
          <div className="col-md-3">
            <Form.Group>
              <Form.Label>Search</Form.Label>
              <InputGroup>
                <FormControl
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Button 
                  variant="outline-secondary" 
                  onClick={() => setSearchTerm('')}
                  disabled={!searchTerm}
                >
                  Clear
                </Button>
              </InputGroup>
            </Form.Group>
          </div>
        </div>
      </div>

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Customer</th>
            <th>Order Date</th>
            <th>Total</th>
            <th>Payment</th>
            <th>Status</th>
            <th>Items</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredOrders.length > 0 ? (
            filteredOrders.map(order => (
              <tr key={order.order_id}>
                <td>{order.order_id}</td>
                <td>
                  {order.customer?.name || 'N/A'}
                  <br />
                  <small>{order.customer?.contact_number || 'N/A'}</small>
                </td>
                <td>{new Date(order.order_date).toLocaleDateString()}</td>
                <td>
                  ${order.payment?.total_amount || '0.00'}
                  {order.payment?.payment_method === 'advance' && (
                    <div>
                      <small>
                        Paid: ${order.payment?.amount_paid || '0.00'}
                        <br />
                        Balance: ${order.payment?.balance || '0.00'}
                      </small>
                    </div>
                  )}
                </td>
                <td>
                  <PaymentBadge status={order.payment?.payment_status} />
                  <br />
                  <PaymentMethodBadge method={order.payment?.payment_method} />
                </td>
                <td><StatusBadge status={order.current_status} /></td>
                <td className="text-center">
                  <Button 
                    variant="link" 
                    onClick={() => {
                      setCurrentOrder(order);
                      setShowItemsModal(true);
                    }}
                  >
                    {order.items_count} items
                  </Button>
                </td>
                <td>
                  <Dropdown>
                    <Dropdown.Toggle variant="outline-primary" size="sm">
                      Actions
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      <Dropdown.Item 
                        onClick={() => {
                          setCurrentOrder(order);
                          setNewStatus(order.current_status);
                          setShowStatusModal(true);
                        }}
                      >
                        Update Status
                      </Dropdown.Item>
                      <Dropdown.Item 
                        onClick={() => {
                          setCurrentOrder(order);
                          setNewPaymentStatus(order.payment?.payment_status || 'pending');
                          setShowPaymentModal(true);
                        }}
                      >
                      
                        Update Payment Method
                        {order.payment?.payment_method === 'full' && (
                          <span className="text-muted ms-2">(Already full payment)</span>
                        )}
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="8" className="text-center">
                No orders found matching your criteria
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      {/* Items View Modal */}
      <Modal show={showItemsModal} onHide={() => setShowItemsModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Order #{currentOrder?.order_id} Items</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentOrder && (
            <>
              <div className="mb-3">
                <strong>Customer:</strong> {currentOrder.customer?.name || 'N/A'}<br />
                <strong>Order Date:</strong> {new Date(currentOrder.order_date).toLocaleString()}<br />
                <strong>Status:</strong> <StatusBadge status={currentOrder.current_status} />
              </div>
              
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>Product ID</th>
                    <th>Quantity</th>
                    <th>Unit Price</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {currentOrder.items?.map(item => (
                    <tr key={item.item_id}>
                      <td>{item.product_id}</td>
                      <td>{item.quantity}</td>
                      <td>${item.unit_price}</td>
                      <td>${item.subtotal}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan="3" className="text-end"><strong>Total:</strong></td>
                    <td><strong>${currentOrder.payment?.total_amount || '0.00'}</strong></td>
                  </tr>
                  {currentOrder.payment?.payment_method === 'advance' && (
                    <>
                      <tr>
                        <td colSpan="3" className="text-end"><strong>Amount Paid:</strong></td>
                        <td><strong>${currentOrder.payment?.amount_paid || '0.00'}</strong></td>
                      </tr>
                      <tr>
                        <td colSpan="3" className="text-end"><strong>Balance:</strong></td>
                        <td><strong>${currentOrder.payment?.balance || '0.00'}</strong></td>
                      </tr>
                    </>
                  )}
                </tfoot>
              </Table>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowItemsModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Status Update Modal */}
      <Modal show={showStatusModal} onHide={() => setShowStatusModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Update Order #{currentOrder?.order_id} Status</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Current Status</Form.Label>
              <Form.Control 
                plaintext 
                readOnly 
                value={currentOrder?.current_status} 
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>New Status</Form.Label>
              <Form.Select 
                value={newStatus} 
                onChange={(e) => setNewStatus(e.target.value)}
              >
                <option value="processing">Processing</option>
                <option value="completed">Completed</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
                <option value="returned">Returned</option>
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowStatusModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={updateOrderStatus}
            disabled={updating || !newStatus || newStatus === currentOrder?.current_status}
          >
            {updating ? (
              <>
                <Spinner as="span" size="sm" animation="border" role="status" aria-hidden="true" />
                {' Updating...'}
              </>
            ) : 'Update Status'}
          </Button>
        </Modal.Footer>
      </Modal>

     

      {/* Payment Method Update Modal */}
      <Modal show={showPaymentMethodModal} onHide={() => setShowPaymentMethodModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Update Order #{currentOrder?.order_id} Payment Method</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentOrder?.payment?.payment_method === 'full' ? (
            <Alert variant="info">
              This order is already using Full Payment. No changes can be made to the payment method.
            </Alert>
          ) : (
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Current Payment Method</Form.Label>
                <Form.Control 
                  plaintext 
                  readOnly 
                  value={currentOrder?.payment?.payment_method === 'advance' ? 'Advance Payment' : 'Full Payment'} 
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>New Payment Method</Form.Label>
                <Form.Select 
                  value={newPaymentMethod} 
                  onChange={(e) => setNewPaymentMethod(e.target.value)}
                >
                  <option value="">Select method</option>
                  <option value="full">Full Payment</option>
                  <option value="advance">Advance Payment</option>
                </Form.Select>
              </Form.Group>
              {currentOrder?.payment?.payment_method === 'advance' && newPaymentMethod === 'full' && (
                <Alert variant="info">
                  Changing to Full Payment will:
                  <ul>
                    <li>Update amount paid to total amount (${currentOrder?.payment?.total_amount || '0.00'})</li>
                    <li>Set payment status to "Paid"</li>
                    <li>Set balance to $0.00</li>
                  </ul>
                </Alert>
              )}
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPaymentMethodModal(false)}>
            Close
          </Button>
          {currentOrder?.payment?.payment_method !== 'full' && (
            <Button 
              variant="primary" 
              onClick={updatePaymentMethod}
              disabled={updating || !newPaymentMethod || newPaymentMethod === currentOrder?.payment?.payment_method}
            >
              {updating ? (
                <>
                  <Spinner as="span" size="sm" animation="border" role="status" aria-hidden="true" />
                  {' Updating...'}
                </>
              ) : 'Update Method'}
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default OrderManagement;