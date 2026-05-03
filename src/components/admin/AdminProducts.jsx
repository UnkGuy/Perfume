import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Loader2, CheckCircle, XCircle, Search, ChevronLeft, ChevronRight, ToggleLeft, ToggleRight, ChevronDown, ChevronUp, AlertTriangle, ArrowUpDown } from 'lucide-react';
import { useProducts } from '../../hooks/useAdminProducts';
import { useShop } from '../../contexts/ShopContext';
import { useSettings } from '../../contexts/SettingsContext';
import { supabase } from '../../services/supabase';
import ProductFormModal, { LIMITS } from './ProductFormModal';

const ITEMS_PER_PAGE = 10;
const EMPTY_FORM = {
  name: '', brand: '', description: '', gender: 'Unisex', notes: [], image_urls: [], available: true,
  variants: [{ size: '', price: '', compare_at_price: '', stock_count: '', image_url: '' }], 
};

const AdminProducts = () => {
  const { showToast } = useShop();
  const { settings } = useSettings();
  const { products, isLoading, saveProduct, deleteProduct } = useProducts(showToast);

  const lowStockThreshold = settings?.inventory?.lowStockThreshold || 0;

  const [isModalOpen, setIsModalOpen]       = useState(false);
  const [editingProduct, setEditingProduct]  = useState(null);
  const [isSaving, setIsSaving]             = useState(false);
  const [searchQuery, setSearchQuery]        = useState('');
  const [activePage, setActivePage]          = useState(1);
  const [formData, setFormData]             = useState(EMPTY_FORM);
  const [customNoteInput, setCustomNoteInput] = useState('');
  const [selectedIds, setSelectedIds]        = useState(new Set());
  const [isBulkUpdating, setIsBulkUpdating]  = useState(false);
  const [expandedRows, setExpandedRows]      = useState(new Set());
  
  // Sorting State
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });

  const dynamicNotes    = [...new Set(products.flatMap(p => p.notes || []).filter(Boolean))];
  const allDisplayNotes = [...new Set([...dynamicNotes, ...formData.notes])].sort();
  const allDisplayBrands = [...new Set(products.map(p => p.brand).filter(Boolean))].sort();
  const allDisplaySizes = [...new Set(products.flatMap(p => p.product_variants?.map(v => v.size) || []).filter(Boolean))].sort();

  useEffect(() => { setActivePage(1); setSelectedIds(new Set()); setExpandedRows(new Set()); }, [searchQuery, sortConfig]);

  // Apply Search and Sort
  const filteredProducts = [...products]
    .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.brand.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortConfig.key === 'date') {
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        return sortConfig.direction === 'asc' ? dateA - dateB : dateB - dateA;
      }
      if (sortConfig.key === 'stock') {
        const getStock = (p) => {
          if (!p.product_variants || p.product_variants.length === 0) return 0;
          if (p.product_variants.some(v => v.stock_count === null || v.stock_count === '')) return Infinity;
          return p.product_variants.reduce((acc, v) => acc + (v.stock_count || 0), 0);
        };
        const stockA = getStock(a);
        const stockB = getStock(b);
        return sortConfig.direction === 'asc' ? stockA - stockB : stockB - stockA;
      }
      return 0;
    });

  const totalPages        = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice((activePage - 1) * ITEMS_PER_PAGE, activePage * ITEMS_PER_PAGE);

  useEffect(() => {
    if (activePage > totalPages && totalPages > 0) setActivePage(totalPages);
  }, [filteredProducts.length, activePage, totalPages]);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  const toggleSelect = (id) => setSelectedIds(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });
  
  const toggleExpand = (id) => setExpandedRows(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  const allOnPageSelected = paginatedProducts.length > 0 && paginatedProducts.every(p => selectedIds.has(p.id));
  const toggleSelectAll = () => setSelectedIds(allOnPageSelected ? new Set() : new Set(paginatedProducts.map(p => p.id)));

  const handleBulkAvailability = async (makeAvailable) => {
    if (selectedIds.size === 0) return;
    setIsBulkUpdating(true);
    try {
      const { error } = await supabase.from('products').update({ available: makeAvailable }).in('id', [...selectedIds]);
      if (error) throw error;
      showToast('Updated', `${selectedIds.size} product(s) marked ${makeAvailable ? 'available' : 'unavailable'}.`);
      setSelectedIds(new Set());
      window.dispatchEvent(new CustomEvent('klscents:products-updated'));
    } catch (err) {
      showToast('Error', err.message || 'Bulk update failed.', 'error');
    } finally {
      setIsBulkUpdating(false);
    }
  };

  const handleOpenModal = (product = null) => {
    setEditingProduct(product);
    setFormData(product ? {
      name: product.name, brand: product.brand, description: product.description || '',
      gender: product.gender || 'Unisex', notes: product.notes || [],
      image_urls: product.image_urls || [], available: product.available !== false,
      variants: product.product_variants?.length > 0 ? product.product_variants.map(v => ({
        id: v.id, size: v.size, price: String(v.price), compare_at_price: v.compare_at_price ? String(v.compare_at_price) : '',
        stock_count: v.stock_count != null ? String(v.stock_count) : '', image_url: v.image_url || '',
      })) : [{ size: '', price: '', compare_at_price: '', stock_count: '', image_url: '' }]
    } : EMPTY_FORM);
    setIsModalOpen(true);
  };

  const handleNoteToggle = (note) => setFormData(prev => ({ ...prev, notes: prev.notes.includes(note) ? prev.notes.filter(n => n !== note) : [...prev.notes, note] }));
  const handleAddCustomNote = (e) => {
    e.preventDefault();
    if (!customNoteInput.trim()) return;
    const formatted = customNoteInput.trim().charAt(0).toUpperCase() + customNoteInput.trim().slice(1);
    if (!formData.notes.includes(formatted)) setFormData(prev => ({ ...prev, notes: [...prev.notes, formatted] }));
    setCustomNoteInput('');
  };
  const handleRemoveImage = (i) => setFormData(prev => ({ ...prev, image_urls: prev.image_urls.filter((_, idx) => idx !== i) }));

  const handleAddVariant = () => setFormData(prev => ({ ...prev, variants: [...prev.variants, { size: '', price: '', compare_at_price: '', stock_count: '', image_url: '' }] }));
  const handleRemoveVariant = (idx) => setFormData(prev => ({ ...prev, variants: prev.variants.filter((_, i) => i !== idx) }));
  const handleVariantChange = (idx, field, value) => setFormData(prev => ({ ...prev, variants: prev.variants.map((v, i) => i === idx ? { ...v, [field]: value } : v) }));

  const handleSave = async (e) => {
    e.preventDefault();
    if (formData.name.length > LIMITS.name)   { showToast('Error', `Name max ${LIMITS.name} chars.`,  'error'); return; }
    if (formData.brand.length > LIMITS.brand) { showToast('Error', `Brand max ${LIMITS.brand} chars.`, 'error'); return; }

    const validVariants = formData.variants.filter(v => v.size.trim() && v.price);
    if (validVariants.length === 0) { showToast('Error', 'You must add at least one valid size variant with a price.', 'error'); return; }

    for (const v of validVariants) {
      const price = parseFloat(v.price);
      const compareAt = v.compare_at_price ? parseFloat(v.compare_at_price) : null;
      if (isNaN(price) || price < 0) { showToast('Error', `Invalid price for size ${v.size}.`, 'error'); return; }
      if (compareAt !== null && price >= compareAt) { showToast('Invalid Price', `Original Price must be higher than Selling Price for size ${v.size}.`, 'error'); return; }
      if (v.stock_count !== '' && parseInt(v.stock_count) < 0) { showToast('Error', `Stock cannot be negative for size ${v.size}.`, 'error'); return; }
    }

    setIsSaving(true);
    const payload = {
      name: formData.name, brand: formData.brand, description: formData.description.trim(),
      gender: formData.gender, notes: formData.notes, image_urls: formData.image_urls, available: formData.available,
      variants: validVariants.map(v => ({
        ...(v.id ? { id: v.id } : {}), size: v.size.trim(), price: parseFloat(v.price),
        compare_at_price: v.compare_at_price ? parseFloat(v.compare_at_price) : null,
        stock_count: v.stock_count !== '' ? parseInt(v.stock_count) : null, image_url: v.image_url || null,
      })),
    };

    try {
      await saveProduct(payload, editingProduct?.id ?? null);
      showToast(editingProduct ? 'Updated' : 'Added', `${payload.name} saved.`);
      setIsModalOpen(false);
    } catch (err) { showToast('Error', err.message || 'Check browser console.', 'error'); } 
    finally { setIsSaving(false); }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try { await deleteProduct(id); showToast('Deleted', `${name} removed.`); } 
    catch (err) { showToast('Cannot Delete Product', `Something went wrong. Please try again.`, 'error'); }
  };

  const statusBadge = (available) => available
    ? <span className="flex items-center justify-end gap-1.5 text-green-400 text-xs font-bold"><CheckCircle size={14}/> Available</span>
    : <span className="flex items-center justify-end gap-1.5 text-red-400 text-xs font-bold"><XCircle size={14}/> Unavailable</span>;

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h3 className="text-2xl font-bold text-white">Inventory Management</h3>
          <p className="text-gray-400 text-sm mt-1">Add, edit, or set discounts for your catalog. <span className="ml-2 text-gold-400">({filteredProducts.length} total)</span></p>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input type="text" placeholder="Search perfumes..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-gold-400 transition-colors" />
          </div>
          <button onClick={() => handleOpenModal()} className="flex items-center gap-2 bg-gold-400 hover:bg-gold-300 text-black px-4 py-2 rounded-lg font-bold transition-colors shadow-lg flex-shrink-0"><Plus size={18} /> Add Perfume</button>
        </div>
      </div>

      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 mb-4 p-3 bg-gold-400/10 border border-gold-400/30 rounded-lg animate-fade-in flex-wrap">
          <span className="text-sm text-gold-400 font-bold">{selectedIds.size} selected</span>
          <div className="flex gap-2 ml-auto flex-wrap">
            <button onClick={() => handleBulkAvailability(true)} disabled={isBulkUpdating} className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20 rounded text-xs font-bold transition-colors disabled:opacity-50"><ToggleRight size={14} /> Mark Available</button>
            <button onClick={() => handleBulkAvailability(false)} disabled={isBulkUpdating} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded text-xs font-bold transition-colors disabled:opacity-50"><ToggleLeft size={14} /> Mark Unavailable</button>
            <button onClick={() => setSelectedIds(new Set())} className="text-xs text-gray-400 hover:text-white px-2">Clear</button>
          </div>
        </div>
      )}

      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden shadow-xl flex flex-col mb-6">
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-right border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-black/40 border-b border-white/10 text-xs uppercase tracking-widest text-gray-500">
                <th className="p-4 w-10 text-left"><input type="checkbox" checked={allOnPageSelected} onChange={toggleSelectAll} className="accent-gold-400 w-4 h-4 cursor-pointer" /></th>
                <th className="p-4 w-10 text-center"></th>
                <th className="p-4 font-medium text-left">Product</th>
                <th className="p-4 font-medium text-center">Variants</th>
                <th className={`p-4 font-medium cursor-pointer transition-colors ${sortConfig.key === 'date' ? 'text-gold-400 bg-gold-400/10' : 'hover:text-white'}`} onClick={() => handleSort('date')}>
                  <div className="flex items-center justify-end gap-1">Date Added <ArrowUpDown size={12} className={sortConfig.key === 'date' ? 'text-gold-400' : ''}/></div>
                </th>
                <th className={`p-4 font-medium cursor-pointer transition-colors ${sortConfig.key === 'stock' ? 'text-gold-400 bg-gold-400/10' : 'hover:text-white'}`} onClick={() => handleSort('stock')}>
                  <div className="flex items-center justify-end gap-1">Total Stock <ArrowUpDown size={12} className={sortConfig.key === 'stock' ? 'text-gold-400' : ''}/></div>
                </th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm text-gray-300">
              {isLoading ? (
                <tr><td colSpan="8" className="p-8 text-center"><Loader2 className="animate-spin text-gold-400 mx-auto" /></td></tr>
              ) : paginatedProducts.length === 0 ? (
                <tr><td colSpan="8" className="p-8 text-center text-gray-500">No products found.</td></tr>
              ) : paginatedProducts.map(product => {
                const variants = product.product_variants || [];
                const hasInfiniteStock = variants.some(v => v.stock_count === null || v.stock_count === '');
                const totalStock = hasInfiniteStock ? '∞' : variants.reduce((acc, v) => acc + (v.stock_count || 0), 0);
                const hasLowStock = variants.some(v => v.stock_count !== null && v.stock_count !== '' && v.stock_count <= lowStockThreshold);
                const isExpanded = expandedRows.has(product.id);
                
                return (
                  <React.Fragment key={product.id}>
                    <tr className={`hover:bg-white/5 transition-colors ${selectedIds.has(product.id) ? 'bg-gold-400/5' : ''}`}>
                      <td className="p-4 text-left"><input type="checkbox" checked={selectedIds.has(product.id)} onChange={() => toggleSelect(product.id)} className="accent-gold-400 w-4 h-4 cursor-pointer" /></td>
                      <td className="p-4 text-center">
                        <button onClick={() => toggleExpand(product.id)} className="p-1 hover:bg-white/10 rounded text-gray-400 hover:text-white transition-colors">
                          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                      </td>
                      <td className="p-4 flex items-center gap-3 text-left">
                        {product.image_urls?.length > 0
                          ? <img src={product.image_urls[0]} alt={product.name} className="w-10 h-10 object-cover rounded bg-white/10 border border-white/5" />
                          : <div className="w-10 h-10 rounded bg-white/5 border border-white/10 flex items-center justify-center text-gray-600 text-xs">No Img</div>}
                        <div>
                          <div className="flex items-center gap-2"><p className="font-bold text-white">{product.name}</p></div>
                          <p className="text-xs text-gray-500">{product.brand}</p>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <span className="text-gray-400 font-medium">{variants.length}</span>
                        {/* Noticeable Low Stock Warning on the Main Row */}
                        {hasLowStock && !hasInfiniteStock && (
                          <span className="ml-2 px-1.5 py-0.5 bg-red-500/20 border border-red-500/50 text-red-400 text-[10px] uppercase font-bold rounded animate-pulse">Low Stock</span>
                        )}
                      </td>
                      <td className={`p-4 text-right text-gray-500 text-xs ${sortConfig.key === 'date' ? 'bg-gold-400/5 text-gold-200' : ''}`}>
                        {new Date(product.created_at).toLocaleDateString()}
                      </td>
                      <td className={`p-4 text-right ${sortConfig.key === 'stock' ? 'bg-gold-400/5' : ''}`}>
                        <div className="flex items-center justify-end gap-2">
                          <span className="px-2 py-1 bg-white/10 rounded text-xs text-gray-300 font-bold">{totalStock}</span>
                        </div>
                      </td>
                      <td className="p-4 text-right">{statusBadge(product.available)}</td>
                      <td className="p-4 flex justify-end gap-2 text-right">
                        <button onClick={() => handleOpenModal(product)} className="p-2 bg-white/5 hover:bg-gold-400/20 hover:text-gold-400 rounded transition-colors" title="Edit"><Edit2 size={16} /></button>
                        <button onClick={() => handleDelete(product.id, product.name)} className="p-2 bg-white/5 hover:bg-red-500/20 hover:text-red-400 rounded transition-colors" title="Delete"><Trash2 size={16} /></button>
                      </td>
                    </tr>
                    
                    {/* EXPANDED VARIANTS SUB-TABLE */}
                    {isExpanded && (
                      <tr className="bg-black/20 border-b border-white/5">
                        <td colSpan="8" className="p-0">
                          <div className="px-14 py-4">
                            <table className="w-full text-left text-xs bg-white/5 rounded-lg overflow-hidden">
                              <thead className="bg-white/5 text-gray-400 uppercase tracking-wider">
                                <tr>
                                  <th className="px-4 py-2 font-medium">Variant Size</th>
                                  <th className="px-4 py-2 font-medium text-right">Selling Price</th>
                                  <th className="px-4 py-2 font-medium text-right">Orig. Price</th>
                                  <th className="px-4 py-2 font-medium text-right">Specific Stock</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-white/5">
                                {variants.map(v => {
                                  const isVariantLow = v.stock_count !== null && v.stock_count !== '' && v.stock_count <= lowStockThreshold;
                                  return (
                                    <tr key={v.id} className="hover:bg-white/5">
                                      <td className="px-4 py-2 font-medium text-gray-300">{v.size}</td>
                                      <td className="px-4 py-2 text-right text-gold-400">₱{v.price.toLocaleString()}</td>
                                      <td className="px-4 py-2 text-right text-gray-500">{v.compare_at_price ? `₱${v.compare_at_price.toLocaleString()}` : '-'}</td>
                                      <td className="px-4 py-2 text-right flex items-center justify-end gap-2">
                                        {isVariantLow && <AlertTriangle size={12} className="text-orange-400" />}
                                        <span className={isVariantLow ? 'text-orange-400 font-bold' : 'text-gray-400'}>
                                          {v.stock_count === null || v.stock_count === '' ? '∞' : v.stock_count}
                                        </span>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mb-8">
          <button disabled={activePage === 1} onClick={() => setActivePage(prev => prev - 1)} className="p-2 border border-white/10 rounded hover:border-gold-400 text-gray-400 hover:text-gold-400 disabled:opacity-30 transition-colors"><ChevronLeft size={20} /></button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(num => (
            <button key={num} onClick={() => setActivePage(num)} className={`w-10 h-10 rounded font-bold transition-all ${activePage === num ? 'bg-gold-400 text-black shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>{num}</button>
          ))}
          <button disabled={activePage === totalPages} onClick={() => setActivePage(prev => prev + 1)} className="p-2 border border-white/10 rounded hover:border-gold-400 text-gray-400 hover:text-gold-400 disabled:opacity-30 transition-colors"><ChevronRight size={20} /></button>
        </div>
      )}

      <ProductFormModal
        isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave}
        isSaving={isSaving} editingProduct={editingProduct} formData={formData} setFormData={setFormData}
        allDisplayBrands={allDisplayBrands} allDisplayNotes={allDisplayNotes} allDisplaySizes={allDisplaySizes} customNoteInput={customNoteInput} setCustomNoteInput={setCustomNoteInput}
        onAddCustomNote={handleAddCustomNote} onNoteToggle={handleNoteToggle} onRemoveImage={handleRemoveImage} showToast={showToast}
        onAIGenerate={() => showToast('AI Magic', 'AI Description Generation coming in V3! 🪄')}
        onAddVariant={handleAddVariant} onRemoveVariant={handleRemoveVariant} onVariantChange={handleVariantChange}
      />
    </div>
  );
};

export default AdminProducts;