import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, X, Star, Loader, ChevronDown, SlidersHorizontal, LayoutGrid, List } from 'lucide-react';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';

// Use our new hook!
import { useStoreProducts } from '../hooks/useStoreProducts';

// Components
import ProductCard from '../components/products/ProductCard';
import ProductFilters from '../components/products/ProductFilters';
import ProductDetails from '../components/products/ProductDetails';
import QuickViewModal from '../components/products/QuickViewModal';
import PredictiveSearch from '../components/products/PredictiveSearch';

const ProductPage = ({ 
  setCurrentPage, cartItems, addToCart, toggleWishlist, wishlistItems, showToast,
  searchQuery, setSearchQuery, onCartClick, onWishlistClick, user, userRole, handleLogout 
}) => {
  
  const { products, isLoading } = useStoreProducts(showToast);

  const [activePage, setActivePage] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState(null); 
  const [quickViewProduct, setQuickViewProduct] = useState(null); 
  
  const [priceRange, setPriceRange] = useState({ min: 0, max: 20000 });
  const [sortOption, setSortOption] = useState('date');
  const [ratingFilter, setRatingFilter] = useState(0);
  
  // ✨ NEW: VIEW MODE STATE ✨
  const [viewMode, setViewMode] = useState('large'); // 'large' | 'compact'
  
  const [selectedNotes, setSelectedNotes] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedGender, setSelectedGender] = useState([]);
  const [showOutOfStock, setShowOutOfStock] = useState(false);

  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const sortOptions = [
    { value: 'date', label: 'Date: Newest' },
    { value: 'price-asc', label: 'Price: Low to High' },
    { value: 'price-desc', label: 'Price: High to Low' },
    { value: 'rating-desc', label: 'Rating: High to Low' }
  ];
  const currentSortLabel = sortOptions.find(opt => opt.value === sortOption)?.label;

  const MIN_LIMIT = 0; const MAX_LIMIT = 20000; const GAP = 50;
  const getPercent = (value) => Math.round(((value - MIN_LIMIT) / (MAX_LIMIT - MIN_LIMIT)) * 100);

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

  const clearAllFilters = () => {
    setRatingFilter(0); setPriceRange({min:0, max:20000}); setSearchQuery('');
    setSelectedNotes([]); setSelectedSizes([]); setSelectedBrands([]); setSelectedGender([]);
    setShowOutOfStock(false); // ✨ Reset this too! ✨
  };

  const getProcessedProducts = () => {
  let filtered = products.filter(product => {
      // ✨ NEW: Only hide unavailable products if the toggle is OFF ✨
      if (!showOutOfStock && !product.available) return false; 
      
      if (searchQuery && !product.name.toLowerCase().includes(searchQuery.toLowerCase()) && !product.brand.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (searchQuery && !product.name.toLowerCase().includes(searchQuery.toLowerCase()) && !product.brand.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (product.rating < ratingFilter) return false;
      if (product.price < priceRange.min || product.price > priceRange.max) return false;
      if (selectedNotes.length > 0 && !product.notes.some(note => selectedNotes.includes(note))) return false;
      if (selectedSizes.length > 0 && !selectedSizes.includes(product.size)) return false;
      if (selectedBrands.length > 0 && !selectedBrands.includes(product.brand)) return false;
      if (selectedGender.length > 0 && product.gender && !selectedGender.includes(product.gender)) return false;
      return true;
    });

    return filtered.sort((a, b) => {
      if (sortOption === 'price-asc') return a.price - b.price;
      if (sortOption === 'price-desc') return b.price - a.price;
      if (sortOption === 'rating-desc') return b.rating - a.rating;
      return 0; 
    });
  };

  const processedProducts = getProcessedProducts();
  const hasActiveFilters = ratingFilter > 0 || priceRange.min > 0 || searchQuery || selectedNotes.length > 0 || selectedSizes.length > 0 || selectedBrands.length > 0;

  // ✨ NEW: DYNAMIC GRID CLASSES BASED ON VIEW MODE ✨
  const gridClasses = viewMode === 'compact'
    ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 relative z-0"
    : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 relative z-0";

  return (
    <div className="min-h-screen bg-rich-black text-gray-300 font-sans selection:bg-gold-400 selection:text-black">
      <div className="relative z-50">
        <Header 
          setCurrentPage={setCurrentPage} cartItems={cartItems} wishlistItems={wishlistItems}
          onCartClick={onCartClick} onWishlistClick={onWishlistClick} searchQuery={searchQuery}
          setSearchQuery={setSearchQuery} user={user} userRole={userRole} handleLogout={handleLogout} 
        />
      </div>

      <div className="container mx-auto px-6 py-24 max-w-[1600px]">
        {!selectedProduct && (
          <PredictiveSearch products={products} searchQuery={searchQuery} setSearchQuery={setSearchQuery} onSelectProduct={setSelectedProduct} />
        )}

        <div className="flex flex-col lg:flex-row gap-12">
          {!selectedProduct && (
            <aside className="w-full lg:w-72 flex-shrink-0 relative z-20">
              <button
                onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                className="w-full flex items-center justify-between bg-black/40 border border-gold-400/30 p-4 rounded-xl text-gold-400 font-bold hover:bg-white/5 transition-colors mb-4 shadow-lg"
              >
                <div className="flex items-center gap-3">
                  <SlidersHorizontal size={18} />
                  <span>Filter Collection</span>
                </div>
                <ChevronDown size={18} className={`transition-transform duration-300 ${isFiltersOpen ? 'rotate-180' : ''}`} />
              </button>

              <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isFiltersOpen ? 'max-h-[2000px] opacity-100 mb-8' : 'max-h-0 opacity-0'}`}>
                <ProductFilters 
                  ratingFilter={ratingFilter} setRatingFilter={setRatingFilter}
                  priceRange={priceRange} setPriceRange={setPriceRange}
                  handleInput={handleInput} handleSliderChange={handleSliderChange} getPercent={getPercent}
                  selectedGender={selectedGender} setSelectedGender={setSelectedGender}
                  selectedNotes={selectedNotes} setSelectedNotes={setSelectedNotes}
                  selectedSizes={selectedSizes} setSelectedSizes={setSelectedSizes}
                  selectedBrands={selectedBrands} setSelectedBrands={setSelectedBrands}
                  clearAllFilters={clearAllFilters} hasActiveFilters={hasActiveFilters}
                  MIN_LIMIT={MIN_LIMIT} MAX_LIMIT={MAX_LIMIT}
                  showOutOfStock={showOutOfStock}           // ✨ ADD THIS
                  setShowOutOfStock={setShowOutOfStock}     // ✨ ADD THIS
                />
              </div>
            </aside>
          )}

          <main className={`flex-1 ${selectedProduct ? 'w-full' : ''}`}>
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-96 text-gold-400 animate-fade-in">
                <Loader className="animate-spin mb-4" size={48} />
                <p className="text-gray-400 font-medium tracking-widest uppercase text-sm">Loading Collection...</p>
              </div>
            ) : selectedProduct ? (
              <ProductDetails 
                product={selectedProduct} 
                onBack={() => setSelectedProduct(null)}
                onAddToCart={(product) => {
                  addToCart(product);
                  setSelectedProduct(null);
                }}
                onToggleWishlist={toggleWishlist}
                isInWishlist={wishlistItems.some(item => item.id === selectedProduct.id)}
                showToast={showToast}
                user={user}
                setCurrentPage={setCurrentPage}
                onSelect={setSelectedProduct} 
                wishlistItems={wishlistItems}
              />
            ) : (
              <>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 relative z-10 animate-fade-in">
                  <div>
                    <h2 className="text-3xl font-bold text-white mb-1">All Perfumes</h2>
                    <p className="text-gray-500 text-sm">Showing {processedProducts.length} luxury scents</p>
                  </div>

                  <div className="relative w-full md:w-auto flex flex-wrap items-center justify-start md:justify-end gap-3">
                    
                    {/* ✨ NEW: VIEW MODE TOGGLE ✨ */}
                    <div className="flex items-center bg-black/40 border border-gold-400/30 rounded-lg p-1">
                      <button
                        onClick={() => setViewMode('large')}
                        className={`p-1.5 rounded transition-colors ${viewMode === 'large' ? 'bg-gold-400 text-black' : 'text-gray-500 hover:text-white'}`}
                        title="Large Grid View"
                      >
                        <LayoutGrid size={18} />
                      </button>
                      <button
                        onClick={() => setViewMode('compact')}
                        className={`p-1.5 rounded transition-colors ${viewMode === 'compact' ? 'bg-gold-400 text-black' : 'text-gray-500 hover:text-white'}`}
                        title="Compact View"
                      >
                        <List size={18} />
                      </button>
                    </div>

                    {/* Sort Dropdown */}
                    <div className="relative">
                      <button 
                        onClick={() => setIsSortOpen(!isSortOpen)} onBlur={() => setTimeout(() => setIsSortOpen(false), 200)} 
                        className="bg-black/40 border border-gold-400/30 text-gold-400 text-sm rounded pl-4 pr-3 py-2 outline-none hover:border-gold-400 cursor-pointer flex items-center gap-3 transition-colors"
                      >
                        {currentSortLabel}
                        <ChevronDown size={16} className={`transition-transform duration-200 ${isSortOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {isSortOpen && (
                        <div className="absolute left-0 md:left-auto md:right-0 top-full mt-2 w-48 bg-rich-black border border-gold-400/30 rounded-lg shadow-2xl overflow-hidden animate-fade-in z-50">
                          {sortOptions.map((option) => (
                            <div 
                              key={option.value}
                              onClick={() => { setSortOption(option.value); setIsSortOpen(false); }}
                              className={`px-4 py-3 text-sm cursor-pointer transition-colors ${sortOption === option.value ? 'bg-gold-400/10 text-gold-400 border-l-2 border-gold-400' : 'text-gray-400 hover:bg-white/5 hover:text-gold-300 border-l-2 border-transparent'}`}
                            >
                              {option.label}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* ✨ DYNAMIC GRID ✨ */}
                <div className={gridClasses}>
                  {processedProducts.length > 0 ? (
                    processedProducts.map(product => (
                      <ProductCard 
                        key={product.id} 
                        product={product} 
                        onSelect={setSelectedProduct} 
                        onAddToCart={addToCart}
                        onQuickView={setQuickViewProduct} 
                        onToggleWishlist={toggleWishlist}
                        isInWishlist={wishlistItems?.some(item => item.id === product.id)}
                        user={user} 
                        setCurrentPage={setCurrentPage} 
                        showToast={showToast}
                        isCompact={viewMode === 'compact'} // Pass the state down!
                      />
                    ))
                  ) : (
                    <div className="col-span-full py-24 text-center">
                      <p className="text-gray-500 text-lg">No perfumes found matching your criteria.</p>
                      <button onClick={clearAllFilters} className="text-gold-400 mt-2 hover:underline">Clear Filters</button>
                    </div>
                  )}
                </div>

                <div className="flex justify-center items-center gap-2 mt-16">
                  <button disabled={activePage === 1} onClick={() => setActivePage(p => p - 1)} className="p-2 border border-white/10 rounded hover:border-gold-400 text-gray-400 hover:text-gold-400 disabled:opacity-30">
                    <ChevronLeft size={20} />
                  </button>
                  {[1, 2, 3].map(num => (
                    <button key={num} onClick={() => setActivePage(num)} className={`w-10 h-10 rounded font-bold transition-all ${activePage === num ? 'bg-gold-400 text-black shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>{num}</button>
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

      <QuickViewModal 
        product={quickViewProduct} onClose={() => setQuickViewProduct(null)} onAddToCart={addToCart}
        onToggleWishlist={toggleWishlist} isInWishlist={wishlistItems?.some(item => item.id === quickViewProduct?.id)}
        user={user} setCurrentPage={setCurrentPage} showToast={showToast}
      />
      <Footer />
    </div>
  );
};

export default ProductPage;