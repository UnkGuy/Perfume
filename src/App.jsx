import React, { useState } from 'react';
import './App.css';

import WelcomePage from './WelcomePage';
import LoginPage from './LoginPage';
import ProductPage from './ProductPage';
import CartPage from './CartPage';
import MessagesPage from './MessagesPage';
import AdminPage from './AdminPage';

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

  const pagesToHideNav = []; // Added login here to hide the top nav buttons

  const renderPage = () => {
    switch (currentPage) {
      case 'welcome': 
        return <WelcomePage setCurrentPage={setCurrentPage} cartItems={cartItems} />;
      case 'login': 
        return <LoginPage setCurrentPage={setCurrentPage} />;
      case 'products': 
        return <ProductPage setCurrentPage={setCurrentPage} cartItems={cartItems} addToCart={addToCart} />;
      case 'cart': 
        return <CartPage setCurrentPage={setCurrentPage} cartItems={cartItems} removeFromCart={removeFromCart} />;
      case 'messages': 
        return <MessagesPage setCurrentPage={setCurrentPage} cartItems={cartItems} />;
      case 'admin': 
        return <AdminPage />;
      default: 
        return <WelcomePage setCurrentPage={setCurrentPage} cartItems={cartItems} />;
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