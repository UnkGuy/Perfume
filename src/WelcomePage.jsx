import React, { useRef } from 'react';
import { Crown, Star, Sparkles, ShieldCheck, Truck } from 'lucide-react'; 
import Header from './Header';
import Footer from './Footer';

const WelcomePage = ({ setCurrentPage, cartItems }) => {
  // 1. Create a reference for the section we want to scroll to
  const learnMoreRef = useRef(null);

  // 2. Function to handle the smooth scrolling
  const scrollToLearnMore = () => {
    learnMoreRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="gradient-bg">
      <Header setCurrentPage={setCurrentPage} cartItems={cartItems} />

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
              {/* 3. Attach the scroll function to the button */}
              <button className="btn-secondary" onClick={scrollToLearnMore}>
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

      {/* 4. New "Learn More" Content Section linked to the Ref */}
      <div className="features-section" ref={learnMoreRef}>
        <div className="section-header">
          <h2 className="section-title">Why Choose <span className="gradient-text">KL Scents?</span></h2>
          <p className="section-description">
            We believe luxury shouldn't be complicated. We bring the world's finest fragrances directly to your doorstep.
          </p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <ShieldCheck size={24} />
            </div>
            <h3 className="feature-title">100% Authentic</h3>
            <p className="feature-text">
              Every bottle is guaranteed authentic. We source directly from authorized distributors to ensure quality.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <Sparkles size={24} />
            </div>
            <h3 className="feature-title">Long-Lasting Scents</h3>
            <p className="feature-text">
              Our curated selection focuses on perfumes with high oil concentration for a scent that lasts all day.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <Truck size={24} />
            </div>
            <h3 className="feature-title">Fast & Secure Shipping</h3>
            <p className="feature-text">
              Same-day delivery available for Metro Manila. Secure packaging ensures your bottle arrives safely.
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default WelcomePage;