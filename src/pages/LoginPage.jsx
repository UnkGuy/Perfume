import React, { useState } from 'react';
import { Gem, Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';

const LoginPage = ({ setCurrentPage, showToast }) => {
  // 1. State Management
  const [view, setView] = useState('login'); // 'login' | 'register' | 'forgot'
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // 2. Input Handlers
  const handleInputChange = (e) => {
    setFormData({ 
      ...formData, 
      [e.target.name]: e.target.value 
    });
    if (error) setError(''); // Clear error when user starts typing
  };

  const handleGuestAccess = () => {
    if (setCurrentPage) setCurrentPage('products');
  };

  // 3. Form Submission Logic
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Basic Validation
    if (!formData.email || (view !== 'forgot' && !formData.password)) {
      setError('Please fill in all required fields.');
      return;
    }

    if (view === 'register' && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);

    try {
      if (view === 'register') {
        const { error: signUpError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
        });
        if (signUpError) throw signUpError;
        
        if (showToast) showToast('Success', 'Account created! You are now logged in.');
        setCurrentPage('products');

      } else if (view === 'login') {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
        if (signInError) throw signInError;

        if (showToast) showToast('Welcome Back', 'Successfully logged in.');
        setCurrentPage('products');

      } else if (view === 'forgot') {
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(formData.email);
        if (resetError) throw resetError;
        
        if (showToast) showToast('Email Sent', 'Check your inbox for the reset link.');
        setView('login');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 4. Dynamic UI Helpers
  const renderHeader = () => {
    switch(view) {
      case 'register': return { title: 'Create Account', subtitle: 'Join the luxury experience' };
      case 'forgot': return { title: 'Reset Password', subtitle: 'Enter your email to recover access' };
      default: return { title: 'Welcome Back', subtitle: 'Sign in to continue your journey' };
    }
  };

  const headerContent = renderHeader();

  return (
    <div className="min-h-screen bg-rich-black flex items-center justify-center p-6 text-gray-300 font-sans selection:bg-gold-400 selection:text-black">
      
      {/* Background aesthetics */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-gold-400/10 rounded-full blur-[120px] pointer-events-none"></div>
      
      <div className="relative w-full max-w-md bg-white/5 border border-white/10 p-8 rounded-2xl backdrop-blur-sm shadow-2xl z-10 animate-fade-in">
        
        {/* Back button */}
        <button
          onClick={() => setCurrentPage('welcome')}
          className="absolute top-6 left-6 z-20 flex items-center gap-2 text-sm text-gray-400 hover:text-gold-400 transition-colors group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back
        </button>
        
        {/* Header Section */}
        <div className="text-center mb-8 mt-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gold-400/10 text-gold-400 mb-4 border border-gold-400/20">
            <Gem size={32} />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">{headerContent.title}</h2>
          <p className="text-sm text-gray-400">{headerContent.subtitle}</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="flex items-center gap-2 p-3 mb-6 text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg">
            <AlertCircle size={16} className="flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Input */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">Email Address</label>
            <input 
              type="email" 
              name="email"
              placeholder="your@email.com"
              value={formData.email}
              onChange={handleInputChange}
              className={`w-full bg-black/40 border rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-gold-400 transition-colors ${error ? 'border-red-500/50' : 'border-white/10'}`}
            />
          </div>

          {/* Password Input */}
          {view !== 'forgot' && (
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Password</label>
              <input 
                type="password" 
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleInputChange}
                className={`w-full bg-black/40 border rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-gold-400 transition-colors ${error ? 'border-red-500/50' : 'border-white/10'}`}
              />
            </div>
          )}

          {/* Confirm Password (Register Only) */}
          {view === 'register' && (
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Confirm Password</label>
              <input 
                type="password" 
                name="confirmPassword"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={`w-full bg-black/40 border rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-gold-400 transition-colors ${error && formData.password !== formData.confirmPassword ? 'border-red-500/50' : 'border-white/10'}`}
              />
            </div>
          )}

          {/* Forgot Password Link (Login Only) */}
          {view === 'login' && (
            <div className="flex justify-end text-sm">
              <button type="button" onClick={() => { setView('forgot'); setError(''); }} className="text-gold-400 hover:text-gold-300 transition-colors">
                Forgot password?
              </button>
            </div>
          )}

          {/* Main Action Button */}
          <button 
            type="submit"
            disabled={isLoading}
            className="w-full py-3 mt-4 bg-gold-400 hover:bg-gold-300 text-rich-black font-bold rounded-lg transition-all shadow-lg disabled:opacity-70 flex justify-center items-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Processing...
              </>
            ) : (
              view === 'login' ? 'Sign In' : view === 'register' ? 'Create Account' : 'Send Reset Link'
            )}
          </button>
        </form>

        {/* Footer Actions */}
        <div className="mt-6 space-y-4">
          {view === 'forgot' ? (
            <button 
              onClick={() => { setView('login'); setError(''); }}
              className="w-full py-3 bg-white/5 hover:bg-white/10 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <ArrowLeft size={16} /> Back to Login
            </button>
          ) : (
            <>
              <button 
                onClick={handleGuestAccess}
                className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/5 text-white font-medium rounded-lg transition-colors"
              >
                Continue as Guest
              </button>

              <div className="text-center text-sm text-gray-400 pt-6 mt-4 border-t border-white/10">
                {view === 'login' ? "Don't have an account? " : "Already have an account? "}
                <button 
                  onClick={() => { setView(view === 'login' ? 'register' : 'login'); setError(''); }}
                  className="text-gold-400 hover:text-gold-300 font-bold"
                >
                  {view === 'login' ? 'Sign up free' : 'Sign in'}
                </button>
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
};

export default LoginPage;