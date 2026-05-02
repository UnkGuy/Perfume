import React, { useState, useRef } from 'react';
import { Loader2, AlertCircle, ArrowLeft, Mail, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthForm } from '../hooks/useAuthForm'; 
import { useUI } from '../contexts/UIContext';
import HCaptcha from '@hcaptcha/react-hcaptcha';
import { useSettings } from '../contexts/SettingsContext';

const LoginPage = () => {
  const { setCurrentPage } = useUI();
  const navigate = useNavigate(); 
  
  const [view, setView] = useState('login'); 
  const [formData, setFormData] = useState({ email: '', password: '', confirmPassword: '', username: '', consent: false });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [captchaToken, setCaptchaToken] = useState('');
  const captchaRef = useRef(null);
  
  const { submitAuth, handleOAuthSignIn, isLoading, error, setError } = useAuthForm();
  const { settings } = useSettings();
  
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
    if (error) setError(''); 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await submitAuth(view, formData, setView, captchaToken);
    
    if (!success && (view === 'register' || view === 'login') && captchaRef.current) {
        captchaRef.current.resetCaptcha();
        setCaptchaToken('');
    }
  };

  const handleBack = () => {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate('/', { replace: true });
      setCurrentPage('welcome');
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
        
        {view !== 'check-email' && (
          <button onClick={handleBack} className="absolute top-6 left-6 z-20 flex items-center gap-2 text-sm text-gray-400 hover:text-gold-400 transition-colors group">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back
          </button>
        )}

        {view === 'check-email' ? (
          <div className="text-center py-8 animate-fade-in">
            <div className="w-20 h-20 bg-gold-400/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-gold-400/20">
              <Mail size={32} className="text-gold-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Check Your Email</h2>
            <p className="text-gray-400 mb-8 leading-relaxed">
              If an account exists for <strong className="text-white">{formData.email}</strong>, we've sent a secure link to reset your password.
            </p>
            <p className="text-sm text-gray-500 mb-8">
              (You can close this tab now. If you don't see the email, check your spam folder.)
            </p>
            <button onClick={() => { setView('login'); setError(''); setFormData({ ...formData, password: '' }); }} className="w-full py-3 bg-white/5 hover:bg-white/10 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2">
              <ArrowLeft size={16} /> Return to Login
            </button>
          </div>
        ) : (
          <>
            <div className="text-center mb-8 mt-4">
              <img src="https://zmewzupojoufgryrskrs.supabase.co/storage/v1/object/public/assets-images/kl%20scents%20logo.jpg" alt="KL Scents" className="w-16 h-16 rounded-full object-cover mx-auto mb-4 border border-white/10 shadow-lg" />
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
                <input required type="email" name="email" placeholder="your@email.com" value={formData.email} onChange={handleInputChange} className={`w-full bg-black/40 border rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-gold-400 transition-colors ${error ? 'border-red-500/50' : 'border-white/10'}`} />
              </div>

              {view !== 'forgot' && (
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">Password</label>
                  <div className="relative">
                    <input required type={showPassword ? "text" : "password"} name="password" placeholder="••••••••" value={formData.password} onChange={handleInputChange} className={`w-full bg-black/40 border rounded-lg px-4 py-3 pr-10 text-white placeholder-gray-600 focus:outline-none focus:border-gold-400 transition-colors ${error ? 'border-red-500/50' : 'border-white/10'}`} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gold-400 transition-colors">
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              )}

              {view === 'register' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1.5">Confirm Password</label>
                    <div className="relative">
                      <input required type={showConfirmPassword ? "text" : "password"} name="confirmPassword" placeholder="••••••••" value={formData.confirmPassword} onChange={handleInputChange} className={`w-full bg-black/40 border rounded-lg px-4 py-3 pr-10 text-white placeholder-gray-600 focus:outline-none focus:border-gold-400 transition-colors ${error ? 'border-red-500/50' : 'border-white/10'}`} />
                      <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gold-400 transition-colors">
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1.5">Username</label>
                    <input required type="text" name="username" placeholder="e.g. PerfumeLover99" value={formData.username} onChange={handleInputChange} className={`w-full bg-black/40 border rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-gold-400 transition-colors ${error ? 'border-red-500/50' : 'border-white/10'}`} />
                  </div>
                  
                  {/* ✨ Safe Optional Chaining applied here */}
                  {settings?.legal?.showLegalPages && (
                    <div className="flex items-start gap-3 mt-4 animate-fade-in">
                      <input 
                        required 
                        type="checkbox" 
                        id="consent" 
                        name="consent" 
                        checked={formData.consent} 
                        onChange={handleInputChange} 
                        className="mt-1 w-4 h-4 accent-gold-400 bg-black/40 border-gray-600 rounded cursor-pointer flex-shrink-0" 
                      />
                      <label htmlFor="consent" className="text-xs text-gray-400 leading-relaxed select-none">
                        I consent to the collection and processing of my personal data and agree to the{' '}
                        <button type="button" onClick={() => navigate('/terms-and-conditions')} className="text-gold-400 hover:underline">Terms & Conditions</button> and{' '}
                        <button type="button" onClick={() => navigate('/privacy-policy')} className="text-gold-400 hover:underline">Privacy Policy</button>.
                      </label>
                    </div>
                  )}
                </>
              )}

              {view === 'login' && (
                <div className="flex justify-end text-sm mt-1">
                  <button type="button" onClick={() => { setView('forgot'); setError(''); }} className="text-gold-400 hover:text-gold-300 transition-colors">Forgot password?</button>
                </div>
              )}

              {(view === 'login' || view === 'register') && (
                <div className="flex justify-center mt-4">
                  <HCaptcha
                    ref={captchaRef}
                    sitekey={import.meta.env.VITE_HCAPTCHA_SITE_KEY}
                    onVerify={(token) => setCaptchaToken(token)}
                    theme="dark"
                  />
                </div>
              )}

              <button type="submit" disabled={isLoading} className="w-full py-3 mt-4 bg-gold-400 hover:bg-gold-300 text-rich-black font-bold rounded-lg transition-all shadow-lg disabled:opacity-70 flex justify-center items-center gap-2">
                {isLoading ? <><Loader2 className="animate-spin" size={18} /> Processing...</> : view === 'login' ? 'Sign In' : view === 'register' ? 'Create Account' : 'Send Reset Link'}
              </button>
            </form>

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
                  <button onClick={() => handleOAuthSignIn('google')} disabled={isLoading} className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-3 disabled:opacity-50">
                    <svg className="w-5 h-5" viewBox="0 0 48 48">
                      <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"></path>
                      <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z"></path>
                      <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19 5.238C29.211 35.091 26.715 36 24 36c-5.222 0-9.618-3.229-11.303-7.518l-6.571 4.819C9.656 39.663 16.318 44 24 44z"></path>
                      <path fill="#1976D2" d="M43.611 20.083H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C43.021 36.251 46 30.693 46 24c0-1.341-.138-2.65-.389-3.917z"></path>
                    </svg>
                    Sign in with Google
                  </button>

                  <div className="text-center text-sm text-gray-400 pt-4 mt-2 border-t border-white/10">
                    {view === 'login' ? "Don't have an account? " : "Already have an account? "}
                    <button onClick={() => { 
                        setView(view === 'login' ? 'register' : 'login'); 
                        setError(''); 
                        setCaptchaToken(''); 
                        if (captchaRef.current) captchaRef.current.resetCaptcha();
                        setShowPassword(false);
                        setShowConfirmPassword(false);
                    }} className="text-gold-400 hover:text-gold-300 font-bold">
                      {view === 'login' ? 'Sign up free' : 'Sign in'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LoginPage;