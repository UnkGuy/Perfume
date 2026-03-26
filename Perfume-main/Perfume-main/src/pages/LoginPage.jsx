import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

const LoginPage = ({ showToast }) => {
  const [formData, setFormData] = useState({});
  const [view, setView] = useState('login');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormData({});
    setView('login');

    try {
      if (view === 'register') {
        // --- SUPABASE SIGN UP ---
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
        });
        
        if (signUpError) throw signUpError;
        
        if (showToast) showToast('Success', 'Account created! You are now logged in.');
        setCurrentPage('products');

      } else if (view === 'login') {
        // --- SUPABASE SIGN IN ---
        const { data: signInData, error: signInError } = await supabase.auth.signIn({
          email: formData.email,
          password: formData.password,
        });
        
        if (signInError) throw signInError;

        if (showToast) showToast('Success', 'Logged in!');
        setCurrentPage('products');
      }
    } catch (err) {
      // Supabase returns nice, human-readable error messages
      setError(err.message); 
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div>
      <h2>{view === 'login' ? 'Login' : 'Sign Up'}</h2>
      <form onSubmit={handleSubmit}>
        <input name="email" type="email" placeholder="Email" onChange={handleInputChange} />
        <input name="password" type="password" placeholder="Password" onChange={handleInputChange} />
        <button type="submit">{view === 'login' ? 'Login' : 'Sign Up'}</button>
      </form>
      <button type="button" onClick={() => setView(view === 'login' ? 'register' : 'login')}>
        {view === 'login' ? 'Sign Up' : 'Login'}
      </button>
      {error && <p>{error}</p>}
    </div>
  );
};

export default LoginPage;