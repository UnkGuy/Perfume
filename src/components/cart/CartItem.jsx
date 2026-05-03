import React from 'react';
import { Trash2, Check, Plus, Minus, AlertCircle, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom'; 

const FALLBACK_IMAGE = 'https://zmewzupojoufgryrskrs.supabase.co/storage/v1/object/public/product-images/test.jpg';

const CartItem = ({ item, index, handleQuantity, handleRemove }) => {
  const navigate = useNavigate(); 
  const imageSource = item.image_urls && item.image_urls.length > 0 ? item.image_urls[0] : FALLBACK_IMAGE;  

  return (
    <div className={`flex flex-row gap-4 p-4 md:p-6 rounded-xl transition-all duration-500 ease-out group w-full max-w-full overflow-hidden
      ${item.isRemoving ? 'opacity-0 -translate-x-12' : 'opacity-100 translate-x-0'} 
      ${item.available ? 'bg-white/5 border-white/5 hover:border-gold-400/30' : 'bg-red-500/5 border-red-500/30'}`}
    >
      <div onClick={() => navigate(`/products/${item.id}`)} className="w-20 h-20 sm:w-24 sm:h-24 bg-white/10 rounded-lg overflow-hidden cursor-pointer flex-shrink-0 relative">
        <img 
          src={imageSource} 
          alt={item.name} 
          loading="lazy"
          className={`w-full h-full object-cover transition-transform duration-500 ${item.available ? 'group-hover:scale-110' : 'grayscale opacity-70'}`} 
        />
      </div>
      
      <div className="flex-1 flex flex-col justify-between min-w-0 overflow-hidden">
        <div className="flex justify-between items-start mb-2 gap-2 w-full">
          <div className="min-w-0 flex-1">
            <h3 onClick={() => navigate(`/products/${item.id}`)} className={`font-bold text-sm sm:text-lg cursor-pointer transition-colors line-clamp-2 break-words ${item.available ? 'hover:text-gold-400' : 'text-gray-400'}`}>
              {item.name}
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 truncate">{item.brand} • {item.size}</p>
            
            {item.available ? (
              <div className="flex items-center gap-1 text-green-400 text-[10px] sm:text-xs mt-1.5 bg-green-400/10 px-2 py-1 rounded w-fit whitespace-nowrap">
                <Check size={12} /> Available
              </div>
            ) : item.is_deleted ? (
              <div className="flex items-center gap-1 text-red-400 text-[10px] sm:text-xs mt-1.5 bg-red-400/10 px-2 py-1 rounded w-fit font-bold tracking-wider whitespace-nowrap">
                <XCircle size={12} /> ITEM REMOVED
              </div>
            ) : (
              <div className="flex items-center gap-1 text-red-400 text-[10px] sm:text-xs mt-1.5 bg-red-400/10 px-2 py-1 rounded w-fit font-bold tracking-wider whitespace-nowrap">
                <AlertCircle size={12} /> OUT OF STOCK
              </div>
            )}
          </div>
          
          <button onClick={() => handleRemove(index)} className="text-gray-500 hover:text-red-400 transition-colors p-1.5 sm:p-2 hover:bg-white/5 rounded-full flex-shrink-0">
            <Trash2 size={18} />
          </button>
        </div>

        <div className="flex flex-wrap justify-between items-end border-t border-white/5 pt-3 gap-2 w-full">
          <div className={`flex items-center gap-2 sm:gap-3 bg-black/40 rounded-lg p-1 border flex-shrink-0 ${item.available ? 'border-white/10' : 'border-red-500/20'}`}>
            <button onClick={() => handleQuantity(index, -1)} disabled={item.quantity <= 1 || !item.available} className="p-1 hover:text-gold-400 disabled:opacity-30 disabled:hover:text-gray-500 transition-colors">
              <Minus size={14} />
            </button>
            <span className={`text-xs sm:text-sm font-mono w-4 text-center ${!item.available ? 'text-gray-500' : ''}`}>{item.quantity}</span>
            <button onClick={() => handleQuantity(index, 1)} disabled={!item.available} className="p-1 hover:text-gold-400 disabled:opacity-30 disabled:hover:text-gray-500 transition-colors">
              <Plus size={14} />
            </button>
          </div>
          <span className={`text-base sm:text-xl font-bold truncate max-w-[50%] text-right ${item.available ? 'text-gold-400' : 'text-gray-500 line-through'}`}>
            ₱{(item.price * item.quantity).toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CartItem;