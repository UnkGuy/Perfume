import React from 'react';
import { Search, Home, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import { useUI } from '../contexts/UIContext';

const NotFoundPage = () => {
  const navigate = useNavigate();
  const { setCurrentPage } = useUI();

  return (
    <div className="min-h-screen bg-rich-black text-white font-sans flex flex-col selection:bg-gold-400 selection:text-black">
      <div className="relative z-50">
        <Header />
      </div>

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-32 text-center animate-fade-in relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gold-400/5 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="relative z-10">
          <h1 className="text-[120px] md:text-[180px] font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-800 leading-none tracking-tighter mb-4 opacity-20">
            404
          </h1>
          
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Page Not Found
          </h2>
          
          <p className="text-gray-400 text-lg max-w-md mx-auto mb-10">
            We couldn't find the perfume or page you were looking for. It might have been moved or doesn't exist.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={() => {
                setCurrentPage('welcome');
                navigate('/');
              }}
              className="w-full sm:w-auto px-8 py-4 bg-gold-400 hover:bg-gold-300 text-rich-black font-bold uppercase tracking-widest rounded transition-all shadow-lg flex items-center justify-center gap-2"
            >
              <Home size={18} /> Go Home
            </button>
            
            <button 
              onClick={() => {
                navigate('/products', { state: { reset: true } });
              }}
              className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 text-white border border-white/10 font-bold uppercase tracking-widest rounded transition-all flex items-center justify-center gap-2"
            >
              <Search size={18} /> View Collection
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default NotFoundPage;