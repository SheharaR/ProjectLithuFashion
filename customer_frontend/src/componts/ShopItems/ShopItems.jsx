import 'bootstrap/dist/css/bootstrap.min.css';

import { Link, useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';

import { Badge } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

const ShopItems = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantities, setQuantities] = useState({});
  const [quantityErrors, setQuantityErrors] = useState({});
  const [cartCount, setCartCount] = useState(0);
  const navigate = useNavigate();

  const updateCartCount = () => {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    setCartCount(count);
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('http://localhost:4000/api/product/get');
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        const data = await response.json();
        if (data.success) {
          setProducts(data.products);
          const initialQuantities = {};
          data.products.forEach(product => {
            initialQuantities[product.productId] = 1;
          });
          setQuantities(initialQuantities);
        } else {
          throw new Error(data.message || 'Failed to fetch products');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
    updateCartCount();
  }, []);

  const handleQuantityChange = (productId, value) => {
    const numValue = parseInt(value);
    const product = products.find(p => p.productId === productId);
    
    if (value === '') {
      setQuantities(prev => ({ ...prev, [productId]: '' }));
      setQuantityErrors(prev => ({ ...prev, [productId]: '' }));
      return;
    }

    if (isNaN(numValue)) {
      setQuantities(prev => ({ ...prev, [productId]: 1 }));
      setQuantityErrors(prev => ({ ...prev, [productId]: 'Must be a number' }));
      return;
    }

    if (numValue < 1) {
      setQuantities(prev => ({ ...prev, [productId]: 1 }));
      setQuantityErrors(prev => ({ ...prev, [productId]: 'Minimum 1' }));
      return;
    }

    if (numValue > product.stock) {
      setQuantities(prev => ({ ...prev, [productId]: product.stock }));
      setQuantityErrors(prev => ({ ...prev, [productId]: `Max ${product.stock}` }));
      return;
    }

    setQuantities(prev => ({ ...prev, [productId]: numValue }));
    setQuantityErrors(prev => ({ ...prev, [productId]: '' }));
  };

  const addToCart = (product) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please login to add items to cart');
      navigate('/login');
      return;
    }

    const quantity = quantities[product.productId];
    if (!quantity || quantity < 1) {
      setQuantityErrors(prev => ({ ...prev, [product.productId]: 'Invalid quantity' }));
      return;
    }

    const cartItems = JSON.parse(localStorage.getItem('cart')) || [];
    const existingItemIndex = cartItems.findIndex(item => item.productId === product.productId);

    if (existingItemIndex >= 0) {
      const newQuantity = cartItems[existingItemIndex].quantity + quantity;
      if (newQuantity > product.stock) {
        setQuantityErrors(prev => ({ ...prev, [product.productId]: `Only ${product.stock} available` }));
        return;
      }
      cartItems[existingItemIndex].quantity = newQuantity;
    } else {
      cartItems.push({
        productId: product.productId,
        name: product.name,
        price: product.price,
        productImage: product.productImage,
        category: product.category,
        stock: product.stock,
        quantity: quantity
      });
    }

    localStorage.setItem('cart', JSON.stringify(cartItems));
    updateCartCount();
    alert(`${quantity} ${product.name}(s) added to cart!`);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '300px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger text-center mx-auto mt-5" style={{ maxWidth: '500px' }}>
        Error: {error}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="alert alert-info text-center mx-auto mt-5" style={{ maxWidth: '500px' }}>
        No products available
      </div>
    );
  }

  return (
    <div className="container-fluid position-relative" style={{ maxWidth: '1200px', padding: '20px' }}>
      {/* Cart Icon positioned inside component on right side */}
      <div className="position-absolute top-0 end-0 mt-3 me-3">
        <Link to="/cart" className="text-decoration-none">
          <Badge badgeContent={cartCount} color="error" overlap="circular">
            <ShoppingCartIcon style={{ fontSize: 30, color: '#333' }} />
          </Badge>
        </Link>
      </div>

      {/* Product Grid */}
      <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4 pt-5">
        {products.map((product) => (
          <div key={product.productId} className="col">
            <div className="card h-100 shadow-sm">
              {/* Product image with fixed aspect ratio */}
              <div className="card-img-top" style={{ 
                height: '250px', 
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f8f9fa'
              }}>
                <img 
                  src={`http://localhost:4000/images/${product.productImage}`} 
                  alt={product.name}
                  className="img-fluid"
                  style={{ 
                    maxHeight: '100%', 
                    width: 'auto',
                    objectFit: 'contain'
                  }}
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/300x300?text=No+Image';
                  }}
                />
              </div>
              
              <div className="card-body d-flex flex-column">
                <h5 className="card-title">{product.name}</h5>
                <span className="badge bg-secondary mb-2 text-capitalize">
                  {product.category}
                </span>
                
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="card-text text-danger mb-0">LKR{product.price}</h5>
                  <span className={`badge ${product.stock > 0 ? 'bg-success' : 'bg-danger'}`}>
                    {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                  </span>
                </div>
                
                <div className="mb-3">
                  <div className="input-group">
                    <span className="input-group-text">Quantity</span>
                    <input
                      type="number"
                      className={`form-control ${quantityErrors[product.productId] ? 'is-invalid' : ''}`}
                      min="1"
                      max={product.stock}
                      value={quantities[product.productId] ?? 1}
                      onChange={(e) => handleQuantityChange(product.productId, e.target.value)}
                      disabled={product.stock <= 0}
                    />
                  </div>
                  {quantityErrors[product.productId] && (
                    <div className="invalid-feedback d-block">
                      {quantityErrors[product.productId]}
                    </div>
                  )}
                </div>
                
                <button 
                  className={`btn ${product.stock > 0 ? 'btn-success' : 'btn-secondary'} mt-auto`}
                  disabled={product.stock <= 0 || quantityErrors[product.productId]}
                  onClick={() => addToCart(product)}
                >
                  {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ShopItems;