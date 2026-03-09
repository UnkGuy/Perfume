import React from 'react';
import { Trash2, Check, Plus, Minus, AlertCircle } from 'lucide-react';

const FALLBACK_IMAGE = 'https://zmewzupojoufgryrskrs.supabase.co/storage/v1/object/public/product-images/test.jpg';

const CartItem = ({ item, index, handleQuantity, handleRemove, setCurrentPage }) => {
  const imageSource = item.image_url ? item.image_url : FALLBACK_IMAGE;

  return (
    <div className={`flex flex-col sm:flex-row gap-6 p-6 rounded-xl transition-all duration-500 ease-out group 
      ${item.isRemoving ? 'opacity-0 -translate-x-12' : 'opacity-100 translate-x-0'} 
      ${item.available ? 'bg-white/5 border-white/5 hover:border-gold-400/30' : 'bg-red-500/5 border-red-500/30'}`}
    >
      
      <div onClick={() => setCurrentPage('products')} className="w-full sm:w-24 h-24 bg-white/10 rounded-lg overflow-hidden cursor-pointer flex-shrink-0 relative">
        <img 
          src={imageSource} 
          alt={item.name} 
          loading="lazy"
          className={`w-full h-full object-cover transition-transform duration-500 ${item.available ? 'group-hover:scale-110' : 'grayscale opacity-70'}`} 
        />
      </div>
      
      <div className="flex-1 flex flex-col justify-between">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 onClick={() => setCurrentPage('products')} className={`font-bold text-lg cursor-pointer transition-colors ${item.available ? 'hover:text-gold-400' : 'text-gray-400'}`}>
              {item.name}
            </h3>
            <p className="text-sm text-gray-500">{item.brand} • {item.size}</p>
            
            {item.available ? (
              <div className="flex items-center gap-1 text-green-400 text-xs mt-2 bg-green-400/10 px-2 py-1 rounded w-fit">
                <Check size={12} /> Available
              </div>
            ) : (
              <div className="flex items-center gap-1 text-red-400 text-xs mt-2 bg-red-400/10 px-2 py-1 rounded w-fit font-bold tracking-wider">
                <AlertCircle size={12} /> OUT OF STOCK
              </div>
            )}
          </div>
          
          <button onClick={() => handleRemove(index)} className="text-gray-500 hover:text-red-400 transition-colors p-2 hover:bg-white/5 rounded-full">
            <Trash2 size={20} />
          </button>
        </div>

        <div className="flex justify-between items-end border-t border-white/5 pt-4">
          <div className={`flex items-center gap-3 bg-black/40 rounded-lg p-1 border ${item.available ? 'border-white/10' : 'border-red-500/20'}`}>
            <button onClick={() => handleQuantity(index, -1)} disabled={item.quantity <= 1 || !item.available} className="p-1 hover:text-gold-400 disabled:opacity-30 disabled:hover:text-gray-500 transition-colors">
              <Minus size={14} />
            </button>
            <span className={`text-sm font-mono w-4 text-center ${!item.available ? 'text-gray-500' : ''}`}>{item.quantity}</span>
            <button onClick={() => handleQuantity(index, 1)} disabled={!item.available} className="p-1 hover:text-gold-400 disabled:opacity-30 disabled:hover:text-gray-500 transition-colors">
              <Plus size={14} />
            </button>
          </div>
          <span className={`text-xl font-bold ${item.available ? 'text-gold-400' : 'text-gray-500 line-through'}`}>
            ₱{(item.price * item.quantity).toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CartItem;