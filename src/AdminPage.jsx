import React, { useState } from 'react';
import { 
  Settings, Package, BarChart3, MessageSquare, Plus, Edit, Trash2, 
  X, ChevronLeft, ChevronRight, Upload, Search, User, DollarSign, 
  TrendingUp, Users 
} from 'lucide-react';

const AdminPage = () => {
  // --- STATE MANAGEMENT ---
  const [activeTab, setActiveTab] = useState('products');
  
  // Product Data State
  const [products, setProducts] = useState([
    { id: 1, name: 'Luxury Parfum 1', category: 'Women', price: 99, available: true, brand: 'Designer Brand', size: '50ml', notes: 'Fresh, Citrus' },
    { id: 2, name: 'Luxury Parfum 2', category: 'Men', price: 109, available: true, brand: 'Designer Brand', size: '50ml', notes: 'Woody, Musk' },
    { id: 3, name: 'Luxury Parfum 3', category: 'Unisex', price: 119, available: false, brand: 'Designer Brand', size: '50ml', notes: 'Spicy, Amber' },
    { id: 4, name: 'Luxury Parfum 4', category: 'Women', price: 129, available: true, brand: 'Designer Brand', size: '50ml', notes: 'Floral, Rose' },
    { id: 5, name: 'Luxury Parfum 5', category: 'Men', price: 139, available: true, brand: 'Designer Brand', size: '50ml', notes: 'Leather, Smoke' },
    { id: 6, name: 'Luxury Parfum 6', category: 'Unisex', price: 149, available: false, brand: 'Designer Brand', size: '50ml', notes: 'Vanilla, Sweet' },
    { id: 7, name: 'Luxury Parfum 7', category: 'Women', price: 159, available: true, brand: 'Designer Brand', size: '50ml', notes: 'Fruity' },
    { id: 8, name: 'Luxury Parfum 8', category: 'Men', price: 169, available: true, brand: 'Designer Brand', size: '50ml', notes: 'Aqua' },
  ]);

  // Modal States
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null); // Used for Edit & Delete target

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // --- HANDLERS ---

  // Open Modal for Create (null) or Edit (product object)
  const openProductModal = (product = null) => {
    if (product) {
      setCurrentProduct(product);
    } else {
      // Empty template for new product
      setCurrentProduct({ id: null, name: '', brand: '', price: '', size: '50ml', category: 'Women', notes: '', available: true });
    }
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = (e) => {
    e.preventDefault();
    if (currentProduct.id) {
      // Edit Logic
      setProducts(products.map(p => p.id === currentProduct.id ? currentProduct : p));
    } else {
      // Create Logic
      const newProduct = { ...currentProduct, id: Date.now() }; // Mock ID
      setProducts([...products, newProduct]);
    }
    setIsProductModalOpen(false);
  };

  const handleDeleteClick = (product) => {
    setCurrentProduct(product);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    setProducts(products.filter(p => p.id !== currentProduct.id));
    setIsDeleteModalOpen(false);
    setCurrentProduct(null);
    // Reset pagination if deleting the last item on a page
    if (products.length % itemsPerPage === 1 && currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Pagination Logic
  const totalPages = Math.ceil(products.length / itemsPerPage);
  const displayedProducts = products.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // --- SUB-COMPONENT RENDERS ---

  const renderProducts = () => (
    <div className="admin-view-container">
      <header className="admin-header">
        <div className="admin-header-content">
          <div>
            <h1 className="admin-header-title">Product Management</h1>
            <p className="admin-header-subtitle">Manage your perfume inventory</p>
          </div>
          <button className="btn-add" onClick={() => openProductModal(null)}>
            <Plus size={16} />
            Add Product
          </button>
        </div>
      </header>

      <div className="admin-content">
        <div className="table-card">
          <div className="table-header">
            <h2 className="table-title">All Products</h2>
            <div className="table-actions">
              <input type="text" className="table-search" placeholder="Search products..." />
              <select className="table-filter">
                <option>All Categories</option>
                <option>Women</option>
                <option>Men</option>
                <option>Unisex</option>
              </select>
            </div>
          </div>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Availability</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayedProducts.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <div className="product-cell">
                        <div className="product-image-small">
                          <div className="mini-bottle"></div>
                        </div>
                        <div>
                          <div className="product-name-cell">{product.name}</div>
                          <div className="product-brand-cell">{product.brand}</div>
                        </div>
                      </div>
                    </td>
                    <td className="table-text">{product.category}</td>
                    <td className="table-price">₱{product.price}</td>
                    <td>
                      <label className="availability-toggle">
                        <input 
                          type="checkbox" 
                          checked={product.available} 
                          onChange={() => {
                             const updated = {...product, available: !product.available};
                             setProducts(products.map(p => p.id === product.id ? updated : p));
                          }} 
                        />
                        <span className="toggle-slider"></span>
                        <span className={`toggle-label ${product.available ? 'available' : 'unavailable'}`}>
                          {product.available ? 'Available' : 'Out of Stock'}
                        </span>
                      </label>
                    </td>
                    <td>
                      <div className="table-actions-cell">
                        <button className="btn-icon edit" onClick={() => openProductModal(product)}>
                          <Edit size={16} />
                        </button>
                        <button className="btn-icon delete" onClick={() => handleDeleteClick(product)}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination Controls */}
          <div className="admin-pagination">
             <span style={{color: '#9ca3af', fontSize: '0.9rem', marginRight: 'auto'}}>
               Page {currentPage} of {totalPages}
             </span>
             <button 
               className="page-btn" 
               disabled={currentPage === 1} 
               onClick={() => setCurrentPage(p => p - 1)}
             >
               <ChevronLeft size={20} />
             </button>
             {Array.from({length: totalPages}, (_, i) => i + 1).map(num => (
               <button 
                 key={num} 
                 className={`page-btn ${currentPage === num ? 'active' : ''}`}
                 onClick={() => setCurrentPage(num)}
               >
                 {num}
               </button>
             ))}
             <button 
               className="page-btn" 
               disabled={currentPage === totalPages} 
               onClick={() => setCurrentPage(p => p + 1)}
             >
               <ChevronRight size={20} />
             </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="admin-view-container">
      <header className="admin-header">
        <div className="admin-header-content">
          <div>
            <h1 className="admin-header-title">Analytics Dashboard</h1>
            <p className="admin-header-subtitle">Overview of sales and performance</p>
          </div>
          <button className="btn-add" >
            <TrendingUp size={16} />
            Export Report
          </button>
        </div>
      </header>
      
      <div className="analytics-grid">
        <div className="stat-card">
          <div style={{display: 'flex', justifyContent: 'space-between'}}>
            <span className="stat-label">Total Revenue</span>
            <DollarSign size={20} color="#D4AF37" />
          </div>
          <div className="stat-value">₱124,500</div>
          <div style={{color: '#059669', fontSize: '0.85rem'}}>+12.5% from last month</div>
        </div>
        <div className="stat-card">
          <div style={{display: 'flex', justifyContent: 'space-between'}}>
            <span className="stat-label">Total Orders</span>
            <Package size={20} color="#D4AF37" />
          </div>
          <div className="stat-value">1,240</div>
          <div style={{color: '#059669', fontSize: '0.85rem'}}>+5.2% from last month</div>
        </div>
        <div className="stat-card">
          <div style={{display: 'flex', justifyContent: 'space-between'}}>
            <span className="stat-label">Active Users</span>
            <Users size={20} color="#D4AF37" />
          </div>
          <div className="stat-value">8,500</div>
          <div style={{color: '#ef4444', fontSize: '0.85rem'}}>-1.1% from last month</div>
        </div>
        <div className="stat-card">
          <div style={{display: 'flex', justifyContent: 'space-between'}}>
            <span className="stat-label">Conversion Rate</span>
            <TrendingUp size={20} color="#D4AF37" />
          </div>
          <div className="stat-value">3.2%</div>
          <div style={{color: '#059669', fontSize: '0.85rem'}}>+0.4% from last month</div>
        </div>
      </div>

      <div className="table-card" style={{padding: '2rem'}}>
        <h3 className="table-title" style={{marginBottom: '2rem'}}>Sales Overview</h3>
        <div className="chart-mockup">
          {/* Mock Bars for Chart */}
          <div className="chart-bar" style={{height: '40%'}}></div>
          <div className="chart-bar" style={{height: '60%'}}></div>
          <div className="chart-bar" style={{height: '45%'}}></div>
          <div className="chart-bar" style={{height: '80%'}}></div>
          <div className="chart-bar" style={{height: '55%'}}></div>
          <div className="chart-bar" style={{height: '90%'}}></div>
          <div className="chart-bar" style={{height: '70%'}}></div>
        </div>
        <div style={{display: 'flex', justifyContent: 'space-around', marginTop: '1rem', color: '#9ca3af', fontSize: '0.85rem'}}>
          <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
        </div>
      </div>
    </div>
  );

  const renderMessages = () => (
    <div className="admin-view-container">
      <header className="admin-header">
        <div className="admin-header-content">
          <div>
            <h1 className="admin-header-title">Customer Inquiries</h1>
            <p className="admin-header-subtitle">View and reply to messages</p>
          </div>
          <div style={{display: 'flex', gap: '0.5rem'}}>
             {/* Corrected Badge using CSS class */}
             <span className="notification-badge">5 Unread</span>
          </div>
        </div>
      </header>

      <div className="admin-chat-layout">
        <div className="chat-list">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className={`chat-list-item ${i === 1 ? 'active' : ''}`}>
              <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
                <div className="chat-avatar"><User size={16} /></div>
                <div>
                  <div style={{color: '#fff', fontWeight: '500'}}>Customer {i}</div>
                  <div style={{color: '#9ca3af', fontSize: '0.8rem'}}>Is this still available?</div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="chat-area" style={{height: '100%'}}>
           <div className="chat-messages" style={{height: 'calc(100% - 60px)'}}>
             <div className="message-wrapper">
                <div className="message-content">
                  <div className="message-bubble received"><p className="message-text">Hi, do you have Luxury Parfum 1 in stock?</p></div>
                </div>
             </div>
             <div className="message-wrapper sent">
                <div className="message-content">
                  <div className="message-bubble sent"><p className="message-text">Yes, we have plenty in stock!</p></div>
                </div>
             </div>
           </div>
           <div className="chat-input-area">
             <div className="chat-input-wrapper">
                <input type="text" className="chat-input" placeholder="Type a reply..." />
             </div>
           </div>
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="admin-view-container">
      <header className="admin-header">
        <div className="admin-header-content">
          <div>
            <h1 className="admin-header-title">Admin Settings</h1>
            <p className="admin-header-subtitle">Manage account and preferences</p>
          </div>
        </div>
      </header>

      <div className="settings-form">
        <div className="form-group">
          <label className="form-label">Site Name</label>
          <input type="text" className="form-input" defaultValue="KL Scents PH" />
        </div>
        <div className="form-group">
          <label className="form-label">Admin Email</label>
          <input type="email" className="form-input" defaultValue="admin@klscents.ph" />
        </div>
        <div className="form-group">
          <label className="form-label">New Password</label>
          <input type="password" className="form-input" placeholder="Leave blank to keep current" />
        </div>
        <button className="btn-primary">Save Changes</button>
      </div>
    </div>
  );

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <div className="admin-sidebar">
        <div className="admin-sidebar-header">
          <div className="admin-logo-container">
            <div className="admin-logo-icon">
              <Settings size={24} />
            </div>
            <div>
              <div className="admin-logo-text">Admin</div>
              <div className="admin-logo-subtitle">Dashboard Panel</div>
            </div>
          </div>
        </div>
        <nav className="admin-nav">
          <ul className="admin-nav-list">
            <li className={`admin-nav-item ${activeTab === 'products' ? 'active' : ''}`} onClick={() => setActiveTab('products')}>
              <Package size={20} />
              <span>Products</span>
            </li>
            <li className={`admin-nav-item ${activeTab === 'analytics' ? 'active' : ''}`} onClick={() => setActiveTab('analytics')}>
              <BarChart3 size={20} />
              <span>Analytics</span>
            </li>
            <li className={`admin-nav-item ${activeTab === 'messages' ? 'active' : ''}`} onClick={() => setActiveTab('messages')}>
              <MessageSquare size={20} />
              <span>Messages</span>
            </li>
            <li className={`admin-nav-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>
              <Settings size={20} />
              <span>Settings</span>
            </li>
          </ul>
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="admin-main">
        {activeTab === 'products' && renderProducts()}
        {activeTab === 'analytics' && renderAnalytics()}
        {activeTab === 'messages' && renderMessages()}
        {activeTab === 'settings' && renderSettings()}
      </div>

      {/* --- ADD / EDIT PRODUCT MODAL --- */}
      {isProductModalOpen && (
        <div className="modal-overlay">
          <div className="admin-modal">
            <div className="modal-header">
              <h2 className="modal-title">{currentProduct.id ? 'Edit Product' : 'Add New Product'}</h2>
              <button className="btn-icon" onClick={() => setIsProductModalOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSaveProduct}>
              <div className="modal-grid">
                 <div className="form-group">
                   <label className="form-label">Product Name</label>
                   <input 
                     type="text" className="form-input" required 
                     value={currentProduct.name}
                     onChange={e => setCurrentProduct({...currentProduct, name: e.target.value})}
                   />
                 </div>
                 <div className="form-group">
                   <label className="form-label">Brand</label>
                   <input 
                     type="text" className="form-input" required 
                     value={currentProduct.brand}
                     onChange={e => setCurrentProduct({...currentProduct, brand: e.target.value})}
                   />
                 </div>
                 <div className="form-group">
                   <label className="form-label">Price (₱)</label>
                   <input 
                     type="number" className="form-input" required 
                     value={currentProduct.price}
                     onChange={e => setCurrentProduct({...currentProduct, price: e.target.value})}
                   />
                 </div>
                 <div className="form-group">
                   <label className="form-label">Size</label>
                   <input 
                     type="text" className="form-input" 
                     value={currentProduct.size}
                     onChange={e => setCurrentProduct({...currentProduct, size: e.target.value})}
                   />
                 </div>
                 <div className="form-group">
                   <label className="form-label">Category</label>
                   <select 
                      className="form-input"
                      value={currentProduct.category}
                      onChange={e => setCurrentProduct({...currentProduct, category: e.target.value})}
                   >
                     <option>Women</option>
                     <option>Men</option>
                     <option>Unisex</option>
                   </select>
                 </div>
                 <div className="form-group">
                   <label className="form-label">Status</label>
                   <select 
                      className="form-input"
                      value={currentProduct.available ? 'available' : 'unavailable'}
                      onChange={e => setCurrentProduct({...currentProduct, available: e.target.value === 'available'})}
                   >
                     <option value="available">Available</option>
                     <option value="unavailable">Out of Stock</option>
                   </select>
                 </div>
              </div>
              <div className="form-group" style={{marginTop: '1rem'}}>
                 <label className="form-label">Scent Notes (comma separated)</label>
                 <input 
                    type="text" className="form-input" 
                    value={currentProduct.notes}
                    onChange={e => setCurrentProduct({...currentProduct, notes: e.target.value})}
                 />
              </div>
              <div className="form-group">
                <label className="form-label">Product Image</label>
                <div className="file-upload-box">
                  <div style={{textAlign: 'center'}}>
                    <Upload size={24} style={{marginBottom: '0.5rem'}} />
                    <div>Click to upload image</div>
                  </div>
                </div>
              </div>
              <button type="submit" className="btn-primary" style={{width: '100%', marginTop: '1rem'}}>
                {currentProduct.id ? 'Update Product' : 'Create Product'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- DELETE CONFIRMATION MODAL --- */}
      {isDeleteModalOpen && (
        <div className="modal-overlay">
          <div className="admin-modal" style={{maxWidth: '400px'}}>
             <div style={{textAlign: 'center', padding: '1rem'}}>
               <div style={{margin: '0 auto 1rem auto', width: '50px', height: '50px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444'}}>
                 <Trash2 size={24} />
               </div>
               <h2 className="modal-title" style={{marginBottom: '0.5rem'}}>Delete Product?</h2>
               <p style={{color: '#9ca3af', marginBottom: '2rem'}}>
                 Are you sure you want to delete <strong>{currentProduct?.name}</strong>? This action cannot be undone.
               </p>
               <div style={{display: 'flex', gap: '1rem'}}>
                 <button className="btn-guest" style={{flex: 1}} onClick={() => setIsDeleteModalOpen(false)}>Cancel</button>
                 <button className="btn-primary" style={{flex: 1, background: '#ef4444', borderColor: '#ef4444'}} onClick={confirmDelete}>Delete</button>
               </div>
             </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminPage;