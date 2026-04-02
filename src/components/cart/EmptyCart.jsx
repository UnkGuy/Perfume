import React from 'react';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import Header from '../common/Header';
import Footer from '../common/Footer';
import { useUI } from '../../contexts/UIContext'; // <-- NEW IMPORT

// ✨ NO PROPS ✨
const EmptyCart = () => {
  const { setCurrentPage } = useUI();

  return (
    <div className="min-h-screen bg-rich-black text-white font-sans selection:bg-gold-400 selection:text-black flex flex-col">
      <Header />
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center text-gray-600 mb-6 border border-white/10">
          <ShoppingBag size={40} />
        </div>
        <h2 className="text-3xl font-bold mb-3">Your Cart is Empty</h2>
        <p className="text-gray-400 mb-8 max-w-md">Looks like you haven't found your signature scent yet.</p>
        <button onClick={() => setCurrentPage('products')} className="px-8 py-4 bg-gold-400 hover:bg-gold-300 text-rich-black font-bold rounded flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(212,175,55,0.3)]">
          Start Shopping <ArrowRight size={18} />
        </button>
      </div>
      <Footer />
    </div>
  );
};

export default EmptyCart;