import React, { useState } from 'react';
import { MessageSquare, Heart, Search, User, Package, BarChart3, Settings, Plus, Edit, Trash2, Send, Star, Check, Sparkles, Crown, Gem, ShoppingBag, Filter } from 'lucide-react';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('welcome');
  const [cartItems, setCartItems] = useState([]);

  const pages = [
    { id: 'welcome', name: 'Welcome/About' },
    { id: 'login', name: 'Login' },
    { id: 'products', name: 'Products' },
    { id: 'cart', name: 'Cart' },
    { id: 'messages', name: 'Messages' },
    { id: 'admin', name: 'Admin Dashboard' }
  ];

  const addToCart = (product) => {
    setCartItems([...cartItems, product]);
  };

  const removeFromCart = (index) => {
    const newCart = cartItems.filter((_, i) => i !== index);
    setCartItems(newCart);
  };

  const WelcomePage = () => (
    <div className="gradient-bg">
      <header className="header">
        <div className="header-container">
          <div className="logo-container">
            <div className="logo-icon">
              <Gem size={24} />
            </div>
            <span className="logo-text">KL Scents PH</span>
          </div>
          <nav>
            <ul className="nav-menu">
              <li><a href="#">About</a></li>
              <li><a href="#">Shop</a></li>
              <li><a href="#">Collections</a></li>
              <li><a href="#">Contact</a></li>
            </ul>
          </nav>
          <div className="header-actions">
            <button className="icon-btn"><Search size={20} /></button>
            <button className="icon-btn"><User size={20} /></button>
            <button className="icon-btn">
              <ShoppingBag size={20} />
              {cartItems.length > 0 && <span className="badge">{cartItems.length}</span>}
            </button>
          </div>
        </div>
      </header>

      <div className="hero-section">
        <div className="hero-grid">
          <div className="hero-content">
            <span className="badge-new">
              <Crown size={16} />
              New Collection 2024
            </span>
            <h1 className="hero-title">
              Discover Your <span className="gradient-text">Signature Scent</span>
            </h1>
            <p className="hero-subtitle">
              Curated collection of luxury perfumes from around the world. Experience elegance in every bottle.
            </p>
            <div className="btn-group">
              <button className="btn-primary" onClick={() => setCurrentPage('products')}>
                Explore Collection
              </button>
              <button className="btn-secondary">
                Learn More
              </button>
            </div>
            <div className="stats-container">
              <div className="stat-item">
                <p className="stat-value">500+</p>
                <p className="stat-label">Premium Scents</p>
              </div>
              <div className="stat-item">
                <p className="stat-value">50K+</p>
                <p className="stat-label">Happy Customers</p>
              </div>
              <div className="stat-item">
                <div className="star-rating">
                  {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="#D4AF37" color="#D4AF37" />)}
                </div>
                <p className="stat-label">5.0 Rating</p>
              </div>
            </div>
          </div>
          <div className="hero-image">
            <div className="blob-gold"></div>
            <div className="blob-dark"></div>
            <div className="perfume-display">
              <div className="crystal-bottle"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="features-section">
        <div className="features-container">
          <div className="features-header">
            <span className="section-badge">Why Choose Us</span>
            <h2 className="section-title">About KL Scents PH</h2>
            <p className="section-description">
              We bring you the finest selection of perfumes with unmatched quality and service
            </p>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <Package size={32} />
              </div>
              <h3 className="feature-title">Premium Quality</h3>
              <p className="feature-description">
                Only authentic designer fragrances from trusted brands worldwide. 100% genuine guarantee.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <Heart size={32} />
              </div>
              <h3 className="feature-title">Curated Selection</h3>
              <p className="feature-description">
                Hand-picked perfumes for every personality and occasion. Find your perfect match.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <MessageSquare size={32} />
              </div>
              <h3 className="feature-title">Expert Guidance</h3>
              <p className="feature-description">
                Personalized recommendations from fragrance specialists. We're here to help.
              </p>
            </div>
          </div>
        </div>
      </div>

      <footer className="footer">
        <div className="footer-container">
          <div className="footer-logo">
            <div className="footer-logo-icon">
              <Gem size={20} />
            </div>
            <span>KL Scents PH</span>
          </div>
          <p className="footer-tagline">Experience luxury in every drop</p>
          <p className="footer-copyright">© 2024 KL Scents PH. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );

  const LoginPage = () => (
    <div className="login-container">
      <div className="blob-gold"></div>
      <div className="blob-dark"></div>
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">
            <Gem size={32} />
          </div>
          <h2 className="login-title">Welcome Back</h2>
          <p className="login-subtitle">Sign in to continue your journey</p>
        </div>
        <div className="form-group">
          <label className="form-label">Email Address</label>
          <input type="email" className="form-input" placeholder="your@email.com" />
        </div>
        <div className="form-group">
          <label className="form-label">Password</label>
          <input type="password" className="form-input" placeholder="••••••••" />
        </div>
        <div className="form-row">
          <label className="checkbox-label">
            <input type="checkbox" />
            Remember me
          </label>
          <a href="#" className="link">Forgot password?</a>
        </div>
        <button className="btn-primary" style={{ width: '100%', marginBottom: '1rem' }}>
          Sign In
        </button>
        <button className="btn-guest" style={{ width: '100%', marginBottom: '1rem' }}>
          Continue as Guest
        </button>
        <div style={{ textAlign: 'center', fontSize: '0.875rem', color: '#9ca3af' }}>
          Don't have an account? <a href="#" className="link">Sign up free</a>
        </div>
        <div className="divider">
          <div className="divider-container">
            <span className="divider-text">Or continue with</span>
          </div>
        </div>
        <div className="social-buttons">
          <button className="btn-social">🔍 Google</button>
          <button className="btn-social">📘 Facebook</button>
        </div>
      </div>
    </div>
  );

  const ProductPage = () => {
    const products = [
      { id: 1, name: "Luxury Parfum 1", brand: "Designer Brand", price: 99, size: "50ml", notes: ["Fresh", "Citrus", "Woody"], available: true },
      { id: 2, name: "Luxury Parfum 2", brand: "Designer Brand", price: 109, size: "50ml", notes: ["Floral", "Sweet", "Musk"], available: true },
      { id: 3, name: "Luxury Parfum 3", brand: "Designer Brand", price: 119, size: "50ml", notes: ["Oriental", "Spicy", "Amber"], available: false },
      { id: 4, name: "Luxury Parfum 4", brand: "Designer Brand", price: 129, size: "50ml", notes: ["Aquatic", "Fresh", "Clean"], available: true },
      { id: 5, name: "Luxury Parfum 5", brand: "Designer Brand", price: 139, size: "50ml", notes: ["Woody", "Leather", "Smoky"], available: true },
      { id: 6, name: "Luxury Parfum 6", brand: "Designer Brand", price: 149, size: "50ml", notes: ["Fruity", "Sweet", "Vanilla"], available: true },
      { id: 7, name: "Luxury Parfum 7", brand: "Designer Brand", price: 159, size: "50ml", notes: ["Green", "Herbal", "Fresh"], available: true },
      { id: 8, name: "Luxury Parfum 8", brand: "Designer Brand", price: 169, size: "50ml", notes: ["Gourmand", "Sweet", "Coffee"], available: false },
      { id: 9, name: "Luxury Parfum 9", brand: "Designer Brand", price: 179, size: "50ml", notes: ["Chypre", "Mossy", "Citrus"], available: true }
    ];

    return (
      <div className="gradient-bg">
        <header className="header">
          <div className="header-container">
            <div className="logo-container">
              <div className="logo-icon">
                <Gem size={24} />
              </div>
              <span className="logo-text">KL Scents PH</span>
            </div>
            <div style={{ flex: 1, maxWidth: '42rem', margin: '0 2rem' }}>
              <div style={{ position: 'relative' }}>
                <Search size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#D4AF37' }} />
                <input 
                  type="text" 
                  placeholder="Search for your perfect scent..."
                  className="form-input"
                  style={{ paddingLeft: '3rem' }}
                />
              </div>
            </div>
            <div className="header-actions">
              <button className="icon-btn"><User size={20} /></button>
              <button className="icon-btn" onClick={() => setCurrentPage('cart')}>
                <ShoppingBag size={20} />
                {cartItems.length > 0 && <span className="badge">{cartItems.length}</span>}
              </button>
            </div>
          </div>
        </header>

        <div className="products-container">
          <div className="products-layout">
            <div className="filters-sidebar">
              <div className="filter-card">
                <div className="filter-header">
                  <Filter size={20} />
                  <h3 className="filter-title">Filters</h3>
                </div>
                <div className="filter-section">
                  <h4 className="filter-section-title">Category</h4>
                  <div className="filter-options">
                    {['Women', 'Men', 'Unisex'].map(cat => (
                      <div key={cat} className="filter-option">
                        <input type="checkbox" id={cat} />
                        <label htmlFor={cat}>{cat}</label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="filter-section">
                  <h4 className="filter-section-title">Availability</h4>
                  <div className="filter-options">
                    <div className="filter-option">
                      <input type="checkbox" id="available" />
                      <label htmlFor="available">Available</label>
                    </div>
                    <div className="filter-option">
                      <input type="checkbox" id="out-of-stock" />
                      <label htmlFor="out-of-stock">Out of Stock</label>
                    </div>
                  </div>
                </div>
                <div className="filter-section">
                  <h4 className="filter-section-title">Price Range</h4>
                  <input type="range" style={{ width: '100%' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: '#D4AF37', marginTop: '0.75rem' }}>
                    <span>₱20</span>
                    <span>₱500</span>
                  </div>
                </div>
                <div className="filter-section">
                  <h4 className="filter-section-title">Brand</h4>
                  <div className="filter-options">
                    {['Chanel', 'Dior', 'Tom Ford', 'Versace'].map(brand => (
                      <div key={brand} className="filter-option">
                        <input type="checkbox" id={brand} />
                        <label htmlFor={brand}>{brand}</label>
                      </div>
                    ))}
                  </div>
                </div>
                <button className="btn-primary" style={{ width: '100%' }}>Apply Filters</button>
              </div>
            </div>

            <div className="products-main">
              <div className="products-header">
                <div>
                  <h2 className="products-title">All Perfumes</h2>
                  <p className="products-count">Showing all available products</p>
                </div>
                <select className="sort-select">
                  <option>Sort by: Featured</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                  <option>Newest Arrivals</option>
                </select>
              </div>

              <div className="products-grid">
                {products.map(product => (
                  <div key={product.id} className={`product-card ${!product.available ? 'out-of-stock' : ''}`}>
                    <div className="product-image">
                      <div className="bottle-design">
                        <div className="bottle-neck"></div>
                        <div className="bottle-body"></div>
                        <div className="bottle-base"></div>
                      </div>
                      {product.available && <span className="new-badge">NEW</span>}
                      {!product.available && <span className="out-of-stock-badge">OUT OF STOCK</span>}
                    </div>
                    <div className="product-info">
                      <div className="star-rating">
                        {[...Array(5)].map((_, idx) => <Star key={idx} size={12} fill="#D4AF37" color="#D4AF37" />)}
                      </div>
                      <h3 className="product-name">{product.name}</h3>
                      <p className="product-brand">{product.brand} • {product.size}</p>
                      <div className="product-footer">
                        <div className="price-section">
                          <span className="product-price">₱{product.price}</span>
                        </div>
                        <div className="product-actions">
                          <button 
                            className="btn-add-cart"
                            disabled={!product.available}
                            onClick={() => product.available && addToCart(product)}
                          >
                            {product.available ? 'Add to Cart' : 'Unavailable'}
                          </button>
                          <button className="btn-review">
                            <Star size={16} />
                            Review Product
                          </button>
                        </div>
                      </div>
                      {product.available && (
                        <span className="availability-badge available">Available</span>
                      )}
                      {!product.available && (
                        <span className="availability-badge unavailable">Out of Stock</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

const CartPage = () => {
  // Default cart items for mockup
  const defaultCartItems = [
    { id: 1, name: "Luxury Parfum 1", brand: "Designer Brand", price: 99, size: "50ml", available: true },
    { id: 2, name: "Luxury Parfum 4", brand: "Designer Brand", price: 129, size: "50ml", available: true }
  ];

  const cartItemsToShow = cartItems.length > 0 ? cartItems : defaultCartItems;

  return (
    <div className="gradient-bg">
      <header className="header">
        <div className="header-container">
          <div className="logo-container">
            <div className="logo-icon">
              <Gem size={24} />
            </div>
            <span className="logo-text">KL Scents PH</span>
          </div>
        </div>
      </header>
      <div className="cart-container">
        <div className="cart-header">
          <h1 className="cart-title">Your Selected Items</h1>
          <p className="cart-subtitle">Review your items before messaging the seller</p>
        </div>
        <div className="cart-layout">
          <div className="cart-items">
            {cartItemsToShow.map((item, index) => (
              <div key={index} className="cart-item">
                <div className="cart-item-content">
                  <div className="cart-item-image">
                    <div className="mini-bottle"></div>
                  </div>
                  <div className="cart-item-details">
                    <div className="cart-item-header">
                      <div>
                        <h3 className="cart-item-name">{item.name}</h3>
                        <p className="cart-item-meta">{item.brand} • {item.size}</p>
                        <div className="star-rating" style={{ marginTop: '0.5rem' }}>
                          {[...Array(5)].map((_, idx) => <Star key={idx} size={12} fill="#D4AF37" color="#D4AF37" />)}
                        </div>
                        <span className="availability-badge available" style={{ marginTop: '0.5rem' }}>Available</span>
                      </div>
                      <button className="btn-remove" onClick={() => removeFromCart(index)}>
                        <Trash2 size={20} />
                      </button>
                    </div>
                    <div className="cart-item-footer">
                      <span className="cart-item-price">₱{item.price}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div>
            <div className="order-summary">
              <h2 className="summary-title">Ready to Purchase?</h2>
              <p className="summary-description">Message the seller to arrange payment and delivery details</p>
              <div className="summary-items-list">
                <p className="summary-label">Items to discuss:</p>
                {cartItemsToShow.map((item, index) => (
                  <div key={index} className="summary-item">
                    <span>{item.name}</span>
                    <span className="summary-item-price">₱{item.price}</span>
                  </div>
                ))}
              </div>
              <div className="summary-total">
                <span>Total</span>
                <span className="summary-total-price">
                  ₱{cartItemsToShow.reduce((sum, item) => sum + item.price, 0)}
                </span>
              </div>
              <button className="btn-checkout">
                <MessageSquare size={20} />
                Message Seller
              </button>
              <div className="secure-badge">
                <Check size={16} />
                <span>Direct seller communication</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

  const MessagesPage = () => (
    <div className="messages-container">
      <header className="header">
        <div className="header-container">
          <div className="logo-container">
            <div className="logo-icon">
              <Gem size={24} />
            </div>
            <span className="logo-text">KL Scents PH</span>
          </div>
        </div>
      </header>

      <div className="messages-layout-single">
        <div className="chat-area">
          <div className="chat-header">
            <div className="chat-user-info">
              <div className="chat-avatar">
                <User size={20} />
              </div>
              <div>
                <h3 className="chat-user-name">KL Scents PH Seller</h3>
                <div className="online-status">
                  <div className="online-dot"></div>
                  <span className="online-text">Online</span>
                </div>
              </div>
            </div>
          </div>

          <div className="chat-messages">
            <div className="message-wrapper">
              <div className="message-avatar">
                <User size={16} />
              </div>
              <div className="message-content">
                <div className="message-bubble received">
                  <p className="message-text">Hello! Welcome to KL Scents PH. How can I help you today? 👋</p>
                </div>
                <span className="message-time received">10:30 AM</span>
              </div>
            </div>

            <div className="message-wrapper sent">
              <div className="message-content">
                <div className="message-bubble sent">
                  <p className="message-text">Hi! I'm interested in purchasing Luxury Parfum 1. Is it still available?</p>
                </div>
                <span className="message-time sent">10:32 AM</span>
              </div>
            </div>

            <div className="message-wrapper">
              <div className="message-avatar">
                <User size={16} />
              </div>
              <div className="message-content">
                <div className="message-bubble received">
                  <p className="message-text">Yes, it's available! It's a wonderful choice. The price is ₱99. Would you like to know about payment and delivery options? 🧴✨</p>
                </div>
                <span className="message-time received">10:33 AM</span>
              </div>
            </div>

            <div className="message-wrapper sent">
              <div className="message-content">
                <div className="message-bubble sent">
                  <p className="message-text">Yes please! What payment methods do you accept?</p>
                </div>
                <span className="message-time sent">10:34 AM</span>
              </div>
            </div>

            <div className="message-wrapper">
              <div className="message-avatar">
                <User size={16} />
              </div>
              <div className="message-content">
                <div className="message-bubble received">
                  <p className="message-text">We accept GCash, bank transfer, and cash on delivery for Metro Manila. Shipping takes 2-3 business days. I'll send you the payment details! 📦💜</p>
                </div>
                <span className="message-time received">10:35 AM</span>
              </div>
            </div>
          </div>

          <div className="chat-input-area">
            <div className="chat-input-wrapper">
              <input type="text" className="chat-input" placeholder="Type your message..." />
              <button className="btn-send">
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const AdminPage = () => (
    <div className="admin-layout">
      <div className="admin-sidebar">
        <div className="admin-sidebar-header">
          <div className="admin-logo-container">
            <div className="admin-logo-icon">
              <Settings size={24} />
            </div>
            <div>
              <div className="admin-logo-text">Admin</div>
              <div className="admin-logo-subtitle">Dashboard Panel</div>
            </div>
          </div>
        </div>
        <nav className="admin-nav">
          <ul className="admin-nav-list">
            <li className="admin-nav-item active">
              <Package size={20} />
              <span>Products</span>
            </li>
            <li className="admin-nav-item">
              <BarChart3 size={20} />
              <span>Analytics</span>
            </li>
            <li className="admin-nav-item">
              <MessageSquare size={20} />
              <span>Messages</span>
            </li>
            <li className="admin-nav-item">
              <Settings size={20} />
              <span>Settings</span>
            </li>
          </ul>
        </nav>
      </div>

      <div className="admin-main">
        <header className="admin-header">
          <div className="admin-header-content">
            <div>
              <h1 className="admin-header-title">Product Management</h1>
              <p className="admin-header-subtitle">Manage your perfume inventory</p>
            </div>
            <button className="btn-add">
              <Plus size={16} />
              Add Product
            </button>
          </div>
        </header>

        <div className="admin-content">
          <div className="table-card">
            <div className="table-header">
              <h2 className="table-title">All Products</h2>
              <div className="table-actions">
                <input type="text" className="table-search" placeholder="Search products..." />
                <select className="table-filter">
                  <option>All Categories</option>
                  <option>Women</option>
                  <option>Men</option>
                  <option>Unisex</option>
                </select>
                <select className="table-filter">
                  <option>All Availability</option>
                  <option>Available</option>
                  <option>Out of Stock</option>
                </select>
              </div>
            </div>
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Availability</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: 'Luxury Parfum 1', category: 'Women', price: '₱99.00', available: true },
                    { name: 'Luxury Parfum 2', category: 'Men', price: '₱109.00', available: true },
                    { name: 'Luxury Parfum 3', category: 'Unisex', price: '₱119.00', available: false },
                    { name: 'Luxury Parfum 4', category: 'Women', price: '₱129.00', available: true },
                    { name: 'Luxury Parfum 5', category: 'Men', price: '₱139.00', available: true },
                    { name: 'Luxury Parfum 6', category: 'Unisex', price: '₱149.00', available: false }
                  ].map((product, i) => (
                    <tr key={i}>
                      <td>
                        <div className="product-cell">
                          <div className="product-image-small">
                            <div className="mini-bottle"></div>
                          </div>
                          <div>
                            <div className="product-name-cell">{product.name}</div>
                            <div className="product-brand-cell">Designer Brand</div>
                          </div>
                        </div>
                      </td>
                      <td className="table-text">{product.category}</td>
                      <td className="table-price">{product.price}</td>
                      <td>
                        <label className="availability-toggle">
                          <input type="checkbox" checked={product.available} readOnly />
                          <span className="toggle-slider"></span>
                          <span className={`toggle-label ${product.available ? 'available' : 'unavailable'}`}>
                            {product.available ? 'Available' : 'Out of Stock'}
                          </span>
                        </label>
                      </td>
                      <td>
                        <div className="table-actions-cell">
                          <button className="btn-icon edit">
                            <Edit size={16} />
                          </button>
                          <button className="btn-icon delete">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const pagesToHideNav = ['admin'];

  const renderPage = () => {
    switch (currentPage) {
      case 'welcome': return <WelcomePage />;
      case 'login': return <LoginPage />;
      case 'products': return <ProductPage />;
      case 'cart': return <CartPage />;
      case 'messages': return <MessagesPage />;
      case 'admin': return <AdminPage />;
      default: return <WelcomePage />;
    }
  };

  return (
    <div>
      {!pagesToHideNav.includes(currentPage) && (
        <div className="page-nav">
          <h3 className="page-nav-title">Navigate Pages:</h3>
          <ul className="page-nav-list">
            {pages.map(page => (
              <li key={page.id}>
                <button
                  onClick={() => setCurrentPage(page.id)}
                  className={`page-nav-btn ${currentPage === page.id ? 'active' : ''}`}
                >
                  {page.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {renderPage()}
    </div>
  );
}

export default App;