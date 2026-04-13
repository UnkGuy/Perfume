import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ChevronLeft, ChevronRight, LayoutGrid, List, ChevronDown, SlidersHorizontal, ArrowUp } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom'; // <-- REMOVED useLocation, ADDED useParams

import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import ProductCard from '../components/products/ProductCard';
import ProductFilters from '../components/products/ProductFilters';
import ProductDetails from '../components/products/ProductDetails';
import QuickViewModal from '../components/products/QuickViewModal';
import PredictiveSearch from '../components/products/PredictiveSearch';
import ProductSkeleton from '../components/products/ProductSkeleton';

import { useStoreProducts } from '../hooks/useStoreProducts';
import { useUI } from '../contexts/UIContext';

const ITEMS_PER_PAGE = 16;
const MIN_LIMIT = 0;
const MAX_LIMIT = 20000;
const GAP = 50;

const ProductPage = () => {
  const { searchQuery, setSearchQuery } = useUI();
  const { products, isLoading } = useStoreProducts();
  const navigate = useNavigate();
  const { id } = useParams(); // ✨ NEW: Reads the ID directly from the URL!

  const dynamicBrands = useMemo(() => [...new Set(products.map(p => p.brand).filter(Boolean))].sort(), [products]);
  const dynamicSizes  = useMemo(() => [...new Set(products.map(p => p.size).filter(Boolean))].sort(), [products]);
  const dynamicNotes  = useMemo(() => [...new Set(products.flatMap(p => p.notes || []).filter(Boolean))].sort(), [products]);

  const [activePage, setActivePage]         = useState(1);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [priceRange, setPriceRange]         = useState({ min: 0, max: MAX_LIMIT });
  const [sortOption, setSortOption]         = useState('date');
  const [ratingFilter, setRatingFilter]     = useState(0);
  const [viewMode, setViewMode]             = useState('large');
  const [selectedNotes, setSelectedNotes]   = useState([]);
  const [selectedSizes, setSelectedSizes]   = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedGender, setSelectedGender] = useState([]);
  const [showOutOfStock, setShowOutOfStock] = useState(false);
  const [isSortOpen, setIsSortOpen]         = useState(false);
  const [isFiltersOpen, setIsFiltersOpen]   = useState(false);
  const [showBackToTop, setShowBackToTop]   = useState(false);

  // ✨ NEW: The URL drives the app state!
  useEffect(() => {
    // Prevent overriding if data is still fetching
    if (isLoading || products.length === 0) return;

    if (id) {
      // Find product by URL ID
      const found = products.find(p => p.id.toString() === id);
      if (found) {
        setSelectedProduct(found);
      } else {
        // ID doesn't exist, boot them back to the collection page
        navigate('/products', { replace: true });
      }
    } else {
      // No ID in URL, clear selection and show collection
      setSelectedProduct(null);
    }
  }, [id, products, isLoading, navigate]);

  useEffect(() => {
    const handleScroll = () => setShowBackToTop(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  useEffect(() => {
    setActivePage(1);
  }, [searchQuery, priceRange, sortOption, ratingFilter, selectedNotes, selectedSizes, selectedBrands, selectedGender, showOutOfStock]);

  const getPercent = (value) => Math.round(((value - MIN_LIMIT) / (MAX_LIMIT - MIN_LIMIT)) * 100);

  const handleInput = (e, type) => {
    let val = parseInt(e.target.value) || 0;
    if (type === 'min') {
      if (val < MIN_LIMIT) val = MIN_LIMIT;
      if (val > priceRange.max - GAP) val = priceRange.max - GAP;
      setPriceRange({ ...priceRange, min: val });
    } else {
      if (val > MAX_LIMIT) val = MAX_LIMIT;
      if (val < priceRange.min + GAP) val = priceRange.min + GAP;
      setPriceRange({ ...priceRange, max: val });
    }
  };

  const handleSliderChange = (e, type) => {
    let val = parseInt(e.target.value);
    if (type === 'min') {
      if (val < MIN_LIMIT) val = MIN_LIMIT;
      if (val > priceRange.max - GAP) val = priceRange.max - GAP;
      setPriceRange(prev => ({ ...prev, min: val }));
    } else {
      if (val > MAX_LIMIT) val = MAX_LIMIT;
      if (val < priceRange.min + GAP) val = priceRange.min + GAP;
      setPriceRange(prev => ({ ...prev, max: val }));
    }
  };

  const clearAllFilters = useCallback(() => {
    setRatingFilter(0);
    setPriceRange({ min: 0, max: MAX_LIMIT });
    setSearchQuery('');
    setSelectedNotes([]);
    setSelectedSizes([]);
    setSelectedBrands([]);
    setSelectedGender([]);
    setShowOutOfStock(false);
  }, [setSearchQuery]);

  const processedProducts = useMemo(() => {
    let filtered = products.filter(product => {
      if (!showOutOfStock && !product.available) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!product.name.toLowerCase().includes(q) && !product.brand?.toLowerCase().includes(q)) return false;
      }
      if (ratingFilter > 0 && Math.floor(product.rating) !== ratingFilter) return false;
      if (product.price < priceRange.min || product.price > priceRange.max) return false;
      if (selectedNotes.length > 0 && !product.notes?.some(n => selectedNotes.includes(n))) return false;
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
  }, [products, showOutOfStock, searchQuery, ratingFilter, priceRange, selectedNotes, selectedSizes, selectedBrands, selectedGender, sortOption]);

  const hasActiveFilters = ratingFilter > 0 || priceRange.min > 0 || !!searchQuery || selectedNotes.length > 0 || selectedSizes.length > 0 || selectedBrands.length > 0;
  const totalPages        = Math.ceil(processedProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = processedProducts.slice((activePage - 1) * ITEMS_PER_PAGE, activePage * ITEMS_PER_PAGE);

  const startIdx = processedProducts.length === 0 ? 0 : (activePage - 1) * ITEMS_PER_PAGE + 1;
  const endIdx = Math.min(activePage * ITEMS_PER_PAGE, processedProducts.length);

  const sortOptions = [
    { value: 'date',        label: 'Date: Newest' },
    { value: 'price-asc',   label: 'Price: Low to High' },
    { value: 'price-desc',  label: 'Price: High to Low' },
    { value: 'rating-desc', label: 'Rating: High to Low' },
  ];
  const currentSortLabel = sortOptions.find(o => o.value === sortOption)?.label;

  const gridClasses = viewMode === 'compact'
    ? 'grid grid-cols-1 lg:grid-cols-2 gap-4 relative z-0'
    : 'grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6 relative z-0';

  const changePage = (num) => {
    setActivePage(num);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-rich-black text-gray-300 font-sans selection:bg-gold-400 selection:text-black">
      <div className="relative z-50"><Header /></div>

      <div className="container mx-auto px-4 md:px-6 py-24 max-w-[1600px]">
        {!selectedProduct && (
          <PredictiveSearch products={products} searchQuery={searchQuery} setSearchQuery={setSearchQuery} onSelectProduct={(p) => navigate(`/products/${p.id}`)} />
        )}

        <div className="flex flex-col lg:flex-row">
          {!selectedProduct && (
            <aside 
              className={`flex-shrink-0 transition-all duration-500 ease-in-out overflow-hidden
                ${isFiltersOpen 
                  ? 'lg:w-72 lg:mr-12 max-h-[2000px] lg:max-h-none opacity-100 mb-8 lg:mb-0' 
                  : 'lg:w-0 lg:mr-0 max-h-0 lg:max-h-none opacity-0 m-0'
                }
              `}
            >
              <div className="w-full lg:w-72 pb-2">
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
                  showOutOfStock={showOutOfStock} setShowOutOfStock={setShowOutOfStock}
                  availableBrands={dynamicBrands} availableSizes={dynamicSizes} availableNotes={dynamicNotes}
                />
              </div>
            </aside>
          )}

          <main className={`flex-1 w-full min-w-0`}>
            {isLoading ? (
              <div className={gridClasses}>
                {[...Array(8)].map((_, i) => <ProductSkeleton key={i} isCompact={viewMode === 'compact'} />)}
              </div>
            ) : selectedProduct ? (
              <ProductDetails
                product={selectedProduct}
                onBack={() => navigate('/products')} // ✨ Simply removes ID from URL
                onSelect={(p) => navigate(`/products/${p.id}`)} // ✨ Drives directly to URL
                onQuickView={setQuickViewProduct}
              />
            ) : (
              <>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 relative z-10 animate-fade-in">
                  <div>
                    <h2 className="text-3xl font-bold text-white mb-1">All Perfumes</h2>
                    <p className="text-gray-500 text-sm">Showing {startIdx}-{endIdx} of {processedProducts.length} luxury scents</p>
                  </div>

                  <div className="relative w-full md:w-auto flex flex-wrap items-center justify-start md:justify-end gap-3">
                    <button
                      onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                      className={`bg-black/40 border border-gold-400/30 text-gold-400 text-sm rounded px-4 py-2 outline-none hover:bg-gold-400 hover:text-black cursor-pointer flex items-center gap-2 transition-colors ${isFiltersOpen ? 'bg-gold-400 text-black' : ''}`}
                    >
                      <SlidersHorizontal size={16} />
                      <span className="hidden sm:inline">Filters</span>
                    </button>

                    <div className="flex items-center bg-black/40 border border-gold-400/30 rounded-lg p-1">
                      <button onClick={() => setViewMode('large')} className={`p-1.5 rounded transition-colors ${viewMode === 'large' ? 'bg-gold-400 text-black' : 'text-gray-500 hover:text-white'}`} title="Large Grid View">
                        <LayoutGrid size={18} />
                      </button>
                      <button onClick={() => setViewMode('compact')} className={`p-1.5 rounded transition-colors ${viewMode === 'compact' ? 'bg-gold-400 text-black' : 'text-gray-500 hover:text-white'}`} title="Compact View">
                        <List size={18} />
                      </button>
                    </div>

                    <div className="relative">
                      <button
                        onClick={() => setIsSortOpen(!isSortOpen)}
                        onBlur={() => setTimeout(() => setIsSortOpen(false), 200)}
                        className="bg-black/40 border border-gold-400/30 text-gold-400 text-sm rounded pl-4 pr-3 py-2 outline-none hover:border-gold-400 cursor-pointer flex items-center gap-3 transition-colors"
                      >
                        {currentSortLabel}
                        <ChevronDown size={16} className={`transition-transform duration-200 ${isSortOpen ? 'rotate-180' : ''}`} />
                      </button>
                      {isSortOpen && (
                        <div className="absolute left-0 md:left-auto md:right-0 top-full mt-2 w-48 bg-rich-black border border-gold-400/30 rounded-lg shadow-2xl overflow-hidden animate-fade-in z-50">
                          {sortOptions.map(option => (
                            <div key={option.value}
                              onClick={() => { setSortOption(option.value); setIsSortOpen(false); }}
                              className={`px-4 py-3 text-sm cursor-pointer transition-colors ${sortOption === option.value ? 'bg-gold-400/10 text-gold-400 border-l-2 border-gold-400' : 'text-gray-400 hover:bg-white/5 hover:text-gold-300 border-l-2 border-transparent'}`}
                            >{option.label}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className={gridClasses}>
                  {paginatedProducts.length > 0 ? (
                    paginatedProducts.map(product => (
                      <ProductCard key={product.id} product={product} onSelect={(p) => navigate(`/products/${p.id}`)} onQuickView={setQuickViewProduct} isCompact={viewMode === 'compact'} />
                    ))
                  ) : (
                    <div className="col-span-full py-24 text-center">
                      <p className="text-gray-500 text-lg">No perfumes found matching your criteria.</p>
                      <button onClick={clearAllFilters} className="text-gold-400 mt-2 hover:underline">Clear Filters</button>
                    </div>
                  )}
                </div>

                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-16 pb-12">
                    <button disabled={activePage === 1} onClick={() => changePage(activePage - 1)} className="p-2 border border-white/10 rounded hover:border-gold-400 text-gray-400 hover:text-gold-400 disabled:opacity-30 transition-colors">
                      <ChevronLeft size={20} />
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(num => (
                      <button key={num} onClick={() => changePage(num)}
                        className={`w-10 h-10 rounded font-bold transition-all ${activePage === num ? 'bg-gold-400 text-black shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                      >{num}</button>
                    ))}
                    <button disabled={activePage === totalPages} onClick={() => changePage(activePage + 1)} className="p-2 border border-white/10 rounded hover:border-gold-400 text-gray-400 hover:text-gold-400 disabled:opacity-30 transition-colors">
                      <ChevronRight size={20} />
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>

      <QuickViewModal product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />
      <Footer />

      <button
        onClick={scrollToTop}
        className={`fixed bottom-24 right-6 z-[35] p-3 bg-white/10 hover:bg-gold-400 hover:text-black text-white border border-white/20 hover:border-gold-400 rounded-full shadow-lg backdrop-blur-sm transition-all duration-300 ${showBackToTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}
        title="Back to top"
      >
        <ArrowUp size={18} />
      </button>
    </div>
  );
};

export default ProductPage;