// src/pages/WelcomePage.jsx
import React from 'react';
import { 
  Gem, Search, User, ShoppingBag, 
  Crown, Star, Package, Heart, MessageSquare, ArrowRight 
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const WelcomePage = () => {
  const { setCurrentPage, cartItems, isAuthenticated } = useAppContext();

  const handleNav = (page) => setCurrentPage(page);

  return (
    <div className="page-wrapper">
      
      {/* --- HEADER --- */}
      <header className="header">
        <div className="container flex-between">
          
          {/* Logo */}
          <div className="flex-center cursor-pointer logo-group" onClick={() => handleNav('welcome')}>
            <div className="text-gold"><Gem size={28} /></div>
            <span className="brand-font logo-text">KL Scents PH</span>
          </div>

          {/* Desktop Nav */}
          <nav className="hide-mobile">
            <ul className="flex-center nav-group">
              {['About', 'Shop', 'Collections', 'Contact'].map((item) => (
                <li key={item}>
                  <button className="nav-link nav-btn" onClick={() => handleNav('products')}>
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* Icons */}
          <div className="flex-center icon-group">
            <button className="nav-link icon-btn"><Search size={20} /></button>
            <button className="nav-link icon-btn" onClick={() => handleNav(isAuthenticated ? 'admin' : 'login')}>
              <User size={20} />
            </button>
            <button className="nav-link icon-btn" onClick={() => handleNav('cart')}>
              <ShoppingBag size={20} />
              {cartItems.length > 0 && (
                <span className="badge icon-badge">
                  {cartItems.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* --- HERO SECTION --- */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-grid">
            
            {/* Left Column: Text */}
            <div className="hero-text-col">
              <span className="badge hero-badge-wrapper">
                <Crown size={14} /> New Collection 2025
              </span>
              
              <h1 className="hero-title">
                Define Your <br />
                <span className="text-gradient-gold">Signature Essence</span>
              </h1>
              
              <p className="hero-description">
                A curated selection of luxury fragrances designed to leave a lasting impression. Experience the art of scent.
              </p>

              <div className="hero-actions">
                <button className="btn btn-primary" onClick={() => setCurrentPage('products')}>
                  Explore Shop
                </button>
                <button className="btn btn-outline" onClick={() => setCurrentPage('products')}>
                  View Collections <ArrowRight size={16} />
                </button>
              </div>

              {/* Stats Row */}
              <div className="hero-stats-row">
                <div>
                  <strong className="stat-value">500+</strong>
                  <div className="stat-label">Scents</div>
                </div>
                <div>
                  <strong className="stat-value">5k+</strong>
                  <div className="stat-label">Clients</div>
                </div>
                <div>
                  <div className="flex-center">
                    {[...Array(5)].map((_, i) => <Star key={i} size={12} fill="#D4AF37" color="#D4AF37" />)}
                  </div>
                  <div className="stat-label">5.0 Rating</div>
                </div>
              </div>
            </div>

            {/* Right Column: Floating Mockup */}
            <div className="floating-card">
              <div className="card mockup-card-bg">
                <div className="card-image-box">
                  <div className="mockup-art-box">
                    <div className="mockup-art-shape">
                      <div className="mockup-art-inner"></div>
                    </div>
                    <div className="mockup-icon-overlay">
                      <Gem size={80} />
                    </div>
                  </div>
                </div>
                <div className="mockup-footer">
                  <div>
                    <h4 className="brand-font">Royal Oud</h4>
                    <span className="stat-label">Parfum Intense</span>
                  </div>
                  <button className="btn-outline btn-circle-arrow">
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* --- FEATURES SECTION --- */}
      <section className="container">
        <div className="section-center">
          <span className="text-gold eyebrow-text">
            Excellence in Every Drop
          </span>
          <h2 className="brand-font section-title-large">Why KL Scents?</h2>
        </div>

        <div className="grid-auto">
          <div className="card feature-card-center">
            <div className="feature-icon-circle">
              <Package size={32} />
            </div>
            <h3 className="brand-font">Secure Packaging</h3>
            <p className="feature-desc">Ensuring your luxury items arrive in pristine condition.</p>
          </div>

          <div className="card feature-card-center">
            <div className="feature-icon-circle">
              <Heart size={32} />
            </div>
            <h3 className="brand-font">Curated Selection</h3>
            <p className="feature-desc">Hand-picked fragrances for every personality.</p>
          </div>

          <div className="card feature-card-center">
            <div className="feature-icon-circle">
              <MessageSquare size={32} />
            </div>
            <h3 className="brand-font">Expert Guidance</h3>
            <p className="feature-desc">Personalized recommendations from our specialists.</p>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="footer-base">
        <div className="container flex-col flex-center footer-content">
          <div className="flex-center footer-brand">
            <Gem size={24} className="text-gold" />
            <span className="brand-font footer-brand-text">KL Scents PH</span>
          </div>
          <div className="flex-center footer-links">
            <a href="#" className="nav-link footer-link-item">Instagram</a>
            <a href="#" className="nav-link footer-link-item">Facebook</a>
            <a href="#" className="nav-link footer-link-item">Twitter</a>
            <a href="#" className="nav-link footer-link-item">Email</a>
          </div>
          <p className="footer-copy">
            © 2024 KL Scents PH. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default WelcomePage;