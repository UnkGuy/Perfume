import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Loader2, X, CheckCircle, XCircle, Tag, Search, ChevronLeft, ChevronRight } from 'lucide-react'; 
import ImageUploader from '../common/ImageUploader'; 
import { scentNotes } from '../../data/products';
import { useProducts } from '../../hooks/useProducts'; 

const AdminProducts = ({ showToast }) => {
  const { products, isLoading, saveProduct, deleteProduct } = useProducts(showToast);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState(''); 
  
  // PAGINATION STATE
  const [activePage, setActivePage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const [formData, setFormData] = useState({
    name: '', brand: '', description: '', price: '', compare_at_price: '', size: '50ml', gender: 'Unisex', stock_count: '', notes: [], image_urls: [], available: true
  });

  // RESET PAGE WHEN SEARCHING
  useEffect(() => {
    setActivePage(1);
  }, [searchQuery]);

  const handleOpenModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name, brand: product.brand, description: product.description || '', price: product.price, compare_at_price: product.compare_at_price || '', size: product.size, gender: product.gender || 'Unisex', stock_count: product.stock_count || '', notes: product.notes || [], image_urls: product.image_urls || [], available: product.available !== false
      });
    } else {
      setEditingProduct(null);
      setFormData({ 
        name: '', brand: '', description: '', price: '', compare_at_price: '', size: '50ml', gender: 'Unisex', stock_count: '', notes: [], image_urls: [], available: true 
      });
    }
    setIsModalOpen(true);
  };

  const handleNoteToggle = (note) => {
    setFormData(prev => ({
      ...prev, notes: prev.notes.includes(note) ? prev.notes.filter(n => n !== note) : [...prev.notes, note]
    }));
  };

  const handleRemoveImage = (indexToRemove) => {
    setFormData(prev => ({ ...prev, image_urls: prev.image_urls.filter((_, index) => index !== indexToRemove) }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    const payload = {
      ...formData,
      description: formData.description.trim(),
      price: parseFloat(formData.price),
      compare_at_price: formData.compare_at_price ? parseFloat(formData.compare_at_price) : null,
      stock_count: formData.stock_count ? parseInt(formData.stock_count) : null,
      available: formData.available,
      notes: formData.notes, 
      image_urls: formData.image_urls
    };

    try {
      await saveProduct(payload, editingProduct ? editingProduct.id : null);
      if (showToast) showToast(editingProduct ? 'Updated' : 'Added', `${payload.name} saved successfully.`);
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      if (showToast) showToast('Error', err.message || 'Check browser console.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete ${name}? This cannot be undone.`)) {
      try {
        await deleteProduct(id);
        if (showToast) showToast('Deleted', `${name} removed.`);
      } catch (err) {
        if (showToast) showToast('Error', 'Failed to delete product', 'error');
      }
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.brand.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // PAGINATION CALCULATIONS
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice(
    (activePage - 1) * ITEMS_PER_PAGE,
    activePage * ITEMS_PER_PAGE
  );

  // Failsafe: if we delete an item and the active page becomes empty, jump back a page
  useEffect(() => {
    if (activePage > totalPages && totalPages > 0) {
      setActivePage(totalPages);
    }
  }, [filteredProducts.length, activePage, totalPages]);

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h3 className="text-2xl font-bold text-white">Inventory Management</h3>
          <p className="text-gray-400 text-sm mt-1">
            Add, edit, or set discounts for your catalog. 
            <span className="ml-2 text-gold-400">({filteredProducts.length} total)</span>
          </p>
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input 
              type="text" 
              placeholder="Search perfumes..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-gold-400 transition-colors"
            />
          </div>

          <button 
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-gold-400 hover:bg-gold-300 text-black px-4 py-2 rounded-lg font-bold transition-colors shadow-lg flex-shrink-0"
          >
            <Plus size={18} /> Add Perfume
          </button>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden shadow-xl flex flex-col">
        
        {/* DESKTOP VIEW */}
        <div className="hidden md:block overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-black/40 border-b border-white/10 text-xs uppercase tracking-widest text-gray-500">
                <th className="p-4 font-medium">Product Name</th>
                <th className="p-4 font-medium">Price</th>
                <th className="p-4 font-medium">Stock</th>
                <th className="p-4 font-medium">Details</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm text-gray-300">
              {isLoading ? (
                <tr><td colSpan="6" className="p-8 text-center"><Loader2 className="animate-spin text-gold-400 mx-auto" /></td></tr>
              ) : paginatedProducts.length === 0 ? (
                <tr><td colSpan="6" className="p-8 text-center text-gray-500">No products found matching "{searchQuery}".</td></tr>
              ) : (
                paginatedProducts.map(product => {
                  const isDiscounted = product.compare_at_price && product.compare_at_price > product.price;
                  return (
                    <tr key={product.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-4 flex items-center gap-3">
                        {product.image_urls && product.image_urls.length > 0 ? (
                          <img src={product.image_urls[0]} alt={product.name} className="w-10 h-10 object-cover rounded bg-white/10 border border-white/5" />
                        ) : (
                          <div className="w-10 h-10 rounded bg-white/5 border border-white/10 flex items-center justify-center text-gray-600 text-xs">No Img</div>
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-white">{product.name}</p>
                            {isDiscounted && <Tag size={12} className="text-green-400" title="On Sale" />}
                          </div>
                          <p className="text-xs text-gray-500">{product.brand} • {product.size}</p>
                        </div>
                      </td>
                      
                      <td className="p-4">
                        {isDiscounted ? (
                          <div className="flex flex-col">
                            <span className="text-green-400 font-bold">₱{product.price}</span>
                            <span className="text-xs text-gray-500 line-through">₱{product.compare_at_price}</span>
                          </div>
                        ) : (
                          <span className="text-gold-400 font-medium">₱{product.price}</span>
                        )}
                      </td>

                      <td className="p-4">
                        {product.stock_count !== null && product.stock_count !== undefined ? (
                          <span className="text-gray-300">{product.stock_count} units</span>
                        ) : (
                          <span className="text-gray-500 italic">Unlimited</span>
                        )}
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-1 bg-white/10 rounded text-xs text-gray-300">{product.gender}</span>
                      </td>
                      <td className="p-4">
                        {product.available ? (
                          <span className="flex items-center gap-1.5 text-green-400 text-xs font-bold"><CheckCircle size={14}/> Available</span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-red-400 text-xs font-bold"><XCircle size={14}/> Unavailable</span>
                        )}
                      </td>
                      <td className="p-4 flex justify-end gap-2">
                        <button onClick={() => handleOpenModal(product)} className="p-2 bg-white/5 hover:bg-gold-400/20 hover:text-gold-400 rounded transition-colors" title="Edit Product"><Edit2 size={16} /></button>
                        <button onClick={() => handleDelete(product.id, product.name)} className="p-2 bg-white/5 hover:bg-red-500/20 hover:text-red-400 rounded transition-colors" title="Delete Product"><Trash2 size={16} /></button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* MOBILE VIEW */}
        <div className="md:hidden flex flex-col divide-y divide-white/10 flex-1">
          {isLoading ? (
            <div className="p-8 text-center"><Loader2 className="animate-spin text-gold-400 mx-auto" /></div>
          ) : paginatedProducts.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No products found matching "{searchQuery}".</div>
          ) : (
            paginatedProducts.map(product => {
              const isDiscounted = product.compare_at_price && product.compare_at_price > product.price;
              
              return (
                <div key={product.id} className="p-4 hover:bg-white/5 transition-colors flex flex-col gap-4">
                  
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex items-center gap-3 overflow-hidden">
                      {product.image_urls && product.image_urls.length > 0 ? (
                        <img src={product.image_urls[0]} alt={product.name} className="w-12 h-12 object-cover rounded-lg bg-white/10 border border-white/5 flex-shrink-0" />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-600 text-[10px] flex-shrink-0">No Img</div>
                      )}
                      <div className="overflow-hidden">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-white text-sm truncate">{product.name}</h4>
                          {isDiscounted && <Tag size={12} className="text-green-400 flex-shrink-0" />}
                        </div>
                        <p className="text-xs text-gray-500 truncate">{product.brand} • {product.size}</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 flex-shrink-0">
                      <button onClick={() => handleOpenModal(product)} className="p-2 bg-white/10 hover:bg-gold-400 hover:text-black rounded transition-colors"><Edit2 size={14} /></button>
                      <button onClick={() => handleDelete(product.id, product.name)} className="p-2 bg-white/10 hover:bg-red-500 hover:text-white rounded transition-colors"><Trash2 size={14} /></button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 bg-black/40 p-3 rounded-lg border border-white/5">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-0.5">Price</span>
                      {isDiscounted ? (
                        <div className="flex items-center gap-2">
                          <span className="text-green-400 text-sm font-bold">₱{product.price}</span>
                          <span className="text-[10px] text-gray-600 line-through">₱{product.compare_at_price}</span>
                        </div>
                      ) : (
                        <span className="text-gold-400 text-sm font-bold">₱{product.price}</span>
                      )}
                    </div>

                    <div className="flex flex-col">
                      <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-0.5">Stock</span>
                      <span className="text-gray-300 text-sm">
                        {product.stock_count !== null && product.stock_count !== undefined ? `${product.stock_count} units` : 'Unlimited'}
                      </span>
                    </div>

                    <div className="flex flex-col">
                      <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-0.5">Gender</span>
                      <span className="text-gray-300 text-sm">{product.gender}</span>
                    </div>

                    <div className="flex flex-col">
                      <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-0.5">Status</span>
                      {product.available ? (
                        <span className="flex items-center gap-1 text-green-400 text-xs font-bold"><CheckCircle size={12}/> Available</span>
                      ) : (
                        <span className="flex items-center gap-1 text-red-400 text-xs font-bold"><XCircle size={12}/> Unavailable</span>
                      )}
                    </div>
                  </div>

                </div>
              );
            })
          )}
        </div>

        {/* PAGINATION CONTROLS */}
        {!isLoading && totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 p-4 border-t border-white/10 bg-black/20">
            <button 
              disabled={activePage === 1} 
              onClick={() => setActivePage(p => p - 1)} 
              className="p-2 border border-white/10 rounded hover:border-gold-400 text-gray-400 hover:text-gold-400 disabled:opacity-30 disabled:hover:border-white/10 disabled:hover:text-gray-400 transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            
            <div className="flex gap-1 overflow-x-auto custom-scrollbar max-w-[200px] sm:max-w-none">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(num => (
                <button 
                  key={num} 
                  onClick={() => setActivePage(num)} 
                  className={`w-8 h-8 flex-shrink-0 rounded text-sm font-bold transition-all ${activePage === num ? 'bg-gold-400 text-black shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                >
                  {num}
                </button>
              ))}
            </div>
            
            <button 
              disabled={activePage === totalPages} 
              onClick={() => setActivePage(p => p + 1)} 
              className="p-2 border border-white/10 rounded hover:border-gold-400 text-gray-400 hover:text-gold-400 disabled:opacity-30 disabled:hover:border-white/10 disabled:hover:text-gray-400 transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}

      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-rich-black border border-gold-400/30 rounded-2xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl overflow-y-auto max-h-[90vh] custom-scrollbar">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">{editingProduct ? 'Edit Perfume' : 'Add New Perfume'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-white transition-colors"><X size={24} /></button>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 uppercase tracking-widest mb-1">Perfume Name</label>
                  <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-gold-400 outline-none transition-colors" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 uppercase tracking-widest mb-1">Brand</label>
                  <input required type="text" value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-gold-400 outline-none transition-colors" />
                </div>

                <div>
                  <label className="block text-xs text-gold-400 font-bold uppercase tracking-widest mb-1">Selling Price (₱)</label>
                  <input required type="number" min="0" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full bg-black/50 border border-gold-400/30 rounded-lg p-3 text-white focus:border-gold-400 outline-none transition-colors" placeholder="Final Price" />
                </div>

                <div>
                  <label className="block text-xs text-gray-400 uppercase tracking-widest mb-1 flex justify-between">
                    Original Price (₱) <span className="text-gray-600">(Optional Sale)</span>
                  </label>
                  <input type="number" min="0" value={formData.compare_at_price} onChange={e => setFormData({...formData, compare_at_price: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-gold-400 outline-none transition-colors" placeholder="Leave blank if not on sale" />
                </div>

                <div>
                  <label className="block text-xs text-gray-400 uppercase tracking-widest mb-1 flex justify-between">
                    Stock Count <span className="text-gray-600">(Optional)</span>
                  </label>
                  <input type="number" min="0" value={formData.stock_count} onChange={e => setFormData({...formData, stock_count: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-gold-400 outline-none transition-colors" placeholder="Leave blank if unlimited" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-gray-400 uppercase tracking-widest mb-1">Size</label>
                    <input required type="text" value={formData.size} onChange={e => setFormData({...formData, size: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-gold-400 outline-none transition-colors" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 uppercase tracking-widest mb-1">Gender</label>
                    <select value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-gold-400 outline-none transition-colors">
                      <option>Unisex</option><option>Male</option><option>Female</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-400 uppercase tracking-widest mb-1 flex justify-between">
                  Product Description <span className="text-gray-600">{formData.description.length}/800</span>
                </label>
                <textarea 
                  required 
                  maxLength={800}
                  value={formData.description} 
                  onChange={e => setFormData({...formData, description: e.target.value})} 
                  className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-gold-400 outline-none transition-colors resize-none h-24 custom-scrollbar" 
                  placeholder="Describe the scent profile, inspiration, and feeling of this perfume..." 
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 uppercase tracking-widest mb-2">Fragrance Notes</label>
                <div className="flex flex-wrap gap-2 p-4 bg-black/30 border border-white/5 rounded-lg max-h-48 overflow-y-auto custom-scrollbar">
                  {scentNotes && scentNotes.map(note => {
                    const isSelected = formData.notes.includes(note);
                    return (
                      <button
                        key={note}
                        type="button"
                        onClick={() => handleNoteToggle(note)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 ${
                          isSelected ? 'bg-gold-400 text-black border-gold-400 shadow-[0_0_10px_rgba(212,175,55,0.3)]' : 'bg-black/50 text-gray-400 border-white/10 hover:border-gold-400/50 hover:text-white'
                        }`}
                      >
                        {note}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-lg">
                <input 
                  type="checkbox" 
                  id="available" 
                  checked={formData.available} 
                  onChange={e => setFormData({...formData, available: e.target.checked})}
                  className="w-5 h-5 accent-gold-400 bg-transparent border-gray-600 rounded cursor-pointer"
                />
                <label htmlFor="available" className="text-sm font-bold text-white cursor-pointer select-none">
                  Product is Available for Purchase
                </label>
              </div>
              
              <div className="bg-black/30 p-4 border border-white/5 rounded-lg">
                <div className="flex justify-between items-end mb-4">
                  <label className="block text-xs text-gray-400 uppercase tracking-widest">
                    Product Images ({formData.image_urls.length}/4)
                  </label>
                  <span className="text-xs text-gray-500">First image is the main thumbnail</span>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {formData.image_urls.map((url, index) => (
                    <div key={index} className="relative group aspect-square rounded-lg border-2 border-white/10 overflow-hidden bg-white/5">
                      <img src={url} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button 
                          type="button" 
                          onClick={() => handleRemoveImage(index)} 
                          className="p-2 bg-red-500 text-white rounded-full hover:scale-110 transition-transform shadow-lg"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      {index === 0 && (
                        <span className="absolute top-2 left-2 bg-gold-400 text-black text-[10px] font-bold px-2 py-0.5 rounded shadow-lg">MAIN</span>
                      )}
                    </div>
                  ))}
                  
                  {formData.image_urls.length < 4 && (
                    <div className="aspect-square">
                      <ImageUploader 
                        onUploadSuccess={(url) => setFormData(prev => ({ ...prev, image_urls: [...prev.image_urls, url] }))} 
                        onError={(err) => { if(showToast) showToast('Error', err, 'error'); }} 
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t border-white/10">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors font-medium">Cancel</button>
                <button type="submit" disabled={isSaving} className="flex-1 py-3 bg-gold-400 hover:bg-gold-300 text-black font-bold rounded-lg transition-all shadow-lg flex justify-center items-center">
                  {isSaving ? <Loader2 className="animate-spin" size={18} /> : 'Save Product'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;