import React from 'react';
import { Filter, Star, Droplets, Ruler, User, PackageX } from 'lucide-react'; 
// ✨ DELETED the static imports from '../../data/products' ✨

const ProductFilters = ({ 
  ratingFilter, setRatingFilter, 
  priceRange, setPriceRange, handleInput, handleSliderChange, getPercent,
  selectedGender, setSelectedGender,
  selectedNotes, setSelectedNotes,
  selectedSizes, setSelectedSizes,
  selectedBrands, setSelectedBrands,
  clearAllFilters,
  hasActiveFilters,
  MIN_LIMIT, MAX_LIMIT,
  showOutOfStock,     
  setShowOutOfStock,
  availableBrands = [], // ✨ NEW PROPS ✨
  availableSizes = [],  // ✨ NEW PROPS ✨
  availableNotes = []   // ✨ NEW PROPS ✨
}) => {

  // Genders rarely change, so it's safe to leave these static
  const genders = ['Women', 'Men', 'Unisex'];

  const toggleFilter = (item, state, setState) => {
    if (state.includes(item)) setState(state.filter(i => i !== item));
    else setState([...state, item]);
  };

  return (
    <aside className="w-full lg:w-72 flex-shrink-0 space-y-6 animate-slide-in">
      <div className="bg-white/5 border border-white/5 rounded-2xl p-6 backdrop-blur-sm">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-gold-400">
            <Filter size={20} />
            <h3 className="font-bold tracking-wide">Filters</h3>
          </div>
          {hasActiveFilters && (
            <button onClick={clearAllFilters} className="text-xs text-gold-400 hover:text-white underline transition-colors">
              Clear
            </button>
          )}
        </div>

        {/* Rating Filter */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3 text-white font-medium">
            <Star size={16} className="text-gold-400" />
            <h4>Customer Rating</h4>
          </div>
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map(starCount => (
              <label key={starCount} className="flex items-center gap-3 cursor-pointer group">
                <input type="radio" name="rating" checked={ratingFilter === starCount} onChange={() => setRatingFilter(starCount)} className="accent-gold-400 w-4 h-4 cursor-pointer" />
                <div className="flex">
                   {[...Array(5)].map((_, i) => (
                     <Star key={i} size={14} className={i < starCount ? "fill-gold-400 text-gold-400" : "fill-gray-700 text-gray-700"} />
                   ))}
                </div>
                <span className="text-xs group-hover:text-gold-400 transition-colors">{starCount < 5 && "& Up"}</span>
              </label>
            ))}
            <label className="flex items-center gap-3 cursor-pointer">
                <input type="radio" name="rating" checked={ratingFilter === 0} onChange={() => setRatingFilter(0)} className="accent-gold-400 w-4 h-4" />
                <span className="text-sm">All Ratings</span>
            </label>
          </div>
        </div>

        {/* Price Range Slider */}
        <div className="mb-8">
          <h4 className="font-medium text-white mb-4">Price Range</h4>
          
          <div className="flex items-center gap-2 mb-6">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs">₱</span>
              <input type="number" value={priceRange.min} onChange={(e) => handleInput(e, 'min')} className="w-full bg-black/40 border border-white/10 rounded px-2 py-1 pl-6 text-sm text-white focus:border-gold-400 outline-none" />
            </div>
            <span className="text-gray-500">-</span>
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs">₱</span>
              <input type="number" value={priceRange.max} onChange={(e) => handleInput(e, 'max')} className="w-full bg-black/40 border border-white/10 rounded px-2 py-1 pl-6 text-sm text-white focus:border-gold-400 outline-none" />
            </div>
          </div>
          
          <div className="relative h-1 w-full bg-gray-700 rounded-full mb-4 mt-4">
            <div className="absolute h-full bg-gold-400 rounded-full z-10" style={{ left: `${getPercent(priceRange.min)}%`, width: `${getPercent(priceRange.max) - getPercent(priceRange.min)}%` }}></div>
            <input 
              type="range" min={MIN_LIMIT} max={MAX_LIMIT} value={priceRange.min} onChange={(e) => handleSliderChange(e, 'min')} 
              className="absolute w-full top-1/2 -translate-y-1/2 appearance-none bg-transparent pointer-events-none z-20
                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-gold-400 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer
                [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-gold-400 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:cursor-pointer" 
            />
            <input 
              type="range" min={MIN_LIMIT} max={MAX_LIMIT} value={priceRange.max} onChange={(e) => handleSliderChange(e, 'max')} 
              className="absolute w-full top-1/2 -translate-y-1/2 appearance-none bg-transparent pointer-events-none z-30
                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-gold-400 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer
                [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-gold-400 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:cursor-pointer" 
            />
          </div>
        </div>

        {/* Gender */}
        <div className="mb-6">
           <div className="flex items-center gap-2 mb-3 text-white font-medium">
            <User size={16} className="text-gold-400" />
            <h4>Gender</h4>
          </div>
          <div className="space-y-2">
            {genders.map(gender => (
              <div key={gender} className="flex items-center gap-2">
                <input type="checkbox" id={gender} checked={selectedGender.includes(gender)} onChange={() => toggleFilter(gender, selectedGender, setSelectedGender)} className="accent-gold-400 rounded border-gray-600 bg-transparent w-4 h-4 cursor-pointer" />
                <label htmlFor={gender} className="text-sm cursor-pointer hover:text-gold-400">{gender}</label>
              </div>
            ))}
          </div>
        </div>

        {/* Notes */}
        {availableNotes.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3 text-white font-medium">
              <Droplets size={16} className="text-gold-400" />
              <h4>Fragrance Notes</h4>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {/* ✨ MAP OVER DYNAMIC NOTES ✨ */}
              {availableNotes.map(note => (
                <div key={note} className="flex items-center gap-2">
                  <input type="checkbox" id={note} checked={selectedNotes.includes(note)} onChange={() => toggleFilter(note, selectedNotes, setSelectedNotes)} className="accent-gold-400 rounded border-gray-600 bg-transparent w-4 h-4 cursor-pointer" />
                  <label htmlFor={note} className="text-sm cursor-pointer hover:text-gold-400">{note}</label>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Size */}
        {availableSizes.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3 text-white font-medium">
              <Ruler size={16} className="text-gold-400" />
              <h4>Size</h4>
            </div>
            <div className="space-y-2">
              {/* ✨ MAP OVER DYNAMIC SIZES ✨ */}
              {availableSizes.map(size => (
                <div key={size} className="flex items-center gap-2">
                  <input type="checkbox" id={size} checked={selectedSizes.includes(size)} onChange={() => toggleFilter(size, selectedSizes, setSelectedSizes)} className="accent-gold-400 rounded border-gray-600 bg-transparent w-4 h-4 cursor-pointer" />
                  <label htmlFor={size} className="text-sm cursor-pointer hover:text-gold-400">{size}</label>
                </div>
              ))}
            </div>
          </div>
        )}

         {/* Brand */}
         {availableBrands.length > 0 && (
           <div className="mb-6">
            <div className="flex items-center gap-2 mb-3 text-white font-medium">
              <Star size={16} className="text-gold-400" />
              <h4>Brand</h4>
            </div>
            <div className="space-y-2">
              {/* ✨ MAP OVER DYNAMIC BRANDS ✨ */}
              {availableBrands.map(brand => (
                <div key={brand} className="flex items-center gap-2">
                  <input type="checkbox" id={brand} checked={selectedBrands.includes(brand)} onChange={() => toggleFilter(brand, selectedBrands, setSelectedBrands)} className="accent-gold-400 rounded border-gray-600 bg-transparent w-4 h-4 cursor-pointer" />
                  <label htmlFor={brand} className="text-sm cursor-pointer hover:text-gold-400">{brand}</label>
                </div>
              ))}
            </div>
          </div>
         )}
        
        {/* Availability Toggle */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3 text-white font-medium">
            <PackageX size={16} className="text-gold-400" />
            <h4>Availability</h4>
          </div>
          <div className="flex items-center gap-2">
            <input 
              type="checkbox" 
              id="outOfStock" 
              checked={showOutOfStock} 
              onChange={(e) => setShowOutOfStock(e.target.checked)} 
              className="accent-gold-400 rounded border-gray-600 bg-transparent w-4 h-4 cursor-pointer" 
            />
            <label htmlFor="outOfStock" className="text-sm cursor-pointer hover:text-gold-400">
              Include Out of Stock
            </label>
          </div>
        </div>
        
        <button onClick={clearAllFilters} className="w-full mt-6 py-3 bg-white/5 hover:bg-gold-400/20 text-gold-400 border border-gold-400/30 font-bold rounded transition-colors">
          Reset Filters
        </button>
      </div>
    </aside>
  );
};

export default ProductFilters;