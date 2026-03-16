import React, { useState } from 'react';
import { Gem, Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import { supabase } from '../services/supabase'; // Import the database client!

const LoginPage = ({ setCurrentPage, showToast }) => {
  const [view, setView] = useState('login'); // 'login' | 'register' | 'forgot'
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleGuestAccess = () => {
    setCurrentPage('products');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

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
        // --- SUPABASE SIGN UP ---
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
        });
        
        if (error) throw error;
        
        if (showToast) showToast('Success', 'Account created! You are now logged in.');
        setCurrentPage('products');

      } else if (view === 'login') {
        // --- SUPABASE SIGN IN ---
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (error) throw error;
        
        if (showToast) showToast('Welcome Back', 'Successfully logged in.');
        setCurrentPage('products');

      } else if (view === 'forgot') {
        // --- SUPABASE RESET PASSWORD ---
        const { error } = await supabase.auth.resetPasswordForEmail(formData.email);
        
        if (error) throw error;
        
        if (showToast) showToast('Email Sent', 'Check your inbox for the reset link.');
        setView('login');
      }
    } catch (err) {
      // Supabase returns nice, human-readable error messages
      setError(err.message); 
    } finally {
      setIsLoading(false);
    }
  };

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
      
      <div className="w-full max-w-md bg-white/5 border border-white/10 p-8 rounded-2xl backdrop-blur-sm shadow-2xl z-10 animate-fade-in">
        
        {/* Header */}ava
        <div className="text-center mb-8">
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
          {/* Email */}
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

          {/* Password */}
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

          {/* Confirm Password */}
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

          {/* Options Row */}
          {view === 'login' && (
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="accent-gold-400 w-4 h-4 bg-transparent border-gray-600 rounded" />
                <span className="text-gray-400">Remember me</span>
              </label>
              <button type="button" onClick={() => { setView('forgot'); setError(''); }} className="text-gold-400 hover:text-gold-300 transition-colors">
                Forgot password?
              </button>
            </div>
          )}

          {/* Submit Button */}
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

        {/* Alternate Actions */}
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

              <div className="text-center text-sm text-gray-400 pt-2 border-t border-white/10">
                {view === 'login' ? "Don't have an account? " : "Already have an account? "}
                <button 
                  onClick={() => { setView(view === 'login' ? 'register' : 'login'); setError(''); }}
                  className="text-gold-400 hover:text-gold-300 font-medium"
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