import React, { useState } from 'react';
import { Search, Filter, Star, Droplets, Ruler, X, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

// Import the image we moved earlier
import perfumeImage from '../assets/images/perfume.jpg'; 

const ProductPage = ({ setCurrentPage, cartItems, addToCart }) => {
  // --- Price Range Logic ---
  const MIN_LIMIT = 0;
  const MAX_LIMIT = 1000;
  const GAP = 50;
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });

  // --- UI Logic States ---
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [reviewTarget, setReviewTarget] = useState(null);
  const [activePage, setActivePage] = useState(1);
  const [sortOption, setSortOption] = useState('date');
  const [ratingFilter, setRatingFilter] = useState(0);

  // --- Mock Data ---
  const products = [
    { id: 1, name: "Luxury Parfum 1", brand: "Chanel", price: 99, rating: 4.8, size: "50ml", notes: ["Fresh", "Citrus", "Woody"], available: true },
    { id: 2, name: "Luxury Parfum 2", brand: "Dior", price: 109, rating: 4.5, size: "50ml", notes: ["Floral", "Sweet", "Musk"], available: true },
    { id: 3, name: "Luxury Parfum 3", brand: "Tom Ford", price: 119, rating: 3.9, size: "50ml", notes: ["Oriental", "Spicy", "Amber"], available: false },
    { id: 4, name: "Luxury Parfum 4", brand: "Versace", price: 129, rating: 5.0, size: "50ml", notes: ["Aquatic", "Fresh", "Clean"], available: true },
    { id: 5, name: "Luxury Parfum 5", brand: "Chanel", price: 139, rating: 4.2, size: "50ml", notes: ["Woody", "Leather", "Smoky"], available: true },
    { id: 6, name: "Luxury Parfum 6", brand: "Dior", price: 149, rating: 4.7, size: "50ml", notes: ["Fruity", "Sweet", "Vanilla"], available: true },
    { id: 7, name: "Luxury Parfum 7", brand: "Tom Ford", price: 159, rating: 4.0, size: "50ml", notes: ["Green", "Herbal", "Fresh"], available: true },
    { id: 8, name: "Luxury Parfum 8", brand: "Versace", price: 169, rating: 3.5, size: "50ml", notes: ["Gourmand", "Sweet", "Coffee"], available: false },
    { id: 9, name: "Luxury Parfum 9", brand: "Chanel", price: 179, rating: 4.9, size: "50ml", notes: ["Chypre", "Mossy", "Citrus"], available: true }
  ];

  const scentNotes = ["Citrus", "Woody", "Floral", "Fresh", "Sweet", "Musk", "Oriental", "Spicy", "Aquatic", "Vanilla", "Leather"];
  const bottleSizes = ["30ml", "50ml", "100ml", "Tester"];

  const mockReviews = [
    { id: 1, user: "Maria Santos", rating: 5, date: "Oct 12, 2023", text: "Absolutely in love with this scent! It lasts all day and I get so many compliments." },
    { id: 2, user: "John Cruz", rating: 5, date: "Sep 28, 2023", text: "Very premium quality for the price. Smells exactly like the designer original." },
    { id: 3, user: "Anna Reyes", rating: 4, date: "Sep 15, 2023", text: "Great fragrance, slightly sweeter than I expected but still very elegant." }
  ];

  // --- Handlers ---
  const handleInput = (e, type) => {
    let val = parseInt(e.target.value) || 0;
    if (type === 'min') {
      if (val > priceRange.max - GAP) val = priceRange.max - GAP;
      setPriceRange({ ...priceRange, min: val });
    } else {
      if (val < priceRange.min + GAP) val = priceRange.min + GAP;
      setPriceRange({ ...priceRange, max: val });
    }
  };

  const handleSliderChange = (e, type) => {
    let val = parseInt(e.target.value);
    if (type === 'min') {
      if (val > priceRange.max - GAP) val = priceRange.max - GAP;
      setPriceRange(prev => ({ ...prev, min: val }));
    } else {
      if (val < priceRange.min + GAP) val = priceRange.min + GAP;
      setPriceRange(prev => ({ ...prev, max: val }));
    }
  };

  const getPercent = (value) => Math.round(((value - MIN_LIMIT) / (MAX_LIMIT - MIN_LIMIT)) * 100);

  const handleAddToCart = (e, product) => {
    e.stopPropagation();
    addToCart(product);
  };

  const openReviewModal = (e, product) => {
    e.stopPropagation();
    setReviewTarget(product);
    setIsReviewOpen(true);
  };

  const submitReview = () => {
    alert(`Review submitted for ${reviewTarget.name}!`);
    setIsReviewOpen(false);
    setReviewTarget(null);
  };

  const getProcessedProducts = () => {
    let filtered = products.filter(product => {
      if (product.rating < ratingFilter) return false;
      if (product.price < priceRange.min || product.price > priceRange.max) return false;
      return true;
    });

    return filtered.sort((a, b) => {
      if (sortOption === 'price-asc') return a.price - b.price;
      if (sortOption === 'price-desc') return b.price - a.price;
      if (sortOption === 'rating-desc') return b.rating - a.rating;
      if (sortOption === 'rating-asc') return a.rating - b.rating;
      return 0;
    });
  };

  const processedProducts = getProcessedProducts();

  return (
    <div className="min-h-screen bg-rich-black text-gray-300 font-sans selection:bg-gold-400 selection:text-black">
      {/* Header */}
      <div className="relative z-50">
        <Header setCurrentPage={setCurrentPage} cartItems={cartItems} />
      </div>

      <div className="container mx-auto px-6 py-24 max-w-7xl">
        
        {/* Search Bar */}
        {!selectedProduct && (
          <div className="relative max-w-2xl mx-auto mb-12 group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gold-400 transition-colors group-hover:text-gold-300" size={20} />
            <input 
              type="text" 
              placeholder="Search for your perfect scent..."
              className="w-full bg-white/5 border border-white/10 rounded-full py-4 pl-14 pr-6 text-white placeholder-gray-500 focus:outline-none focus:border-gold-400/50 focus:ring-1 focus:ring-gold-400/50 transition-all shadow-lg"
            />
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* --- SIDEBAR FILTERS --- */}
          {!selectedProduct && (
            <aside className="w-full lg:w-72 flex-shrink-0 space-y-6">
              <div className="bg-white/5 border border-white/5 rounded-2xl p-6 backdrop-blur-sm">
                
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2 text-gold-400">
                    <Filter size={20} />
                    <h3 className="font-bold tracking-wide">Filters</h3>
                  </div>
                  {(ratingFilter > 0 || priceRange.min > 0) && (
                    <button 
                      onClick={() => {setRatingFilter(0); setPriceRange({min:0, max:1000})}}
                      className="text-xs text-gold-400 hover:text-white underline transition-colors"
                    >
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
                        <input 
                          type="radio" 
                          name="rating" 
                          checked={ratingFilter === starCount} 
                          onChange={() => setRatingFilter(starCount)}
                          className="accent-gold-400 w-4 h-4 cursor-pointer"
                        />
                        <div className="flex">
                           {[...Array(5)].map((_, i) => (
                             <Star key={i} size={14} className={i < starCount ? "fill-gold-400 text-gold-400" : "fill-gray-700 text-gray-700"} />
                           ))}
                        </div>
                        <span className="text-xs group-hover:text-gold-400 transition-colors">{starCount < 5 && "& Up"}</span>
                      </label>
                    ))}
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input 
                          type="radio" 
                          name="rating" 
                          checked={ratingFilter === 0} 
                          onChange={() => setRatingFilter(0)}
                          className="accent-gold-400 w-4 h-4"
                        />
                        <span className="text-sm">All Ratings</span>
                    </label>
                  </div>
                </div>

                {/* Price Range Slider */}
                <div className="mb-8">
                  <h4 className="font-medium text-white mb-4">Price Range</h4>
                  
                  {/* Inputs */}
                  <div className="flex items-center gap-2 mb-6">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs">₱</span>
                      <input 
                        type="number" 
                        value={priceRange.min} 
                        onChange={(e) => handleInput(e, 'min')} 
                        className="w-full bg-black/40 border border-white/10 rounded px-2 py-1 pl-6 text-sm text-white focus:border-gold-400 outline-none"
                      />
                    </div>
                    <span className="text-gray-500">-</span>
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs">₱</span>
                      <input 
                        type="number" 
                        value={priceRange.max} 
                        onChange={(e) => handleInput(e, 'max')} 
                        className="w-full bg-black/40 border border-white/10 rounded px-2 py-1 pl-6 text-sm text-white focus:border-gold-400 outline-none"
                      />
                    </div>
                  </div>

                  {/* Dual Slider Visuals */}
                  <div className="relative h-1 w-full bg-gray-700 rounded-full mb-4">
                    <div 
                      className="absolute h-full bg-gold-400 rounded-full z-10" 
                      style={{ left: `${getPercent(priceRange.min)}%`, width: `${getPercent(priceRange.max) - getPercent(priceRange.min)}%` }}
                    ></div>
                    {/* Invisible Range Inputs on top */}
                    <input type="range" min={MIN_LIMIT} max={MAX_LIMIT} value={priceRange.min} onChange={(e) => handleSliderChange(e, 'min')} 
                      className="absolute w-full h-full opacity-0 z-20 cursor-pointer pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4" 
                    />
                    <input type="range" min={MIN_LIMIT} max={MAX_LIMIT} value={priceRange.max} onChange={(e) => handleSliderChange(e, 'max')} 
                      className="absolute w-full h-full opacity-0 z-20 cursor-pointer pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4" 
                    />
                    
                    {/* Visual Thumbs */}
                    <div className="absolute w-3 h-3 bg-white border-2 border-gold-400 rounded-full top-1/2 -translate-y-1/2 -ml-1.5 z-10 pointer-events-none shadow-md" style={{ left: `${getPercent(priceRange.min)}%` }} />
                    <div className="absolute w-3 h-3 bg-white border-2 border-gold-400 rounded-full top-1/2 -translate-y-1/2 -ml-1.5 z-10 pointer-events-none shadow-md" style={{ left: `${getPercent(priceRange.max)}%` }} />
                  </div>
                </div>

                {/* Fragrance Notes */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3 text-white font-medium">
                    <Droplets size={16} className="text-gold-400" />
                    <h4>Notes</h4>
                  </div>
                  <div className="h-32 overflow-y-auto pr-2 custom-scrollbar grid grid-cols-2 gap-2">
                    {scentNotes.map(note => (
                      <div key={note} className="flex items-center gap-2">
                        <input type="checkbox" id={note} className="accent-gold-400 rounded border-gray-600 bg-transparent" />
                        <label htmlFor={note} className="text-sm cursor-pointer hover:text-gold-400">{note}</label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Size */}
                <div>
                  <div className="flex items-center gap-2 mb-3 text-white font-medium">
                    <Ruler size={16} className="text-gold-400" />
                    <h4>Size</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {bottleSizes.map(size => (
                      <div key={size} className="flex items-center gap-2">
                        <input type="checkbox" id={size} className="accent-gold-400 rounded border-gray-600 bg-transparent" />
                        <label htmlFor={size} className="text-sm cursor-pointer hover:text-gold-400">{size}</label>
                      </div>
                    ))}
                  </div>
                </div>

                <button className="w-full mt-6 py-3 bg-gold-400 hover:bg-gold-300 text-rich-black font-bold rounded transition-colors shadow-lg shadow-gold-400/20">
                  Apply Filters
                </button>
              </div>
            </aside>
          )}

          {/* --- MAIN GRID AREA --- */}
          <main className={`flex-1 ${selectedProduct ? 'w-full' : ''}`}>
            
            {selectedProduct ? (
              // --- DETAIL VIEW ---
              <div className="animate-fade-in">
                <button 
                  onClick={() => setSelectedProduct(null)}
                  className="flex items-center gap-2 text-gray-400 hover:text-gold-400 mb-8 transition-colors"
                >
                  <ArrowLeft size={20} /> Back to Products
                </button>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
                  {/* Image */}
                  <div className="relative aspect-square bg-white/5 rounded-2xl overflow-hidden border border-white/10 group">
                    <img src={perfumeImage} alt={selectedProduct.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  </div>
                  
                  {/* Info */}
                  <div className="flex flex-col justify-center">
                    <span className="text-gold-400 tracking-widest uppercase text-sm font-bold mb-2">{selectedProduct.brand}</span>
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{selectedProduct.name}</h1>
                    
                    <div className="flex items-center gap-4 mb-6">
                        <div className="flex items-center gap-1">
                           <span className="font-bold text-gold-400 text-xl">{selectedProduct.rating}</span>
                           <div className="flex">
                              {[...Array(5)].map((_, idx) => <Star key={idx} size={18} className={idx < Math.round(selectedProduct.rating) ? "fill-gold-400 text-gold-400" : "text-gray-600"} />)}
                           </div>
                        </div>
                        <span className="text-gray-500 border-l border-gray-700 pl-4">124 Reviews</span>
                    </div>

                    <p className="text-3xl font-light text-white mb-8">₱{selectedProduct.price}</p>
                    
                    <p className="text-gray-400 leading-relaxed mb-8 text-lg">
                      Experience the essence of luxury with {selectedProduct.name}. 
                      Crafted with precision, this fragrance combines the finest <span className="text-gold-200">{selectedProduct.notes[0]}</span> 
                      notes with subtle hints of <span className="text-gold-200">{selectedProduct.notes[1]}</span>. 
                      A scent that defines elegance.
                    </p>

                    <div className="mb-8">
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">Fragrance Notes</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedProduct.notes.map(note => (
                          <span key={note} className="px-3 py-1 bg-white/10 border border-white/10 rounded-full text-sm text-gray-300">
                            {note}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-4">
                        <button 
                          disabled={!selectedProduct.available}
                          onClick={(e) => selectedProduct.available && handleAddToCart(e, selectedProduct)}
                          className={`flex-2 px-8 py-4 font-bold rounded transition-all w-full
                            ${selectedProduct.available 
                              ? 'bg-gold-400 hover:bg-gold-300 text-rich-black shadow-[0_0_20px_rgba(212,175,55,0.2)]' 
                              : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`}
                        >
                          {selectedProduct.available ? 'Add to Cart' : 'Out of Stock'}
                        </button>
                        <button 
                          onClick={(e) => openReviewModal(e, selectedProduct)}
                          className="flex-1 px-6 py-4 border border-gold-400/50 text-gold-400 hover:bg-gold-400/10 font-bold rounded transition-all flex items-center justify-center gap-2"
                        >
                          <Star size={18} /> Write Review
                        </button>
                    </div>
                  </div>
                </div>

                {/* Reviews */}
                <div className="border-t border-white/10 pt-12">
                  <h3 className="text-2xl font-bold text-white mb-8">Customer Reviews</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {mockReviews.map((review) => (
                      <div key={review.id} className="bg-white/5 border border-white/5 p-6 rounded-xl">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gold-400/20 text-gold-400 flex items-center justify-center font-bold">
                              {review.user.charAt(0)}
                            </div>
                            <div>
                              <p className="text-white font-bold text-sm">{review.user}</p>
                              <span className="text-xs text-green-400 flex items-center gap-1">Verified Buyer</span>
                            </div>
                          </div>
                          <div className="flex">
                             {[...Array(5)].map((_, i) => (
                               <Star key={i} size={12} className={i < review.rating ? "fill-gold-400 text-gold-400" : "text-gray-700"} />
                             ))}
                          </div>
                        </div>
                        <p className="text-gray-400 text-sm leading-relaxed">"{review.text}"</p>
                        <p className="text-xs text-gray-600 mt-4">{review.date}</p>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            ) : (
              // --- GRID VIEW ---
              <>
                <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-8 gap-4">
                  <div>
                    <h2 className="text-3xl font-bold text-white mb-1">All Perfumes</h2>
                    <p className="text-gray-500 text-sm">Showing {processedProducts.length} luxury scents</p>
                  </div>
                  
                  <select 
                    value={sortOption} 
                    onChange={(e) => setSortOption(e.target.value)}
                    className="bg-black/40 border border-gold-400/30 text-gold-400 text-sm rounded px-4 py-2 outline-none focus:border-gold-400"
                  >
                    <option value="date">Date: Newest</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="rating-desc">Rating: High to Low</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {processedProducts.length > 0 ? (
                    processedProducts.map(product => (
                      <div 
                        key={product.id} 
                        onClick={() => setSelectedProduct(product)}
                        className={`group bg-rich-black border border-white/10 rounded-xl overflow-hidden hover:border-gold-400/50 transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col ${!product.available ? 'opacity-70' : ''}`}
                      >
                        {/* Card Image */}
                        <div className="relative aspect-[4/5] overflow-hidden bg-white/5">
                           <img src={perfumeImage} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100" />
                           
                           {/* Badges */}
                           {product.available && <span className="absolute top-3 left-3 bg-gold-400 text-black text-[10px] font-bold px-2 py-1 rounded-sm uppercase tracking-wider">New</span>}
                           {!product.available && <span className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm text-white font-bold tracking-widest border-2 border-white/20 m-4">OUT OF STOCK</span>}
                        </div>

                        {/* Card Info */}
                        <div className="p-5 flex-1 flex flex-col">
                          <div className="flex justify-between items-start mb-2">
                             <h3 className="text-lg font-bold text-white group-hover:text-gold-400 transition-colors">{product.name}</h3>
                             <div className="flex items-center gap-1">
                                <Star size={12} className="fill-gold-400 text-gold-400" />
                                <span className="text-xs text-gray-400">{product.rating}</span>
                             </div>
                          </div>
                          
                          <p className="text-xs text-gray-500 mb-3 uppercase tracking-wide">{product.brand} • {product.size}</p>
                          <div className="text-xs text-gray-400 mb-4 line-clamp-1">{product.notes.join(" • ")}</div>

                          <div className="mt-auto flex items-center justify-between pt-4 border-t border-white/10">
                            <span className="text-xl font-medium text-white">₱{product.price}</span>
                            <div className="flex gap-2">
                              <button 
                                disabled={!product.available}
                                onClick={(e) => product.available && handleAddToCart(e, product)}
                                className={`p-2 rounded-full transition-colors ${product.available ? 'bg-gold-400 text-black hover:bg-gold-300' : 'bg-gray-800 text-gray-600'}`}
                              >
                                <span className="sr-only">Add</span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full py-24 text-center">
                      <p className="text-gray-500 text-lg">No perfumes found matching your criteria.</p>
                      <button onClick={() => {setRatingFilter(0); setPriceRange({min:0, max:1000})}} className="text-gold-400 mt-2 hover:underline">Clear Filters</button>
                    </div>
                  )}
                </div>

                {/* Pagination */}
                <div className="flex justify-center items-center gap-2 mt-16">
                  <button disabled={activePage === 1} onClick={() => setActivePage(p => p - 1)} className="p-2 border border-white/10 rounded hover:border-gold-400 text-gray-400 hover:text-gold-400 disabled:opacity-30 disabled:hover:border-white/10 disabled:hover:text-gray-400">
                    <ChevronLeft size={20} />
                  </button>
                  {[1, 2, 3].map(num => (
                    <button 
                      key={num} 
                      onClick={() => setActivePage(num)}
                      className={`w-10 h-10 rounded font-bold transition-all ${activePage === num ? 'bg-gold-400 text-black shadow-lg shadow-gold-400/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                    >
                      {num}
                    </button>
                  ))}
                  <button onClick={() => setActivePage(p => p + 1)} className="p-2 border border-white/10 rounded hover:border-gold-400 text-gray-400 hover:text-gold-400">
                    <ChevronRight size={20} />
                  </button>
                </div>
              </>
            )}
          </main>
        </div>
      </div>

      {/* --- Review Modal Popup --- */}
      {isReviewOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in" onClick={() => setIsReviewOpen(false)}>
          <div className="bg-rich-black border border-gold-400/30 p-8 rounded-2xl max-w-lg w-full relative shadow-2xl" onClick={e => e.stopPropagation()}>
            <button className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors" onClick={() => setIsReviewOpen(false)}>
              <X size={24} />
            </button>
            
            <h2 className="text-2xl font-bold text-white mb-2 text-center">Write a Review</h2>
            <p className="text-center text-gold-400 mb-8 font-medium">{reviewTarget?.name}</p>
            
            <div className="flex justify-center gap-2 mb-8">
              {[...Array(5)].map((_, i) => <Star key={i} size={32} className="fill-gold-400 text-gold-400 cursor-pointer hover:scale-110 transition-transform" />)}
            </div>
            
            <textarea 
              className="w-full bg-black/40 border border-white/10 rounded-lg p-4 text-white placeholder-gray-600 focus:border-gold-400 outline-none resize-none h-32 mb-6" 
              placeholder="Share your experience with this scent..."
            ></textarea>
            
            <button 
              onClick={submitReview}
              className="w-full py-4 bg-gold-400 hover:bg-gold-300 text-rich-black font-bold rounded transition-colors shadow-lg"
            >
              Submit Review
            </button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default ProductPage;