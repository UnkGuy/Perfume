import React from 'react';
import { Trash2, Check, Plus, Minus, AlertCircle } from 'lucide-react';
import perfumeImage from '../../assets/images/perfume.jpg';

const CartItem = ({ item, index, handleQuantity, handleRemove, setCurrentPage }) => {
  return (
    <div className={`flex flex-col sm:flex-row gap-6 p-6 bg-white/5 border border-white/5 rounded-xl transition-all duration-500 ease-out ${item.isRemoving ? 'opacity-0 -translate-x-12' : 'opacity-100 translate-x-0'} hover:border-gold-400/30 group`}>
      
      {/* Image */}
      <div onClick={() => setCurrentPage('products')} className="w-full sm:w-24 h-24 bg-white/10 rounded-lg overflow-hidden cursor-pointer flex-shrink-0">
        <img src={perfumeImage} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
      </div>
      
      {/* Content */}
      <div className="flex-1 flex flex-col justify-between">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 onClick={() => setCurrentPage('products')} className="font-bold text-lg cursor-pointer hover:text-gold-400 transition-colors">{item.name}</h3>
            <p className="text-sm text-gray-500">{item.brand} • {item.size}</p>
            
            {item.available ? (
              <div className="flex items-center gap-1 text-green-400 text-xs mt-2 bg-green-400/10 px-2 py-1 rounded w-fit">
                <Check size={12} /> Available
              </div>
            ) : (
              <div className="flex items-center gap-1 text-red-400 text-xs mt-2 bg-red-400/10 px-2 py-1 rounded w-fit">
                <AlertCircle size={12} /> Out of Stock
              </div>
            )}
          </div>
          
          <button onClick={() => handleRemove(index)} className="text-gray-500 hover:text-red-400 transition-colors p-2 hover:bg-white/5 rounded-full">
            <Trash2 size={20} />
          </button>
        </div>

        {/* Quantity and Price */}
        <div className="flex justify-between items-end border-t border-white/5 pt-4">
          <div className="flex items-center gap-3 bg-black/40 rounded-lg p-1 border border-white/10">
            <button onClick={() => handleQuantity(index, -1)} disabled={item.quantity <= 1} className="p-1 hover:text-gold-400 disabled:opacity-30 disabled:hover:text-gray-500 transition-colors">
              <Minus size={14} />
            </button>
            <span className="text-sm font-mono w-4 text-center">{item.quantity}</span>
            <button onClick={() => handleQuantity(index, 1)} className="p-1 hover:text-gold-400 transition-colors">
              <Plus size={14} />
            </button>
          </div>
          <span className="text-xl font-bold text-gold-400">
            ₱{(item.price * item.quantity).toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CartItem;