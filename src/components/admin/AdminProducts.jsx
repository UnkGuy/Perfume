import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Edit2, Trash2, Loader2, X } from 'lucide-react';

const AdminProducts = ({ showToast }) => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '', brand: '', price: '', size: '50ml', gender: 'Unisex', stock_count: 10, notes: '', image_url: ''
  });

  const fetchProducts = async () => {
    setIsLoading(true);
    const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (!error && data) setProducts(data);
    setIsLoading(false);
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleOpenModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name, brand: product.brand, price: product.price, size: product.size,
        gender: product.gender || 'Unisex', stock_count: product.stock_count || 0,
        notes: product.notes ? product.notes.join(', ') : '', // Convert array back to comma string
        image_url: product.image_url || ''
      });
    } else {
      setEditingProduct(null);
      setFormData({ name: '', brand: '', price: '', size: '50ml', gender: 'Unisex', stock_count: 10, notes: '', image_url: '' });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    // Format the data for the database
    const payload = {
      ...formData,
      price: parseFloat(formData.price),
      stock_count: parseInt(formData.stock_count),
      available: parseInt(formData.stock_count) > 0, // Auto-calculate availability!
      notes: formData.notes.split(',').map(n => n.trim()).filter(n => n), // Turn comma string into clean array
    };

    try {
      if (editingProduct) {
        const { error } = await supabase.from('products').update(payload).eq('id', editingProduct.id);
        if (error) throw error;
        if (showToast) showToast('Updated', `${payload.name} has been updated.`);
      } else {
        const { error } = await supabase.from('products').insert([payload]);
        if (error) throw error;
        if (showToast) showToast('Added', `${payload.name} added to inventory.`);
      }
      
      setIsModalOpen(false);
      fetchProducts(); // Refresh table
    } catch (err) {
      if (showToast) showToast('Error', 'Failed to save product.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete ${name}? This cannot be undone.`)) {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (!error) {
        if (showToast) showToast('Deleted', `${name} removed.`);
        fetchProducts();
      }
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-2xl font-bold text-white">Inventory Management</h3>
          <p className="text-gray-400 text-sm mt-1">Add, edit, or remove perfumes from your catalog.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-gold-400 hover:bg-gold-300 text-black px-4 py-2 rounded-lg font-bold transition-colors shadow-lg"
        >
          <Plus size={18} /> Add Perfume
        </button>
      </div>

      {/* --- INVENTORY TABLE --- */}
      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-black/40 border-b border-white/10 text-xs uppercase tracking-widest text-gray-500">
              <th className="p-4 font-medium">Product Name</th>
              <th className="p-4 font-medium">Brand & Size</th>
              <th className="p-4 font-medium">Price</th>
              <th className="p-4 font-medium">Stock</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-sm text-gray-300">
            {isLoading ? (
              <tr><td colSpan="5" className="p-8 text-center"><Loader2 className="animate-spin text-gold-400 mx-auto" /></td></tr>
            ) : products.length === 0 ? (
              <tr><td colSpan="5" className="p-8 text-center text-gray-500">No products in inventory. Click "Add Perfume" to start.</td></tr>
            ) : (
              products.map(product => (
                <tr key={product.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-4 font-bold text-white">{product.name}</td>
                  <td className="p-4">{product.brand} • {product.size}</td>
                  <td className="p-4 text-gold-400">₱{product.price}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${product.stock_count > 0 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                      {product.stock_count} in stock
                    </span>
                  </td>
                  <td className="p-4 flex justify-end gap-2">
                    <button onClick={() => handleOpenModal(product)} className="p-2 bg-white/5 hover:bg-gold-400/20 hover:text-gold-400 rounded transition-colors"><Edit2 size={16} /></button>
                    <button onClick={() => handleDelete(product.id, product.name)} className="p-2 bg-white/5 hover:bg-red-500/20 hover:text-red-400 rounded transition-colors"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* --- ADD/EDIT MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-rich-black border border-gold-400/30 rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl overflow-y-auto max-h-[90vh] custom-scrollbar">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">{editingProduct ? 'Edit Perfume' : 'Add New Perfume'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-white transition-colors"><X size={24} /></button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 uppercase tracking-widest mb-1">Perfume Name</label>
                  <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-gold-400 outline-none" placeholder="e.g. Baccarat Rouge 540" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 uppercase tracking-widest mb-1">Brand</label>
                  <input required type="text" value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-gold-400 outline-none" placeholder="e.g. Maison Francis Kurkdjian" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 uppercase tracking-widest mb-1">Price (₱)</label>
                  <input required type="number" min="0" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-gold-400 outline-none" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 uppercase tracking-widest mb-1">Stock Count</label>
                  <input required type="number" min="0" value={formData.stock_count} onChange={e => setFormData({...formData, stock_count: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-gold-400 outline-none" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 uppercase tracking-widest mb-1">Size</label>
                  <input required type="text" value={formData.size} onChange={e => setFormData({...formData, size: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-gold-400 outline-none" placeholder="e.g. 50ml, 100ml" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 uppercase tracking-widest mb-1">Gender Focus</label>
                  <select value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-gold-400 outline-none">
                    <option>Unisex</option><option>Male</option><option>Female</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-400 uppercase tracking-widest mb-1">Fragrance Notes (Comma Separated)</label>
                <textarea required value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-gold-400 outline-none resize-none h-20" placeholder="e.g. Jasmine, Saffron, Cedarwood" />
              </div>
              
              <div>
                <label className="block text-xs text-gray-400 uppercase tracking-widest mb-1">Image URL (Optional)</label>
                <input type="text" value={formData.image_url} onChange={e => setFormData({...formData, image_url: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-gold-400 outline-none" placeholder="https://example.com/perfume.jpg" />
                <p className="text-xs text-gray-500 mt-1">Leave blank to use the default luxury bottle image.</p>
              </div>

              <div className="flex gap-4 pt-4 border-t border-white/10">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 text-gray-400 hover:text-white transition-colors">Cancel</button>
                <button type="submit" disabled={isSaving} className="flex-1 py-3 bg-gold-400 hover:bg-gold-300 text-black font-bold rounded-lg transition-colors flex justify-center items-center">
                  {isSaving ? <Loader2 className="animate-spin" size={18} /> : 'Save Perfume'}
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