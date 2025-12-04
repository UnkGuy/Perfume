import React from 'react';
import { Gem, Search, User, ShoppingBag } from 'lucide-react';

const Header = ({ setCurrentPage, cartItems }) => {
  return (
    <header className="header">
      <div className="header-container">
        <div className="logo-container" onClick={() => setCurrentPage('welcome')} style={{cursor: 'pointer'}}>
          <div className="logo-icon">
            <Gem size={24} />
          </div>
          <span className="logo-text">KL Scents PH</span>
        </div>
        <nav>
          <ul className="nav-menu">
            <li><a href="#" onClick={() => setCurrentPage('welcome')}>About</a></li>
            <li><a href="#" onClick={() => setCurrentPage('products')}>Shop</a></li>
            <li><a href="#">Contact</a></li>
          </ul>
        </nav>
        <div className="header-actions">
          <button className="icon-btn" onClick={() => setCurrentPage('products')}>
            <Search size={20} />
          </button>
          <button className="icon-btn" onClick={() => setCurrentPage('login')}>
            <User size={20} />
          </button>
          <button className="icon-btn" onClick={() => setCurrentPage('cart')}>
            <ShoppingBag size={20} />
            {cartItems && cartItems.length > 0 && (
              <span className="badge">{cartItems.length}</span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;