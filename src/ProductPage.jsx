import React, { useState } from 'react';
import { Search, Filter, Star, Droplets, Ruler, X, ArrowLeft, ChevronLeft, ChevronRight, User } from 'lucide-react';
import Header from './Header';
import Footer from './Footer';

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

  // --- NEW: Sort and Filter States ---
  const [sortOption, setSortOption] = useState('date'); // default sort
  const [ratingFilter, setRatingFilter] = useState(0); // 0 means "All"

  // --- Mock Data (Added 'rating' to each product) ---
  const products = [
    { id: 1, name: "Luxury Parfum 1", brand: "Designer Brand", price: 99, rating: 4.8, size: "50ml", notes: ["Fresh", "Citrus", "Woody"], available: true },
    { id: 2, name: "Luxury Parfum 2", brand: "Designer Brand", price: 109, rating: 4.5, size: "50ml", notes: ["Floral", "Sweet", "Musk"], available: true },
    { id: 3, name: "Luxury Parfum 3", brand: "Designer Brand", price: 119, rating: 3.9, size: "50ml", notes: ["Oriental", "Spicy", "Amber"], available: false },
    { id: 4, name: "Luxury Parfum 4", brand: "Designer Brand", price: 129, rating: 5.0, size: "50ml", notes: ["Aquatic", "Fresh", "Clean"], available: true },
    { id: 5, name: "Luxury Parfum 5", brand: "Designer Brand", price: 139, rating: 4.2, size: "50ml", notes: ["Woody", "Leather", "Smoky"], available: true },
    { id: 6, name: "Luxury Parfum 6", brand: "Designer Brand", price: 149, rating: 4.7, size: "50ml", notes: ["Fruity", "Sweet", "Vanilla"], available: true },
    { id: 7, name: "Luxury Parfum 7", brand: "Designer Brand", price: 159, rating: 4.0, size: "50ml", notes: ["Green", "Herbal", "Fresh"], available: true },
    { id: 8, name: "Luxury Parfum 8", brand: "Designer Brand", price: 169, rating: 3.5, size: "50ml", notes: ["Gourmand", "Sweet", "Coffee"], available: false },
    { id: 9, name: "Luxury Parfum 9", brand: "Designer Brand", price: 179, rating: 4.9, size: "50ml", notes: ["Chypre", "Mossy", "Citrus"], available: true }
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

  // --- PROCESSING LOGIC: Filter & Sort ---
  const getProcessedProducts = () => {
    // 1. Filter
    let filtered = products.filter(product => {
      // Filter by Rating
      if (product.rating < ratingFilter) return false;
      // Filter by Price (connected the sliders)
      if (product.price < priceRange.min || product.price > priceRange.max) return false;
      return true;
    });

    // 2. Sort
    return filtered.sort((a, b) => {
      if (sortOption === 'price-asc') return a.price - b.price;
      if (sortOption === 'price-desc') return b.price - a.price;
      if (sortOption === 'rating-desc') return b.rating - a.rating; // High to Low
      if (sortOption === 'rating-asc') return a.rating - b.rating; // Low to High
      return 0; // Default (Date/ID)
    });
  };

  const processedProducts = getProcessedProducts();

  return (
    <div className="gradient-bg">
      <Header setCurrentPage={setCurrentPage} cartItems={cartItems} />

      <div className="products-container">
        {/* Search Bar */}
        {!selectedProduct && (
          <div style={{ maxWidth: '42rem', margin: '0 auto 2rem auto', position: 'relative' }}>
            <Search size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#D4AF37' }} />
            <input 
              type="text" 
              placeholder="Search for your perfect scent..."
              className="form-input"
              style={{ paddingLeft: '3rem' }}
            />
          </div>
        )}

        <div className="products-layout">
          {/* --- SIDEBAR --- */}
          {!selectedProduct && (
            <div className="filters-sidebar">
              <div className="filter-card">
                <div className="filter-header">
                  <Filter size={20} />
                  <h3 className="filter-title">Filters</h3>
                  {/* Reset Button */}
                  {(ratingFilter > 0 || priceRange.min > 0) && (
                    <button 
                      onClick={() => {setRatingFilter(0); setPriceRange({min:0, max:1000})}}
                      style={{marginLeft:'auto', fontSize:'0.8rem', color:'#D4AF37', background:'none', border:'none', cursor:'pointer'}}
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* --- NEW: CUSTOMER RATING FILTER --- */}
                <div className="filter-section">
                   <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.75rem'}}>
                    <Star size={16} color="#D4AF37" />
                    <h4 className="filter-section-title" style={{marginBottom: 0}}>Customer Rating</h4>
                  </div>
                  <div className="filter-options">
                    {[5, 4, 3, 2, 1].map(starCount => (
                      <div key={starCount} className="filter-option">
                        <input 
                          type="radio" 
                          id={`star-${starCount}`} 
                          name="rating" 
                          checked={ratingFilter === starCount} 
                          onChange={() => setRatingFilter(starCount)}
                        />
                        <label htmlFor={`star-${starCount}`} style={{display:'flex', alignItems:'center', gap:'5px', cursor:'pointer'}}>
                          <div style={{display:'flex'}}>
                             {[...Array(5)].map((_, i) => (
                               <Star key={i} size={14} fill={i < starCount ? "#D4AF37" : "#e5e7eb"} color={i < starCount ? "#D4AF37" : "#e5e7eb"} />
                             ))}
                          </div>
                          <span style={{fontSize:'0.85rem'}}>{starCount === 5 ? "" : "& Up"}</span>
                        </label>
                      </div>
                    ))}
                    {/* All Stars Option */}
                    <div className="filter-option">
                        <input 
                          type="radio" 
                          id="star-all" 
                          name="rating" 
                          checked={ratingFilter === 0} 
                          onChange={() => setRatingFilter(0)}
                        />
                        <label htmlFor="star-all">All Ratings</label>
                    </div>
                  </div>
                </div>

                {/* Price Range */}
                <div className="filter-section">
                  <h4 className="filter-section-title">Price Range</h4>
                  <div className="price-range-container">
                    <div className="price-inputs-row">
                      <div className="price-input-group">
                        <span className="currency-symbol">₱</span>
                        <input type="number" className="price-input" value={priceRange.min} onChange={(e) => handleInput(e, 'min')} placeholder="Min" />
                      </div>
                      <span className="price-separator">-</span>
                      <div className="price-input-group">
                        <span className="currency-symbol">₱</span>
                        <input type="number" className="price-input" value={priceRange.max} onChange={(e) => handleInput(e, 'max')} placeholder="Max" />
                      </div>
                    </div>
                    <div className="range-slider-container">
                      <div className="slider-track"></div>
                      <div className="slider-range" style={{ left: `${getPercent(priceRange.min)}%`, width: `${getPercent(priceRange.max) - getPercent(priceRange.min)}%` }}></div>
                      <div className="slider-thumb-node" style={{ left: `${getPercent(priceRange.min)}%` }}></div>
                      <div className="slider-thumb-node" style={{ left: `${getPercent(priceRange.max)}%` }}></div>
                      <input type="range" min={MIN_LIMIT} max={MAX_LIMIT} value={priceRange.min} onChange={(e) => handleSliderChange(e, 'min')} className="thumb-input" style={{ zIndex: priceRange.min > MAX_LIMIT - 100 ? 5 : 3 }} />
                      <input type="range" min={MIN_LIMIT} max={MAX_LIMIT} value={priceRange.max} onChange={(e) => handleSliderChange(e, 'max')} className="thumb-input" style={{ zIndex: 4 }} />
                    </div>
                  </div>
                </div>

                {/* Gender */}
                <div className="filter-section">
                  <h4 className="filter-section-title">Gender</h4>
                  <div className="filter-options">
                    {['Women', 'Men', 'Unisex'].map(cat => (
                      <div key={cat} className="filter-option"><input type="checkbox" id={cat} /><label htmlFor={cat}>{cat}</label></div>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                <div className="filter-section">
                  <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.75rem'}}>
                    <Droplets size={16} color="#D4AF37" />
                    <h4 className="filter-section-title" style={{marginBottom: 0}}>Fragrance Notes</h4>
                  </div>
                  <div className="filter-scroll-area">
                    <div className="filter-grid">
                      {scentNotes.map(note => (
                        <div key={note} className="filter-option"><input type="checkbox" id={note} /><label htmlFor={note} style={{fontSize: '0.85rem'}}>{note}</label></div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Size */}
                <div className="filter-section">
                  <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.75rem'}}>
                    <Ruler size={16} color="#D4AF37" />
                    <h4 className="filter-section-title" style={{marginBottom: 0}}>Size</h4>
                  </div>
                  <div className="filter-options">
                    {bottleSizes.map(size => (
                      <div key={size} className="filter-option"><input type="checkbox" id={size} /><label htmlFor={size}>{size}</label></div>
                    ))}
                  </div>
                </div>

                {/* Brand */}
                <div className="filter-section">
                  <h4 className="filter-section-title">Brand</h4>
                  <div className="filter-options">
                    {['Chanel', 'Dior', 'Tom Ford', 'Versace'].map(brand => (
                      <div key={brand} className="filter-option"><input type="checkbox" id={brand} /><label htmlFor={brand}>{brand}</label></div>
                    ))}
                  </div>
                </div>

                <button className="btn-primary" style={{ width: '100%' }}>Apply Filters</button>
              </div>
            </div>
          )}

          {/* --- MAIN CONTENT AREA --- */}
          <div className="products-main" style={{ width: selectedProduct ? '100%' : 'auto' }}>
            
            {/* Conditional Rendering: Show Details OR Show Grid */}
            {selectedProduct ? (
              // --- PRODUCT DETAILS PAGE VIEW ---
              <div className="product-details-container">
                <button className="back-btn" onClick={() => setSelectedProduct(null)}>
                  <ArrowLeft size={20} /> Back to Products
                </button>
                
                <div className="details-grid">
                  <div className="details-image-container">
                    <div className="bottle-design" style={{ transform: 'scale(2)' }}>
                      <div className="bottle-neck"></div>
                      <div className="bottle-body"></div>
                      <div className="bottle-base"></div>
                    </div>
                  </div>
                  
                  <div className="details-info">
                    <span className="details-brand">{selectedProduct.brand}</span>
                    <h1>{selectedProduct.name}</h1>
                    <div className="star-rating" style={{marginBottom: '1rem', display:'flex', alignItems:'center', gap:'5px'}}>
                        <span style={{fontWeight:'bold', color:'#D4AF37'}}>{selectedProduct.rating}</span>
                        <div style={{display:'flex'}}>
                           {[...Array(5)].map((_, idx) => <Star key={idx} size={20} fill={idx < Math.round(selectedProduct.rating) ? "#D4AF37" : "none"} color="#D4AF37" />)}
                        </div>
                        <span style={{color: '#9ca3af', fontSize: '0.9rem', marginLeft: '0.5rem'}}>(124 Reviews)</span>
                    </div>
                    <span className="details-price">₱{selectedProduct.price}</span>
                    
                    <p className="details-description">
                      Experience the essence of luxury with {selectedProduct.name}. 
                      Crafted with precision, this fragrance combines the finest {selectedProduct.notes[0]} 
                      notes with subtle hints of {selectedProduct.notes[1]}. 
                    </p>

                    <h3 className="details-notes-title">Fragrance Notes</h3>
                    <div className="details-notes-list">
                      {selectedProduct.notes.map(note => (
                        <span key={note} className="note-tag">{note}</span>
                      ))}
                    </div>

                    <div style={{display: 'flex', gap: '1rem', marginTop: '2rem'}}>
                        <button 
                          className="btn-add-cart"
                          style={{flex: 2, padding: '1rem'}}
                          disabled={!selectedProduct.available}
                          onClick={(e) => selectedProduct.available && handleAddToCart(e, selectedProduct)}
                        >
                          {selectedProduct.available ? 'Add to Cart' : 'Out of Stock'}
                        </button>
                        <button 
                          className="btn-review" 
                          style={{flex: 1, padding: '1rem'}}
                          onClick={(e) => openReviewModal(e, selectedProduct)}
                        >
                          <Star size={20} /> Write Review
                        </button>
                    </div>
                  </div>
                </div>

                {/* --- CUSTOMER REVIEWS SECTION --- */}
                <div className="reviews-section">
                  <div className="reviews-header-row">
                    <h3 className="reviews-title">Customer Reviews (124)</h3>
                    <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                      <span style={{color: '#D4AF37', fontSize: '1.5rem', fontWeight: 'bold'}}>{selectedProduct.rating}</span>
                      <div className="star-rating">
                         {[...Array(5)].map((_, i) => <Star key={i} size={16} fill={i < Math.round(selectedProduct.rating) ? "#D4AF37" : "none"} color="#D4AF37" />)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="reviews-list">
                    {mockReviews.map((review) => (
                      <div key={review.id} className="review-card">
                        <div className="review-header">
                          <div className="review-user">
                            <div className="user-avatar">
                              {review.user.charAt(0)}
                            </div>
                            <div>
                              <span className="user-name">
                                {review.user} 
                                <span className="verified-badge"> Verified Buyer</span>
                              </span>
                              <span className="review-date">{review.date}</span>
                            </div>
                          </div>
                          <div className="star-rating">
                             {[...Array(5)].map((_, i) => (
                               <Star key={i} size={14} fill={i < review.rating ? "#D4AF37" : "none"} color="#D4AF37" />
                             ))}
                          </div>
                        </div>
                        <p className="review-text">{review.text}</p>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            ) : (
              // --- STANDARD GRID VIEW ---
              <>
                <div className="products-header">
                  <div>
                    <h2 className="products-title">All Perfumes</h2>
                    <p className="products-count">Showing {processedProducts.length} results</p>
                  </div>
                  
                  {/* --- NEW: SORT DROPDOWN --- */}
                  <select 
                    className="sort-select"
                    value={sortOption} 
                    onChange={(e) => setSortOption(e.target.value)}
                  >
                    <option value="date">Date: Newest</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="rating-desc">Rating: High to Low</option>
                    <option value="rating-asc">Rating: Low to High</option>
                  </select>
                </div>

                <div className="products-grid">
                  {processedProducts.length > 0 ? (
                    processedProducts.map(product => (
                      <div 
                        key={product.id} 
                        className={`product-card ${!product.available ? 'out-of-stock' : ''}`}
                        onClick={() => setSelectedProduct(product)}
                        style={{cursor: 'pointer'}}
                      >
                        <div className="product-image">
                          <div className="bottle-design">
                            <div className="bottle-neck"></div>
                            <div className="bottle-body"></div>
                            <div className="bottle-base"></div>
                          </div>
                          {product.available && <span className="new-badge">NEW</span>}
                          {!product.available && <span className="out-of-stock-badge">OUT OF STOCK</span>}
                        </div>
                        <div className="product-info">
                          <div className="star-rating" style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                            <div style={{display:'flex'}}>
                               {[...Array(5)].map((_, idx) => <Star key={idx} size={12} fill={idx < Math.round(product.rating) ? "#D4AF37" : "none"} color="#D4AF37" />)}
                            </div>
                            <span style={{fontSize:'0.75rem', color:'#9ca3af'}}>{product.rating}</span>
                          </div>
                          <h3 className="product-name">{product.name}</h3>
                          <p className="product-brand">{product.brand} • {product.size}</p>
                          
                          <div style={{fontSize: '0.75rem', color: '#9ca3af', marginBottom: '0.5rem'}}>
                            {product.notes.join(" • ")}
                          </div>

                          <div className="product-footer">
                            <div className="price-section">
                              <span className="product-price">₱{product.price}</span>
                            </div>
                            <div className="product-actions">
                              <button 
                                className="btn-add-cart"
                                disabled={!product.available}
                                onClick={(e) => product.available && handleAddToCart(e, product)}
                              >
                                {product.available ? 'Add to Cart' : 'Unavailable'}
                              </button>
                              <button 
                                className="btn-review"
                                onClick={(e) => openReviewModal(e, product)}
                              >
                                <Star size={16} />
                                Review
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{gridColumn:'1/-1', padding:'3rem', textAlign:'center', color:'#9ca3af'}}>
                      No products match your filters.
                    </div>
                  )}
                </div>

                {/* --- Pagination --- */}
                <div className="pagination-container">
                  <button className="page-btn" disabled={activePage === 1} onClick={() => setActivePage(p => p - 1)}>
                    <ChevronLeft size={20} />
                  </button>
                  {[1, 2, 3].map(num => (
                    <button 
                      key={num} 
                      className={`page-btn ${activePage === num ? 'active' : ''}`}
                      onClick={() => setActivePage(num)}
                    >
                      {num}
                    </button>
                  ))}
                  <button className="page-btn" onClick={() => setActivePage(p => p + 1)}>
                    <ChevronRight size={20} />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* --- Review Modal Popup --- */}
      {isReviewOpen && (
        <div className="modal-overlay" onClick={() => setIsReviewOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setIsReviewOpen(false)}>
              <X size={20} />
            </button>
            <h2 className="modal-title">Write a Review</h2>
            <div style={{textAlign: 'center', marginBottom: '1rem', color: '#D4AF37'}}>
              {reviewTarget?.name}
            </div>
            <div style={{display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.5rem'}}>
              {[...Array(5)].map((_, i) => <Star key={i} size={24} fill="#D4AF37" color="#D4AF37" style={{cursor: 'pointer'}} />)}
            </div>
            <textarea className="review-textarea" placeholder="Share your experience with this scent..."></textarea>
            <button className="btn-primary" style={{width: '100%'}} onClick={submitReview}>
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