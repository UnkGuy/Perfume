import React, { useState } from 'react';
import { Search, X } from 'lucide-react';

const PredictiveSearch = ({ 
  products, 
  searchQuery, 
  setSearchQuery, 
  onSelectProduct 
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);

  const searchSuggestions = products
    .filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.brand.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .slice(0, 5);

  return (
    <div className="relative max-w-2xl mx-auto mb-12 group animate-fade-in z-[100]">
      <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gold-400 transition-colors group-hover:text-gold-300" size={20} />
      
      {searchQuery && (
         <button 
           onClick={() => { setSearchQuery(''); setShowSuggestions(false); }}
           className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
         >
           <X size={16} />
         </button>
      )}

      <input 
        type="text" 
        value={searchQuery}
        onChange={(e) => {
          setSearchQuery(e.target.value);
          setShowSuggestions(true);
        }}
        onFocus={() => setShowSuggestions(true)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        placeholder="Search for your perfect scent..."
        className="w-full bg-white/5 border border-white/10 rounded-full py-4 pl-14 pr-12 text-white placeholder-gray-500 focus:outline-none focus:border-gold-400/50 focus:ring-1 focus:ring-gold-400/50 transition-all shadow-lg"
      />

      {showSuggestions && searchQuery && searchSuggestions.length > 0 && (
        <div className="absolute top-full left-0 w-full mt-2 bg-rich-black border border-gold-400/30 rounded-xl shadow-2xl overflow-hidden animate-slide-in">
          {searchSuggestions.map(suggestion => (
            <div 
              key={suggestion.id}
              onClick={() => onSelectProduct(suggestion)}
              className={`px-6 py-4 hover:bg-white/5 cursor-pointer flex justify-between items-center border-b border-white/5 last:border-0 transition-colors ${!suggestion.available ? 'opacity-70' : ''}`}
            >
              <div>
                <span className="font-bold text-white block">{suggestion.name}</span>
                <span className="text-xs text-gray-400">{suggestion.brand}</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-gold-400 font-medium">₱{suggestion.price}</span>
                {!suggestion.available && <span className="text-[10px] text-red-400 font-bold tracking-widest mt-1">OUT OF STOCK</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PredictiveSearch;