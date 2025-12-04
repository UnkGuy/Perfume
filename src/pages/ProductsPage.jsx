// src/pages/ProductsPage.jsx
import React, { useState } from 'react';
import { Search, User, ShoppingBag, Gem, Filter, Star, X } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const ProductsPage = () => {
  const { 
    getFilteredProducts, 
    addToCart, 
    cartCount, 
    setCurrentPage,
    filters,
    updateFilters,
    resetFilters,
    sortBy,
    setSortBy
  } = useAppContext();

  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedAvailability, setSelectedAvailability] = useState([]);

  // Get filtered products
  const filteredProducts = getFilteredProducts();
  const hasActiveFilters = filters.searchQuery || selectedCategories.length > 0 || 
                          selectedBrands.length > 0 || selectedAvailability.length > 0 ||
                          priceRange[0] > 0 || priceRange[1] < 500;

  // Handle search
  const handleSearch = (e) => {
    const query = e.target.value;
    setLocalSearchQuery(query);
    updateFilters({ searchQuery: query });
  };

  // Handle category filter
  const handleCategoryChange = (category) => {
    const newCategories = selectedCategories.includes(category)
      ? selectedCategories.filter(c => c !== category)
      : [...selectedCategories, category];
    
    setSelectedCategories(newCategories);
    updateFilters({ category: newCategories });
  };

  // Handle brand filter
  const handleBrandChange = (brand) => {
    const newBrands = selectedBrands.includes(brand)
      ? selectedBrands.filter(b => b !== brand)
      : [...selectedBrands, brand];
    
    setSelectedBrands(newBrands);
    updateFilters({ brands: newBrands });
  };

  // Handle availability filter
  const handleAvailabilityChange = (status) => {
    const newAvailability = selectedAvailability.includes(status)
      ? selectedAvailability.filter(a => a !== status)
      : [...selectedAvailability, status];
    
    setSelectedAvailability(newAvailability);
    updateFilters({ availability: newAvailability });
  };

  // Handle price range
  const handlePriceChange = (e) => {
    const value = parseInt(e.target.value);
    const newRange = [priceRange[0], value];
    setPriceRange(newRange);
    updateFilters({ priceRange: newRange });
  };

  // Clear all filters
  const handleClearFilters = () => {
    setLocalSearchQuery('');
    setPriceRange([0, 500]);
    setSelectedCategories([]);
    setSelectedBrands([]);
    setSelectedAvailability([]);
    resetFilters();
  };

  // Handle sort change
  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  return (
    <div className="gradient-bg">
      {/* Header */}
      <header className="header">
        <div className="header-container">
          <div className="logo-container" onClick={() => setCurrentPage('welcome')} style={{ cursor: 'pointer' }}>
            <div className="logo-icon">
              <Gem size={24} />
            </div>
            <span className="logo-text">KL Scents PH</span>
          </div>
          
          {/* Search Bar */}
          <div style={{ flex: 1, maxWidth: '42rem', margin: '0 2rem' }}>
            <div style={{ position: 'relative' }}>
              <Search 
                size={20} 
                style={{ 
                  position: 'absolute', 
                  left: '1rem', 
                  top: '50%', 
                  transform: 'translateY(-50%)', 
                  color: '#D4AF37' 
                }} 
              />
              <input 
                type="text" 
                placeholder="Search for your perfect scent..."
                className="form-input"
                style={{ paddingLeft: '3rem' }}
                value={localSearchQuery}
                onChange={handleSearch}
              />
              {localSearchQuery && (
                <button
                  onClick={() => {
                    setLocalSearchQuery('');
                    updateFilters({ searchQuery: '' });
                  }}
                  style={{
                    position: 'absolute',
                    right: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#D4AF37',
                    cursor: 'pointer',
                    padding: '0.25rem',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <X size={18} />
                </button>
              )}
            </div>
          </div>

          <div className="header-actions">
            <button className="icon-btn" onClick={() => setCurrentPage('login')}>
              <User size={20} />
            </button>
            <button className="icon-btn" onClick={() => setCurrentPage('cart')}>
              <ShoppingBag size={20} />
              {cartCount > 0 && <span className="badge">{cartCount}</span>}
            </button>
          </div>
        </div>
      </header>

      <div className="products-container">
        {/* Active Filters Info */}
        {hasActiveFilters && (
          <div className="search-results-info">
            <span className="search-results-text">
              {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} found
            </span>
            <button className="btn-clear-filters" onClick={handleClearFilters}>
              Clear Filters
            </button>
          </div>
        )}

        <div className="products-layout">
          {/* Filters Sidebar */}
          <div className="filters-sidebar">
            <div className="filter-card">
              <div className="filter-header">
                <Filter size={20} />
                <h3 className="filter-title">Filters</h3>
              </div>

              {/* Category Filter */}
              <div className="filter-section">
                <h4 className="filter-section-title">Category</h4>
                <div className="filter-options">
                  {['Women', 'Men', 'Unisex'].map(cat => (
                    <div key={cat} className="filter-option">
                      <input 
                        type="checkbox" 
                        id={cat}
                        checked={selectedCategories.includes(cat)}
                        onChange={() => handleCategoryChange(cat)}
                      />
                      <label htmlFor={cat}>{cat}</label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Availability Filter */}
              <div className="filter-section">
                <h4 className="filter-section-title">Availability</h4>
                <div className="filter-options">
                  <div className="filter-option">
                    <input 
                      type="checkbox" 
                      id="available"
                      checked={selectedAvailability.includes('available')}
                      onChange={() => handleAvailabilityChange('available')}
                    />
                    <label htmlFor="available">Available</label>
                  </div>
                  <div className="filter-option">
                    <input 
                      type="checkbox" 
                      id="out-of-stock"
                      checked={selectedAvailability.includes('out-of-stock')}
                      onChange={() => handleAvailabilityChange('out-of-stock')}
                    />
                    <label htmlFor="out-of-stock">Out of Stock</label>
                  </div>
                </div>
              </div>

              {/* Price Range Filter */}
              <div className="filter-section">
                <h4 className="filter-section-title">Price Range</h4>
                <input 
                  type="range" 
                  min="0"
                  max="500"
                  value={priceRange[1]}
                  onChange={handlePriceChange}
                  style={{ width: '100%', accentColor: '#D4AF37' }} 
                />
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  fontSize: '0.875rem', 
                  color: '#D4AF37', 
                  marginTop: '0.75rem' 
                }}>
                  <span>₱{priceRange[0]}</span>
                  <span>₱{priceRange[1]}</span>
                </div>
              </div>

              {/* Brand Filter */}
              <div className="filter-section">
                <h4 className="filter-section-title">Brand</h4>
                <div className="filter-options">
                  {['Chanel', 'Dior', 'Tom Ford', 'Versace'].map(brand => (
                    <div key={brand} className="filter-option">
                      <input 
                        type="checkbox" 
                        id={brand}
                        checked={selectedBrands.includes(brand)}
                        onChange={() => handleBrandChange(brand)}
                      />
                      <label htmlFor={brand}>{brand}</label>
                    </div>
                  ))}
                </div>
              </div>

              <button className="btn-primary" style={{ width: '100%' }} onClick={handleClearFilters}>
                Reset Filters
              </button>
            </div>
          </div>

          {/* Products Grid */}
          <div className="products-main">
            <div className="products-header">
              <div>
                <h2 className="products-title">All Perfumes</h2>
                <p className="products-count">
                  Showing {filteredProducts.length} of {getFilteredProducts().length} products
                </p>
              </div>
              <select className="sort-select" value={sortBy} onChange={handleSortChange}>
                <option value="featured">Sort by: Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name-asc">Name: A to Z</option>
                <option value="name-desc">Name: Z to A</option>
                <option value="newest">Newest Arrivals</option>
              </select>
            </div>

            {/* No Results */}
            {filteredProducts.length === 0 && (
              <div className="empty-state">
                <div className="empty-state-icon">
                  <Search size={48} />
                </div>
                <h3 className="empty-state-title">No products found</h3>
                <p className="empty-state-message">
                  Try adjusting your filters or search query
                </p>
                <button className="btn-primary" onClick={handleClearFilters}>
                  Clear Filters
                </button>
              </div>
            )}

            {/* Products Grid */}
            {filteredProducts.length > 0 && (
              <div className="products-grid">
                {filteredProducts.map(product => (
                  <div 
                    key={product.id} 
                    className={`product-card ${!product.available ? 'out-of-stock' : ''}`}
                  >
                    {/* Product Image */}
                    <div className="product-image">
                      <div className="bottle-design">
                        <div className="bottle-neck"></div>
                        <div className="bottle-body"></div>
                        <div className="bottle-base"></div>
                      </div>
                      {product.available && <span className="new-badge">NEW</span>}
                      {!product.available && <span className="out-of-stock-badge">OUT OF STOCK</span>}
                    </div>

                    {/* Product Info */}
                    <div className="product-info">
                      <div className="star-rating">
                        {[...Array(5)].map((_, idx) => (
                          <Star key={idx} size={12} fill="#D4AF37" color="#D4AF37" />
                        ))}
                      </div>
                      
                      <h3 className="product-name">{product.name}</h3>
                      <p className="product-brand" style={{ color: '#a0a0a0', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                        {product.brand} • {product.size}
                      </p>

                      {/* Fragrance Notes */}
                      <div className="fragrance-notes">
                        {product.notes.map((note, idx) => (
                          <span key={idx} className="fragrance-note">{note}</span>
                        ))}
                      </div>

                      <div className="product-footer">
                        <div className="price-section">
                          <span className="product-price">₱{product.price}</span>
                        </div>
                        
                        <div className="product-actions">
                          <button 
                            className="btn-add-cart"
                            disabled={!product.available}
                            onClick={() => addToCart(product)}
                          >
                            {product.available ? 'Add to Cart' : 'Unavailable'}
                          </button>
                          <button className="btn-review">
                            <Star size={16} />
                            Review Product
                          </button>
                        </div>
                      </div>

                      {/* Availability Badge */}
                      {product.available ? (
                        <span className="availability-badge available">Available</span>
                      ) : (
                        <span className="availability-badge unavailable">Out of Stock</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;