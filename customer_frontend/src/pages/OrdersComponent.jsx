import './OrdersComponent.css';

import React, { useEffect, useState } from 'react';

import axios from 'axios';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useNavigate } from 'react-router-dom';

const OrdersComponent = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Filter states
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDate, setFilterDate] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date-desc');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:4000/api/order/order', {
          headers: {
            token
          }
        });
        setOrders(response.data);
      } catch (err) {
        setError(err.response?.data?.error || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Function to format dates
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleString(undefined, options);
  };

  // Function to filter orders based on status, date, and search query
  const getFilteredOrders = () => {
    return orders.filter(order => {
      // Filter by status
      if (filterStatus !== 'all' && order.current_status !== filterStatus)
        return false;
      
      // Filter by date
      if (filterDate !== 'all') {
        const orderDate = new Date(order.order_date);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (filterDate === 'today' && 
            (orderDate.getDate() !== today.getDate() || 
             orderDate.getMonth() !== today.getMonth() || 
             orderDate.getFullYear() !== today.getFullYear()))
          return false;
          
        if (filterDate === 'yesterday' && 
            (orderDate.getDate() !== yesterday.getDate() || 
             orderDate.getMonth() !== yesterday.getMonth() || 
             orderDate.getFullYear() !== yesterday.getFullYear()))
          return false;
          
        if (filterDate === 'week') {
          const oneWeekAgo = new Date(today);
          oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
          if (orderDate < oneWeekAgo) return false;
        }
          
        if (filterDate === 'month') {
          const oneMonthAgo = new Date(today);
          oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
          if (orderDate < oneMonthAgo) return false;
        }
      }
      
      // Filter by search query (order ID or item product ID)
      if (searchQuery) {
        const orderIdMatch = order.order_id.toString().includes(searchQuery);
        const itemsMatch = order.items.some(item => 
          item.product_id.toString().includes(searchQuery)
        );
        if (!orderIdMatch && !itemsMatch) return false;
      }
      
      return true;
    });
  };

  // Function to sort filtered orders
  const getSortedOrders = () => {
    const filtered = getFilteredOrders();
    
    switch (sortBy) {
      case 'date-asc':
        return [...filtered].sort((a, b) => new Date(a.order_date) - new Date(b.order_date));
      case 'date-desc':
        return [...filtered].sort((a, b) => new Date(b.order_date) - new Date(a.order_date));
      case 'total-asc':
        return [...filtered].sort((a, b) => parseFloat(a.total_amount) - parseFloat(b.total_amount));
      case 'total-desc':
        return [...filtered].sort((a, b) => parseFloat(b.total_amount) - parseFloat(a.total_amount));
      case 'id-asc':
        return [...filtered].sort((a, b) => a.order_id - b.order_id);
      case 'id-desc':
        return [...filtered].sort((a, b) => b.order_id - a.order_id);
      default:
        return filtered;
    }
  };

  // Get ordered status options for filter
  const getStatusOptions = () => {
    const statuses = new Set(orders.map(order => order.current_status));
    return ['all', ...statuses];
  };

  // Reset all filters
  const resetFilters = () => {
    setFilterStatus('all');
    setFilterDate('all');
    setSearchQuery('');
    setSortBy('date-desc');
  };

  // Function to download order as PDF
  const downloadOrderAsPDF = async (orderId) => {
    try {
      // Find the order card element
      const element = document.getElementById(`order-${orderId}`);
      if (!element) {
        console.error('Order element not found');
        return;
      }

      // Create a clone of the element to avoid modifying the original
      const elementClone = element.cloneNode(true);
      elementClone.style.width = `${element.offsetWidth}px`;
      elementClone.style.padding = '20px';
      document.body.appendChild(elementClone);
      
      // Use html2canvas to capture the element as an image
      const canvas = await html2canvas(elementClone, {
        scale: 2, // Higher quality
        logging: false,
        useCORS: true,
      });
      
      // Remove the clone
      document.body.removeChild(elementClone);
      
      // Convert canvas to PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;
      
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      // Add additional pages if the content is too long
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      // Save the PDF
      pdf.save(`order_${orderId}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      setError('Failed to generate PDF. Please try again.');
    }
  };

  if (loading) return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p>Loading orders...</p>
    </div>
  );
  
  if (error) return (
    <div className="error-container">
      <div className="error-icon">⚠️</div>
      <h3>Error</h3>
      <p>{error}</p>
      <button className="primary-button" onClick={() => navigate('/')}>Back to Home</button>
    </div>
  );

  const filteredOrders = getSortedOrders();

  return (
    <div className="orders-container">
      <div className="orders-header">
        <div className="header-with-button">
          <h2>Your Orders</h2>
          <button
            className="home-button"
            onClick={() => navigate('/')}
          >
            Back to Home
          </button>
        </div>
        
        <div className="filters-container">
          <div className="filters-section">
            <div className="filter-group">
              <label htmlFor="status-filter">Status:</label>
              <select 
                id="status-filter"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Statuses</option>
                {getStatusOptions().filter(status => status !== 'all').map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
            
            <div className="filter-group">
              <label htmlFor="date-filter">Date:</label>
              <select 
                id="date-filter"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
              </select>
            </div>
            
            <div className="filter-group">
              <label htmlFor="sort-by">Sort By:</label>
              <select 
                id="sort-by"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="date-desc">Date (Newest First)</option>
                <option value="date-asc">Date (Oldest First)</option>
                <option value="total-desc">Total (High to Low)</option>
                <option value="total-asc">Total (Low to High)</option>
                <option value="id-desc">Order ID (High to Low)</option>
                <option value="id-asc">Order ID (Low to High)</option>
              </select>
            </div>
          </div>
          
          <div className="search-and-reset">
            <div className="search-container">
              <input
                type="text"
                placeholder="Search by Order ID or Product ID"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button 
                className="search-button"
                onClick={() => setSearchQuery('')}
                disabled={!searchQuery}
              >
                {searchQuery ? '✕' : '🔍'}
              </button>
            </div>
            
            <button 
              className="reset-button"
              onClick={resetFilters}
              disabled={filterStatus === 'all' && filterDate === 'all' && !searchQuery && sortBy === 'date-desc'}
            >
              Reset Filters
            </button>
          </div>
        </div>
        
        <div className="results-summary">
          Showing {filteredOrders.length} of {orders.length} orders
        </div>
      </div>
      
      {filteredOrders.length === 0 ? (
        <div className="no-orders-container">
          <div className="no-orders-icon">📋</div>
          <h3>No Orders Found</h3>
          <p>No orders match your current filter criteria.</p>
          <button className="secondary-button" onClick={resetFilters}>Clear Filters</button>
        </div>
      ) : (
        <div className="orders-list">
          {filteredOrders.map(order => (
            <div key={order.order_id} id={`order-${order.order_id}`} className="order-card">
              <div className="order-header">
                <h3>Order #{order.order_id}</h3>
                <span className={`status-badge ${order.current_status}`}>
                  {order.current_status}
                </span>
                <button 
                  className="download-pdf-button"
                  onClick={() => downloadOrderAsPDF(order.order_id)}
                  title="Download as PDF"
                >
                  📄 Download Bill
                </button>
              </div>
              
              <div className="order-meta">
                <div className="meta-item">
                  <span className="meta-label">Date:</span>
                  <span className="meta-value">{formatDate(order.order_date)}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Total:</span>
                  <span className="meta-value price">LKR{parseFloat(order.total_amount).toFixed(2)}</span>
                </div>
              </div>
              
              <div className="order-details">
                <div className="payment-info">
                  <div className="payment-method">
                    <span className="payment-label">Payment Method:</span>
                    <span className="payment-value">{order.payment_method}</span>
                  </div>
                  <div className="payment-status">
                    <span className="payment-label">Payment Status:</span>
                    <span className={`payment-value ${order.payment_status.toLowerCase()}`}>
                      {order.payment_status}
                    </span>
                  </div>
                  <div className="payment-amount">
                    <span className="payment-label">Amount Paid:</span>
                    <span className="payment-value price">LKR{parseFloat(order.amount_paid).toFixed(2)}</span>
                  </div>
                </div>
              </div>
              
              <div className="order-items">
                <h4>Items</h4>
                <div className="items-table-container">
                  <table className="items-table">
                    <thead>
                      <tr>
                        <th>Product ID</th>
                        <th>Quantity</th>
                        <th>Unit Price</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.items.map(item => (
                        <tr key={item.order_item_id}>
                          <td>{item.product_id}</td>
                          <td>{item.quantity}</td>
                          <td>LKR{parseFloat(item.unit_price).toFixed(2)}</td>
                          <td>LKR{(item.quantity * item.unit_price).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersComponent;