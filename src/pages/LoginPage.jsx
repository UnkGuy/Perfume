// src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { Gem, Eye, EyeOff, CheckCircle, XCircle, User, Loader } from 'lucide-react';

const LoginPage = ({ onLoginSuccess, setCurrentPage }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginStatus, setLoginStatus] = useState(null); 
  const [statusMessage, setStatusMessage] = useState('');

  // --- Validation Logic ---
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const getPasswordStrength = (password) => {
    if (password.length === 0) return null;
    if (password.length < 6) return 'Weak';
    if (password.length < 10) return 'Medium';
    return 'Strong';
  };

  const passwordStrength = getPasswordStrength(formData.password);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    if (loginStatus) { setLoginStatus(null); setStatusMessage(''); }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!validateEmail(formData.email)) newErrors.email = 'Valid email required';
    if (!formData.password) newErrors.password = 'Password is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setLoginStatus(null);

    setTimeout(() => {
      const demoEmail = 'demo@klscents.ph';
      const demoPassword = 'demo123';

      if (formData.email === demoEmail && formData.password === demoPassword) {
        setLoginStatus('success');
        setStatusMessage('Access Granted');
        
        if (formData.rememberMe) {
          localStorage.setItem('klscents_user', JSON.stringify({ email: formData.email, rememberMe: true }));
        }

        setTimeout(() => {
          if (onLoginSuccess) onLoginSuccess({ email: formData.email });
          if (setCurrentPage) setCurrentPage('products');
        }, 1500);
      } else {
        setLoginStatus('error');
        setStatusMessage('Invalid credentials');
      }
      setIsLoading(false);
    }, 1500);
  };

  const handleGuestLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      if (onLoginSuccess) onLoginSuccess({ guest: true });
      if (setCurrentPage) setCurrentPage('products');
    }, 800);
  };

  return (
    <section className="login-section">
      
      {/* Replaced 'grid-auto' with 'login-card' to ensure it 
         stays centered and doesn't stretch too wide.
      */}
      <div className="card login-card">
        
        {/* Header Section */}
        <div className="login-header">
          <div className="text-gold">
            <Gem size={48} />
          </div>
          <h2 className="hero-title login-title">
            Welcome Back
          </h2>
          <p className="nav-link">Sign in to your collection</p>
        </div>

        {/* Status & Demo Info */}
        {loginStatus && (
          <div className="status-badge-container">
            <div className="badge">
              {loginStatus === 'success' ? <CheckCircle size={16} /> : <XCircle size={16} />}
              <span className="badge-content">{statusMessage}</span>
            </div>
          </div>
        )}

        {!loginStatus && (
          <div className="status-badge-container">
             <div className="badge flex-between">
                <span>Demo: demo@klscents.ph / demo123</span>
             </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          
          {/* Email Input */}
          <div className="form-group">
            <label className="nav-link form-label">Email Address</label>
            <input
              type="email"
              name="email"
              className="input-field"
              placeholder="client@example.com"
              value={formData.email}
              onChange={handleChange}
              disabled={isLoading}
            />
            {errors.email && (
              <span className="input-error-text">{errors.email}</span>
            )}
          </div>

          {/* Password Input */}
          <div className="form-group">
            <div className="password-header">
              <label className="nav-link form-label">Password</label>
              {passwordStrength && !errors.password && (
                <span className="text-gold input-error-text">
                  Strength: {passwordStrength}
                </span>
              )}
            </div>
            
            <div className="password-input-group">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                className="input-field"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                disabled={isLoading}
              />
              <button
                type="button"
                className="btn-outline btn-icon-square"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            
            {errors.password && (
               <span className="input-error-text">{errors.password}</span>
            )}
          </div>

          {/* Remember Me & Forgot */}
          <div className="login-options-row">
            <label className="nav-link checkbox-label">
              <input
                type="checkbox"
                name="rememberMe"
                className="checkbox-gold"
                checked={formData.rememberMe}
                onChange={handleChange}
                disabled={isLoading}
              />
              <span>Remember me</span>
            </label>
            <a href="#" className="forgot-link">Forgot?</a>
          </div>

          {/* Actions */}
          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%' }} // You might want a .w-full utility class, but keeping strictly minimal edits
            disabled={isLoading}
          >
            {isLoading ? <Loader className="animate-spin" size={20} /> : 'Sign In'}
          </button>

          <div className="spacer-sm"></div>

          <button
            type="button"
            className="btn btn-outline"
            style={{ width: '100%' }}
            onClick={handleGuestLogin}
            disabled={isLoading}
          >
            <User size={18} />
            Continue as Guest
          </button>
        </form>

        <div className="divider-box">
          <span className="nav-link">Or connect with</span>
        </div>

        <div className="social-grid">
           <button className="btn btn-outline">Google</button>
           <button className="btn btn-outline">Facebook</button>
        </div>
        
        <div className="login-footer">
          <p className="nav-link">
            No account? <a href="#" className="text-gold">Join the club</a>
          </p>
        </div>

      </div>
    </section>
  );
};

export default LoginPage;