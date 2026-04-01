import React, { useState } from 'react';
import { Gem, Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import { useAuthForm } from '../hooks/useAuthForm'; 
import { supabase } from '../services/supabase'; // <-- Need this for Google/FB redirects!

const LoginPage = ({ setCurrentPage, showToast }) => {
  const [view, setView] = useState('login'); 
  const [formData, setFormData] = useState({ email: '', password: '', confirmPassword: '' });
  
  // Pull logic from your custom hook
  const { submitAuth, isLoading, error, setError } = useAuthForm(showToast, setCurrentPage);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError(''); 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await submitAuth(view, formData, setView);
  };

  // --- NEW: OAUTH HANDLERS ---
  const handleOAuthSignIn = async (provider) => {
    setError('');
    try {
      const { error } = await supabase.auth.signInWithOAuth({ provider });
      if (error) throw error;
      // Note: No need to stop loading because the browser instantly redirects to Google/Facebook
    } catch (err) {
      setError(err.message || `Failed to sign in with ${provider}.`);
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
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-gold-400/10 rounded-full blur-[120px] pointer-events-none"></div>
      
      <div className="relative w-full max-w-md bg-white/5 border border-white/10 p-8 rounded-2xl backdrop-blur-sm shadow-2xl z-10 animate-fade-in my-12">
        <button onClick={() => setCurrentPage('welcome')} className="absolute top-6 left-6 z-20 flex items-center gap-2 text-sm text-gray-400 hover:text-gold-400 transition-colors group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back
        </button>
        
        <div className="text-center mb-8 mt-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gold-400/10 text-gold-400 mb-4 border border-gold-400/20">
            <Gem size={32} />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">{headerContent.title}</h2>
          <p className="text-sm text-gray-400">{headerContent.subtitle}</p>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 mb-6 text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg">
            <AlertCircle size={16} className="flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">Email Address</label>
            <input type="email" name="email" placeholder="your@email.com" value={formData.email} onChange={handleInputChange} className={`w-full bg-black/40 border rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-gold-400 transition-colors ${error ? 'border-red-500/50' : 'border-white/10'}`} />
          </div>

          {view !== 'forgot' && (
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Password</label>
              <input type="password" name="password" placeholder="••••••••" value={formData.password} onChange={handleInputChange} className={`w-full bg-black/40 border rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-gold-400 transition-colors ${error ? 'border-red-500/50' : 'border-white/10'}`} />
            </div>
          )}

          {view === 'register' && (
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Confirm Password</label>
              <input type="password" name="confirmPassword" placeholder="••••••••" value={formData.confirmPassword} onChange={handleInputChange} className={`w-full bg-black/40 border rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-gold-400 transition-colors ${error && formData.password !== formData.confirmPassword ? 'border-red-500/50' : 'border-white/10'}`} />
            </div>
          )}

          {view === 'login' && (
            <div className="flex justify-end text-sm">
              <button type="button" onClick={() => { setView('forgot'); setError(''); }} className="text-gold-400 hover:text-gold-300 transition-colors">Forgot password?</button>
            </div>
          )}

          <button type="submit" disabled={isLoading} className="w-full py-3 mt-4 bg-gold-400 hover:bg-gold-300 text-rich-black font-bold rounded-lg transition-all shadow-lg disabled:opacity-70 flex justify-center items-center gap-2">
            {isLoading ? <><Loader2 className="animate-spin" size={18} /> Processing...</> : view === 'login' ? 'Sign In' : view === 'register' ? 'Create Account' : 'Send Reset Link'}
          </button>
        </form>

        {/* --- NEW: OAUTH BUTTONS INTEGRATION --- */}
        {view !== 'forgot' && (
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-rich-black px-2 text-gray-500">OR</span>
            </div>
          </div>
        )}

        <div className="mt-6 space-y-4">
          {view === 'forgot' ? (
            <button onClick={() => { setView('login'); setError(''); }} className="w-full py-3 bg-white/5 hover:bg-white/10 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2">
              <ArrowLeft size={16} /> Back to Login
            </button>
          ) : (
            <>
              {/* Google Sign-In */}
              <button
                onClick={() => handleOAuthSignIn('google')}
                disabled={isLoading}
                className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-3 disabled:opacity-50"
              >
                <svg className="w-5 h-5" viewBox="0 0 48 48">
                  <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"></path>
                  <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z"></path>
                  <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19 5.238C29.211 35.091 26.715 36 24 36c-5.222 0-9.618-3.229-11.303-7.518l-6.571 4.819C9.656 39.663 16.318 44 24 44z"></path>
                  <path fill="#1976D2" d="M43.611 20.083H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C43.021 36.251 46 30.693 46 24c0-1.341-.138-2.65-.389-3.917z"></path>
                </svg>
                Sign in with Google
              </button>

              {/* Facebook Sign-In */}
              <button
                onClick={() => handleOAuthSignIn('facebook')}
                disabled={isLoading}
                className="w-full py-3 bg-[#1877F2] hover:bg-[#166bda] border border-transparent text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-3 disabled:opacity-50"
              >
                <svg className="w-5 h-5" fill="white" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v7.005A9.963 9.963 0 0022 12z" />
                </svg>
                Sign in with Facebook
              </button>

              <button onClick={() => setCurrentPage('products')} className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/5 text-white font-medium rounded-lg transition-colors">
                Continue as Guest
              </button>

              <div className="text-center text-sm text-gray-400 pt-4 mt-2 border-t border-white/10">
                {view === 'login' ? "Don't have an account? " : "Already have an account? "}
                <button onClick={() => { setView(view === 'login' ? 'register' : 'login'); setError(''); }} className="text-gold-400 hover:text-gold-300 font-bold">
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