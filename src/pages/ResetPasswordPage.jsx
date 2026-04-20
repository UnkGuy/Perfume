import React, { useState } from 'react';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useResetPassword } from '../hooks/useResetPassword'; 

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ password: '', confirmPassword: '' });
  
  const { submitNewPassword, isLoading, error, setError, success, isAuthorized, verifyingSession } = useResetPassword();

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await submitNewPassword(formData);
  };

  if (verifyingSession) {
    return (
      <div className="min-h-screen bg-rich-black flex items-center justify-center p-6">
        <Loader2 className="animate-spin text-gold-400" size={48} />
      </div>
    );
  }

  if (!isAuthorized) return null;

  return (
    <div className="min-h-screen bg-rich-black flex items-center justify-center p-6 text-gray-300 font-sans selection:bg-gold-400 selection:text-black">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-gold-400/10 rounded-full blur-[120px] pointer-events-none"></div>
      
      <div className="relative w-full max-w-md bg-white/5 border border-white/10 p-8 rounded-2xl backdrop-blur-sm shadow-2xl z-10 animate-fade-in">
        
        <div className="text-center mb-8">
          <img src="https://zmewzupojoufgryrskrs.supabase.co/storage/v1/object/public/assets-images/kl%20scents%20logo.jpg" alt="KL Scents" className="w-16 h-16 rounded-full object-cover mx-auto mb-4 border border-white/10 shadow-lg" />
          <h2 className="text-2xl font-bold text-white mb-2">Set New Password</h2>
          <p className="text-sm text-gray-400">Enter your new secure password below.</p>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 mb-6 text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg">
            <AlertCircle size={16} className="flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="flex flex-col items-center gap-4 p-4 text-center">
            <CheckCircle size={48} className="text-green-400" />
            <p className="text-lg font-semibold text-white">Password Updated!</p>
            <button onClick={() => navigate('/login', { replace: true })} className="w-full py-3 mt-4 bg-gold-400 hover:bg-gold-300 text-rich-black font-bold rounded-lg transition-all">
              Proceed to Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">New Password</label>
              <input required type="password" name="password" placeholder="••••••••" value={formData.password} onChange={handleInputChange} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-gold-400 transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Confirm New Password</label>
              <input required type="password" name="confirmPassword" placeholder="••••••••" value={formData.confirmPassword} onChange={handleInputChange} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-gold-400 transition-colors" />
            </div>
            <button type="submit" disabled={isLoading} className="w-full py-3 mt-4 bg-gold-400 hover:bg-gold-300 text-rich-black font-bold rounded-lg transition-all shadow-lg disabled:opacity-70 flex justify-center items-center gap-2">
              {isLoading ? <><Loader2 className="animate-spin" size={18} /> Updating...</> : 'Update Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordPage;