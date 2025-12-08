  import React, { useState, useEffect } from 'react';
  import { Star, Trash2, MessageSquare, Check, Plus, Minus, ShoppingBag, ArrowRight, AlertCircle } from 'lucide-react';
  import Header from './Header';
  import Footer from './Footer';

  const CartPage = ({ cartItems, removeFromCart, setCurrentPage }) => {
    // 1. Initialize State with "Quantity" property added to items
    // If props.cartItems is empty, we use the Mock Default items as requested
    const [localItems, setLocalItems] = useState([]);
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
      if (!isInitialized) {
        const initialData = cartItems.length > 0 ? cartItems : [
          { id: 1, name: "Luxury Parfum 1", brand: "Designer Brand", price: 99, size: "50ml", available: true },
          { id: 2, name: "Luxury Parfum 4", brand: "Designer Brand", price: 129, size: "50ml", available: true },
          // Added an unavailable item to test the logic
          { id: 3, name: "Luxury Parfum 3", brand: "Designer Brand", price: 119, size: "50ml", available: false } 
        ];

        // Add quantity: 1 and isRemoving: false to all items
        const processedItems = initialData.map(item => ({
          ...item,
          quantity: 1,
          isRemoving: false
        }));

        setLocalItems(processedItems);
        setIsInitialized(true);
      }
    }, [cartItems, isInitialized]);

    // --- Logic Helpers ---

    const handleQuantity = (index, delta) => {
      const newItems = [...localItems];
      const item = newItems[index];
      
      // Prevent going below 1
      if (item.quantity + delta >= 1) {
        item.quantity += delta;
        setLocalItems(newItems);
      }
    };

    const handleRemove = (index) => {
      // 1. Mark as removing (Visual Feedback)
      const newItems = [...localItems];
      newItems[index].isRemoving = true;
      setLocalItems(newItems);

      // 2. Wait 500ms then actually remove
      setTimeout(() => {
        // Remove from local state
        const filtered = localItems.filter((_, i) => i !== index);
        setLocalItems(filtered);
        
        // Call parent prop (Note: indices might mismatch if mixing mock/real, 
        // but for this UI demo we prioritize local state behavior)
        if (cartItems.length > 0) {
          removeFromCart(index);
        }
      }, 500);
    };

    const calculateTotal = () => {
      return localItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    };

    const hasUnavailableItems = localItems.some(item => !item.available);

    // --- Render Empty State ---
    if (isInitialized && localItems.length === 0) {
      return (
        <div className="gradient-bg">
          <Header setCurrentPage={setCurrentPage} cartItems={cartItems} />
          <div className="cart-container">
            <div className="cart-empty-state">
              <div className="empty-icon-wrapper">
                <ShoppingBag size={40} />
              </div>
              <h2 className="cart-title" style={{marginBottom: '1rem'}}>Your Cart is Empty</h2>
              <p className="cart-subtitle" style={{marginBottom: '2rem'}}>Looks like you haven't found your signature scent yet.</p>
              <button className="btn-primary" onClick={() => setCurrentPage('products')}>
                Start Shopping <ArrowRight size={16} style={{marginLeft: '8px'}}/>
              </button>
            </div>
          </div>
          <Footer />
        </div>
      );
    }

    return (
      <div className="gradient-bg">
        <Header setCurrentPage={setCurrentPage} cartItems={cartItems} />
        
        <div className="cart-container">
          <div className="cart-header">
            <h1 className="cart-title">Your Selected Items</h1>
            <p className="cart-subtitle">Review your items before messaging the seller</p>
          </div>
          
          <div className="cart-layout">
            {/* --- Left Column: Items --- */}
            <div className="cart-items">
              {localItems.map((item, index) => (
                <div key={index} className={`cart-item ${item.isRemoving ? 'removing' : ''}`}>
                  <div className="cart-item-content">
                    {/* Clickable Image -> Navigates to Products */}
                    <div 
                      className="cart-item-image" 
                      onClick={() => setCurrentPage('products')}
                      style={{ cursor: 'pointer' }}
                      title="View Product Details"
                    >
                      <div className="mini-bottle"></div>
                    </div>
                    
                    <div className="cart-item-details">
                      <div className="cart-item-header">
                        <div>
                          {/* Clickable Name -> Navigates to Products */}
                          <h3 
                            className="cart-item-name"
                            onClick={() => setCurrentPage('products')}
                            style={{ cursor: 'pointer' }}
                          >
                            {item.name}
                          </h3>
                          <p className="cart-item-meta">{item.brand} • {item.size}</p>
                          
                          {/* Availability Logic */}
                          {item.available ? (
                            <span className="availability-badge available" style={{ marginTop: '0.5rem' }}>
                              <Check size={12} /> Available
                            </span>
                          ) : (
                            <span className="availability-badge unavailable" style={{ marginTop: '0.5rem' }}>
                              Out of Stock
                            </span>
                          )}
                        </div>
                        
                        <button 
                          className="btn-remove" 
                          onClick={() => handleRemove(index)}
                          title="Remove Item"
                        >
                          {item.isRemoving ? '...' : <Trash2 size={20} />}
                        </button>
                      </div>

                      {/* Quantity & Price Row */}
                      <div className="cart-item-footer" style={{marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                        <div className="quantity-controls">
                          <button 
                            className="btn-qty" 
                            onClick={() => handleQuantity(index, -1)}
                            disabled={item.quantity <= 1}
                          >
                            <Minus size={14} />
                          </button>
                          <span className="qty-value">{item.quantity}</span>
                          <button 
                            className="btn-qty"
                            onClick={() => handleQuantity(index, 1)}
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <span className="cart-item-price">
                          ₱{(item.price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* --- Right Column: Summary --- */}
            <div>
              <div className="order-summary">
                <h2 className="summary-title">Ready to Purchase?</h2>
                <p className="summary-description">Message the seller to arrange payment and delivery details</p>
                
                <div className="summary-items-list">
                  <p className="summary-label">Items to discuss:</p>
                  {localItems.map((item, index) => (
                    <div key={index} className="summary-item">
                      <span>
                        <span style={{color: '#D4AF37', fontWeight: 'bold'}}>{item.quantity}x</span> {item.name}
                      </span>
                      <span className="summary-item-price">
                        ₱{(item.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
                
                <div className="summary-total">
                  <span>Total</span>
                  <span className="summary-total-price">
                    ₱{calculateTotal().toLocaleString()}
                  </span>
                </div>
                
                {/* Checkout Button with Disabled Logic */}
                <button 
                  className="btn-checkout" 
                  onClick={() => setCurrentPage('messages')}
                  disabled={hasUnavailableItems}
                >
                  <MessageSquare size={20} />
                  {hasUnavailableItems ? 'Remove Unavailable Items' : 'Message Seller'}
                </button>

                {hasUnavailableItems && (
                  <div className="summary-warning">
                    <AlertCircle size={16} />
                    <span>Some items are out of stock</span>
                  </div>
                )}
                
                <div className="secure-badge">
                  <Check size={16} />
                  <span>Direct seller communication</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  };

  export default CartPage;