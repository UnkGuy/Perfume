import React, { useState } from 'react';
import { Gem, Loader2, AlertCircle, ArrowLeft } from 'lucide-react';

const LoginPage = ({ setCurrentPage }) => {
  // 1. State for View Switching (login | register | forgot)
  const [view, setView] = useState('login');
  
  // 2. State for Form Data
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });

  // 3. State for UI Feedback
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Handle Input Changes
  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error when user starts typing again
    if (error) setError('');
  };

  // Handle "Continue as Guest"
  const handleGuestAccess = () => {
    setCurrentPage('products');
  };

  // Handle Form Submission
  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // --- Validation Logic ---
    
    // Check Empty Fields
    if (!formData.email || (view !== 'forgot' && !formData.password)) {
      setError('Please fill in all required fields.');
      return;
    }

    // Check Password Match (Only for Register view)
    if (view === 'register' && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    // --- MOCK CREDENTIAL CHECK (Added Logic Here) ---
    // If we are on the login view, we check if the inputs match our hardcoded admin user.
    if (view === 'login') {
        const correctEmail = 'admin@example.com';
        const correctPassword = 'password123';

        if (formData.email !== correctEmail || formData.password !== correctPassword) {
            setIsLoading(true);
            // Simulate a network delay before rejecting
            setTimeout(() => {
                setIsLoading(false);
                setError('Invalid email or password.');
            }, 1000);
            return; // Stop here, do not log them in
        }
    }

    // --- Mock API Call (Success path) ---
    setIsLoading(true);

    setTimeout(() => {
      // Mock Success Logic
      if (view === 'forgot') {
        alert(`Password reset link sent to ${formData.email}`);
        setIsLoading(false);
        setView('login');
      } else {
        // For Login (if correct) or Register, we let them in
        setIsLoading(false);
        setCurrentPage('products');
      }
    }, 1500); // 1.5 second delay to show spinner
  };

  // Helper to render the Title based on view
  const renderHeader = () => {
    switch(view) {
      case 'register': return { title: 'Create Account', subtitle: 'Join the luxury experience' };
      case 'forgot': return { title: 'Reset Password', subtitle: 'Enter your email to recover access' };
      default: return { title: 'Welcome Back', subtitle: 'Sign in to continue your journey' };
    }
  };

  const headerContent = renderHeader();

  return (
    <div className="login-container">
      <div className="blob-gold"></div>
      <div className="blob-dark"></div>
      
      <div className="login-card">
        {/* Header Section */}
        <div className="login-header">
          <div className="login-logo">
            <Gem size={32} />
          </div>
          <h2 className="login-title">{headerContent.title}</h2>
          <p className="login-subtitle">{headerContent.subtitle}</p>
        </div>

        {/* Error Message Box */}
        {error && (
          <div className="error-alert">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Email Field (Always visible) */}
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input 
              type="email" 
              name="email"
              className={`form-input ${error ? 'error' : ''}`}
              placeholder="your@email.com"
              value={formData.email}
              onChange={handleInputChange}
            />
          </div>

          {/* Password Fields (Hidden in Forgot Password view) */}
          {view !== 'forgot' && (
            <div className="form-group">
              <label className="form-label">Password</label>
              <input 
                type="password" 
                name="password"
                className={`form-input ${error ? 'error' : ''}`}
                placeholder="••••••••"
                value={formData.password}
                onChange={handleInputChange}
              />
            </div>
          )}

          {/* Confirm Password (Only in Register view) */}
          {view === 'register' && (
            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input 
                type="password" 
                name="confirmPassword"
                className={`form-input ${error && formData.password !== formData.confirmPassword ? 'error' : ''}`}
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleInputChange}
              />
            </div>
          )}

          {/* Options Row (Remember Me / Forgot Password) */}
          {view === 'login' && (
            <div className="form-row">
              <label className="checkbox-label">
                <input type="checkbox" />
                Remember me
              </label>
              <span 
                className="link" 
                onClick={() => { setView('forgot'); setError(''); }}
              >
                Forgot password?
              </span>
            </div>
          )}

          {/* Primary Action Button */}
          <button 
            type="submit"
            className="btn-primary" 
            style={{ width: '100%', marginBottom: '1rem', marginTop: view === 'forgot' ? '1rem' : '0' }}
            disabled={isLoading}
          >
            {isLoading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <Loader2 className="spinner" size={18} />
                Processing...
              </span>
            ) : (
              view === 'login' ? 'Sign In' : view === 'register' ? 'Create Account' : 'Send Reset Link'
            )}
          </button>
        </form>

        {/* Back Button (Only for Forgot Password) */}
        {view === 'forgot' && (
          <button 
            className="btn-guest" 
            style={{ width: '100%', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            onClick={() => { setView('login'); setError(''); }}
          >
            <ArrowLeft size={16} />
            Back to Login
          </button>
        )}

        {/* Guest Button (Hidden in Forgot Password) */}
        {view !== 'forgot' && (
          <button 
            type="button"
            className="btn-guest" 
            style={{ width: '100%', marginBottom: '1rem' }}
            onClick={handleGuestAccess}
          >
            Continue as Guest
          </button>
        )}

        {/* Toggle between Login and Register */}
        {view !== 'forgot' && (
          <div style={{ textAlign: 'center', fontSize: '0.875rem', color: '#9ca3af' }}>
            {view === 'login' ? "Don't have an account? " : "Already have an account? "}
            <span 
              className="link" 
              onClick={() => { 
                setView(view === 'login' ? 'register' : 'login'); 
                setError(''); 
              }}
            >
              {view === 'login' ? 'Sign up free' : 'Sign in'}
            </span>
          </div>
        )}

        {/* Social Buttons (Only in Login/Register) */}
        {view !== 'forgot' && (
          <>
            <div className="divider">
              <div className="divider-container">
                <span className="divider-text">Or continue with</span>
              </div>
            </div>
            <div className="social-buttons">
              <button className="btn-social">🔍 Google</button>
              <button className="btn-social">📘 Facebook</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LoginPage;