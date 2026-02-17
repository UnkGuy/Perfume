import React from 'react';
import { X, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import perfumeImage from '../assets/images/perfume.jpg'; // Make sure this path is correct

const CartDrawer = ({ isOpen, onClose, cartItems, removeFromCart, setCurrentPage }) => {
  // Calculate Total Price
  const total = cartItems.reduce((sum, item) => sum + item.price, 0);

  return (
    <>
      {/* Overlay (Dim Background) */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div 
        className={`fixed inset-y-0 right-0 w-full max-w-md bg-rich-black border-l border-gold-400/30 shadow-2xl z-[70] transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex flex-col h-full">
          
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <ShoppingBag className="text-gold-400" /> 
              Your Cart <span className="text-sm font-normal text-gray-400">({cartItems.length})</span>
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
              <X size={24} />
            </button>
          </div>

          {/* Cart Items (Scrollable) */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {cartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                <ShoppingBag size={48} className="text-gray-700" />
                <p className="text-gray-500">Your cart is empty.</p>
                <button onClick={onClose} className="text-gold-400 hover:underline">Start Shopping</button>
              </div>
            ) : (
              cartItems.map((item, index) => (
                <div key={index} className="flex gap-4 items-start animate-fade-in">
                  <div className="w-20 h-20 bg-white/5 rounded-lg overflow-hidden flex-shrink-0 border border-white/10">
                    <img src={perfumeImage} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-white text-sm">{item.name}</h3>
                    <p className="text-gray-500 text-xs mb-2">{item.brand} • {item.size}</p>
                    <p className="text-gold-400 font-medium">₱{item.price}</p>
                  </div>
                  <button 
                    onClick={() => removeFromCart(index)}
                    className="text-gray-500 hover:text-red-400 transition-colors p-2"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer (Total & Checkout) */}
          {cartItems.length > 0 && (
            <div className="p-6 border-t border-white/10 bg-black/20">
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-400">Subtotal</span>
                <span className="text-2xl font-bold text-white">₱{total}</span>
              </div>
              <p className="text-xs text-gray-500 mb-6 text-center">Shipping and taxes calculated at checkout.</p>
              
              <button 
                onClick={() => {
                  onClose(); // Close drawer
                  setCurrentPage('cart'); // Go to full page
                }}
                className="w-full py-4 bg-gold-400 hover:bg-gold-300 text-rich-black font-bold rounded flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(212,175,55,0.3)] hover:shadow-[0_0_25px_rgba(212,175,55,0.5)]"
              >
                Checkout <ArrowRight size={18} />
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CartDrawer;