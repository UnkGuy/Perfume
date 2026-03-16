import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Loader2, X, CheckCircle, XCircle, Tag } from 'lucide-react';
import ImageUploader from '../ImageUploader'; 
import { scentNotes } from '../../data/products';
import { useProducts } from '../../hooks/useProducts'; // <-- NEW HOOK IMPORT

const AdminProducts = ({ showToast }) => {
  // 1. ALL DATA LOGIC MOVED TO THE HOOK
  const { products, isLoading, saveProduct, deleteProduct } = useProducts(showToast);
  
  // 2. ONLY UI STATE REMAINS HERE
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '', brand: '', description: '', price: '', compare_at_price: '', size: '50ml', gender: 'Unisex', stock_count: '', notes: [], image_urls: [], available: true
  });

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
      // 3. USE THE HOOK TO SAVE (Pass the ID if we are editing)
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
        // 4. USE THE HOOK TO DELETE
        await deleteProduct(id);
        if (showToast) showToast('Deleted', `${name} removed.`);
      } catch (err) {
        if (showToast) showToast('Error', 'Failed to delete product', 'error');
      }
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-2xl font-bold text-white">Inventory Management</h3>
          <p className="text-gray-400 text-sm mt-1">Add, edit, or set discounts for your catalog.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-gold-400 hover:bg-gold-300 text-black px-4 py-2 rounded-lg font-bold transition-colors shadow-lg"
        >
          <Plus size={18} /> Add Perfume
        </button>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
        <table className="w-full text-left border-collapse">
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
            ) : products.length === 0 ? (
              <tr><td colSpan="6" className="p-8 text-center text-gray-500">No products in inventory. Click "Add Perfume" to start.</td></tr>
            ) : (
              products.map(product => {
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