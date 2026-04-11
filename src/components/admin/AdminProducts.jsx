import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Loader2, CheckCircle, XCircle, Tag, Search, ChevronLeft, ChevronRight, ToggleLeft, ToggleRight } from 'lucide-react';
import { useProducts } from '../../hooks/useAdminProducts';
import { useShop } from '../../contexts/ShopContext';
import { supabase } from '../../services/supabase';
import ProductFormModal, { LIMITS } from './ProductFormModal';

const ITEMS_PER_PAGE = 10;
const EMPTY_FORM = {
  name: '', brand: '', description: '', price: '', compare_at_price: '',
  size: '50ml', gender: 'Unisex', stock_count: '', notes: [], image_urls: [], available: true,
};

const AdminProducts = () => {
  const { showToast } = useShop();
  const { products, isLoading, saveProduct, deleteProduct } = useProducts(showToast);

  const [isModalOpen, setIsModalOpen]       = useState(false);
  const [editingProduct, setEditingProduct]  = useState(null);
  const [isSaving, setIsSaving]             = useState(false);
  const [searchQuery, setSearchQuery]        = useState('');
  const [activePage, setActivePage]          = useState(1);
  const [formData, setFormData]             = useState(EMPTY_FORM);
  const [customNoteInput, setCustomNoteInput] = useState('');
  const [selectedIds, setSelectedIds]        = useState(new Set());
  const [isBulkUpdating, setIsBulkUpdating]  = useState(false);

  const dynamicNotes    = [...new Set(products.flatMap(p => p.notes || []).filter(Boolean))];
  const allDisplayNotes = [...new Set([...dynamicNotes, ...formData.notes])].sort();

  useEffect(() => { setActivePage(1); setSelectedIds(new Set()); }, [searchQuery]);

  const filteredProducts  = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.brand.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const totalPages        = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice(
    (activePage - 1) * ITEMS_PER_PAGE, activePage * ITEMS_PER_PAGE
  );

  useEffect(() => {
    if (activePage > totalPages && totalPages > 0) setActivePage(totalPages);
  }, [filteredProducts.length, activePage, totalPages]);

  // ── Checkbox helpers ────────────────────────────────────────────────────────
  const toggleSelect    = (id) => setSelectedIds(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });
  const allOnPageSelected = paginatedProducts.length > 0 &&
    paginatedProducts.every(p => selectedIds.has(p.id));
  const toggleSelectAll = () =>
    setSelectedIds(allOnPageSelected ? new Set() : new Set(paginatedProducts.map(p => p.id)));

  // ── Bulk availability ───────────────────────────────────────────────────────
  const handleBulkAvailability = async (makeAvailable) => {
    if (selectedIds.size === 0) return;
    setIsBulkUpdating(true);
    try {
      const { error } = await supabase
        .from('products')
        .update({ available: makeAvailable })
        .in('id', [...selectedIds]);
      if (error) throw error;
      showToast('Updated', `${selectedIds.size} product(s) marked ${makeAvailable ? 'available' : 'unavailable'}.`);
      setSelectedIds(new Set());
      // React Query will refetch on next focus; force it now via a quick invalidation
      // The hook uses queryKey ['products'] — we trigger a custom event the hook can optionally listen to
      window.dispatchEvent(new CustomEvent('klscents:products-updated'));
    } catch (err) {
      showToast('Error', err.message || 'Bulk update failed.', 'error');
    } finally {
      setIsBulkUpdating(false);
    }
  };

  // ── Modal helpers ────────────────────────────────────────────────────────────
  const handleOpenModal = (product = null) => {
    setEditingProduct(product);
    setFormData(product ? {
      name: product.name, brand: product.brand, description: product.description || '',
      price: product.price, compare_at_price: product.compare_at_price || '',
      size: product.size, gender: product.gender || 'Unisex',
      stock_count: product.stock_count ?? '', notes: product.notes || [],
      image_urls: product.image_urls || [], available: product.available !== false,
    } : EMPTY_FORM);
    setIsModalOpen(true);
  };

  const handleNoteToggle = (note) =>
    setFormData(prev => ({
      ...prev,
      notes: prev.notes.includes(note) ? prev.notes.filter(n => n !== note) : [...prev.notes, note],
    }));

  const handleAddCustomNote = (e) => {
    e.preventDefault();
    if (!customNoteInput.trim()) return;
    const formatted = customNoteInput.trim().charAt(0).toUpperCase() + customNoteInput.trim().slice(1);
    if (!formData.notes.includes(formatted))
      setFormData(prev => ({ ...prev, notes: [...prev.notes, formatted] }));
    setCustomNoteInput('');
  };

  const handleRemoveImage = (i) =>
    setFormData(prev => ({ ...prev, image_urls: prev.image_urls.filter((_, idx) => idx !== i) }));

  // ── Save ─────────────────────────────────────────────────────────────────────
  const handleSave = async (e) => {
    e.preventDefault();
    if (formData.name.length > LIMITS.name)   { showToast('Error', `Name max ${LIMITS.name} chars.`,  'error'); return; }
    if (formData.brand.length > LIMITS.brand) { showToast('Error', `Brand max ${LIMITS.brand} chars.`, 'error'); return; }
    if (formData.size.length > LIMITS.size)   { showToast('Error', `Size max ${LIMITS.size} chars.`,   'error'); return; }

    const price = parseFloat(formData.price);
    const compareAt = formData.compare_at_price ? parseFloat(formData.compare_at_price) : null;
    if (isNaN(price) || price < 0)                         { showToast('Error', 'Price must be a positive number.', 'error'); return; }
    if (compareAt !== null && compareAt <= price)           { showToast('Error', 'Original price must be higher than the selling price.', 'error'); return; }
    if (formData.stock_count !== '' && parseInt(formData.stock_count) < 0) { showToast('Error', 'Stock count cannot be negative.', 'error'); return; }

    setIsSaving(true);
    const payload = {
      ...formData,
      description: formData.description.trim(),
      price,
      compare_at_price: compareAt,
      stock_count: formData.stock_count !== '' ? parseInt(formData.stock_count) : null,
    };
    try {
      await saveProduct(payload, editingProduct?.id ?? null);
      showToast(editingProduct ? 'Updated' : 'Added', `${payload.name} saved.`);
      setIsModalOpen(false);
    } catch (err) {
      showToast('Error', err.message || 'Check browser console.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // ── Delete ───────────────────────────────────────────────────────────────────
  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try { await deleteProduct(id); showToast('Deleted', `${name} removed.`); }
    catch { showToast('Error', 'Failed to delete product.', 'error'); }
  };

  // ── Helpers ───────────────────────────────────────────────────────────────────
  const statusBadge = (available) => available
    ? <span className="flex items-center gap-1.5 text-green-400 text-xs font-bold"><CheckCircle size={14}/> Available</span>
    : <span className="flex items-center gap-1.5 text-red-400 text-xs font-bold"><XCircle size={14}/> Unavailable</span>;

  return (
    <div className="animate-fade-in">
      {/* ── Header ── */}
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
            <input type="text" placeholder="Search perfumes..." value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-gold-400 transition-colors"
            />
          </div>
          <button onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-gold-400 hover:bg-gold-300 text-black px-4 py-2 rounded-lg font-bold transition-colors shadow-lg flex-shrink-0"
          >
            <Plus size={18} /> Add Perfume
          </button>
        </div>
      </div>

      {/* ── Bulk toolbar ── */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 mb-4 p-3 bg-gold-400/10 border border-gold-400/30 rounded-lg animate-fade-in flex-wrap">
          <span className="text-sm text-gold-400 font-bold">{selectedIds.size} selected</span>
          <div className="flex gap-2 ml-auto flex-wrap">
            <button onClick={() => handleBulkAvailability(true)} disabled={isBulkUpdating}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20 rounded text-xs font-bold transition-colors disabled:opacity-50"
            ><ToggleRight size={14} /> Mark Available</button>
            <button onClick={() => handleBulkAvailability(false)} disabled={isBulkUpdating}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded text-xs font-bold transition-colors disabled:opacity-50"
            ><ToggleLeft size={14} /> Mark Unavailable</button>
            <button onClick={() => setSelectedIds(new Set())} className="text-xs text-gray-400 hover:text-white px-2">
              Clear
            </button>
          </div>
        </div>
      )}

      {/* ── Table ── */}
      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden shadow-xl flex flex-col">

        {/* Desktop */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-black/40 border-b border-white/10 text-xs uppercase tracking-widest text-gray-500">
                <th className="p-4 w-10">
                  <input type="checkbox" checked={allOnPageSelected} onChange={toggleSelectAll}
                    className="accent-gold-400 w-4 h-4 cursor-pointer" />
                </th>
                <th className="p-4 font-medium">Product</th>
                <th className="p-4 font-medium">Price</th>
                <th className="p-4 font-medium">Stock</th>
                <th className="p-4 font-medium">Gender</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm text-gray-300">
              {isLoading ? (
                <tr><td colSpan="7" className="p-8 text-center"><Loader2 className="animate-spin text-gold-400 mx-auto" /></td></tr>
              ) : paginatedProducts.length === 0 ? (
                <tr><td colSpan="7" className="p-8 text-center text-gray-500">No products found{searchQuery ? ` for "${searchQuery}"` : ''}.</td></tr>
              ) : paginatedProducts.map(product => {
                const isDiscounted = product.compare_at_price && product.compare_at_price > product.price;
                return (
                  <tr key={product.id} className={`hover:bg-white/5 transition-colors ${selectedIds.has(product.id) ? 'bg-gold-400/5' : ''}`}>
                    <td className="p-4">
                      <input type="checkbox" checked={selectedIds.has(product.id)} onChange={() => toggleSelect(product.id)}
                        className="accent-gold-400 w-4 h-4 cursor-pointer" />
                    </td>
                    <td className="p-4 flex items-center gap-3">
                      {product.image_urls?.length > 0
                        ? <img src={product.image_urls[0]} alt={product.name} className="w-10 h-10 object-cover rounded bg-white/10 border border-white/5" />
                        : <div className="w-10 h-10 rounded bg-white/5 border border-white/10 flex items-center justify-center text-gray-600 text-xs">No Img</div>}
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-white">{product.name}</p>
                          {isDiscounted && <Tag size={12} className="text-green-400" title="On Sale" />}
                        </div>
                        <p className="text-xs text-gray-500">{product.brand} · {product.size}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      {isDiscounted ? (
                        <div><span className="text-green-400 font-bold block">₱{product.price}</span><span className="text-xs text-gray-500 line-through">₱{product.compare_at_price}</span></div>
                      ) : <span className="text-gold-400 font-medium">₱{product.price}</span>}
                    </td>
                    <td className="p-4">
                      {product.stock_count != null ? <span>{product.stock_count} units</span> : <span className="text-gray-500 italic">Unlimited</span>}
                    </td>
                    <td className="p-4"><span className="px-2 py-1 bg-white/10 rounded text-xs text-gray-300">{product.gender}</span></td>
                    <td className="p-4">{statusBadge(product.available)}</td>
                    <td className="p-4 flex justify-end gap-2">
                      <button onClick={() => handleOpenModal(product)} className="p-2 bg-white/5 hover:bg-gold-400/20 hover:text-gold-400 rounded transition-colors" title="Edit"><Edit2 size={16} /></button>
                      <button onClick={() => handleDelete(product.id, product.name)} className="p-2 bg-white/5 hover:bg-red-500/20 hover:text-red-400 rounded transition-colors" title="Delete"><Trash2 size={16} /></button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile */}
        <div className="md:hidden flex flex-col divide-y divide-white/10">
          {isLoading ? (
            <div className="p-8 text-center"><Loader2 className="animate-spin text-gold-400 mx-auto" /></div>
          ) : paginatedProducts.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No products found.</div>
          ) : paginatedProducts.map(product => {
            const isDiscounted = product.compare_at_price && product.compare_at_price > product.price;
            return (
              <div key={product.id} className={`p-4 flex flex-col gap-3 ${selectedIds.has(product.id) ? 'bg-gold-400/5' : ''}`}>
                <div className="flex items-start gap-3">
                  <input type="checkbox" checked={selectedIds.has(product.id)} onChange={() => toggleSelect(product.id)}
                    className="accent-gold-400 w-4 h-4 cursor-pointer mt-1 flex-shrink-0" />
                  <div className="flex flex-1 justify-between items-start gap-3 overflow-hidden">
                    <div className="flex items-center gap-3 overflow-hidden">
                      {product.image_urls?.length > 0
                        ? <img src={product.image_urls[0]} alt={product.name} className="w-12 h-12 object-cover rounded-lg flex-shrink-0" />
                        : <div className="w-12 h-12 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[10px] text-gray-600 flex-shrink-0">No Img</div>}
                      <div className="overflow-hidden">
                        <h4 className="font-bold text-white text-sm truncate">{product.name}</h4>
                        <p className="text-xs text-gray-500 truncate">{product.brand} · {product.size}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button onClick={() => handleOpenModal(product)} className="p-2 bg-white/10 hover:bg-gold-400 hover:text-black rounded transition-colors"><Edit2 size={14} /></button>
                      <button onClick={() => handleDelete(product.id, product.name)} className="p-2 bg-white/10 hover:bg-red-500 hover:text-white rounded transition-colors"><Trash2 size={14} /></button>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 bg-black/40 p-3 rounded-lg border border-white/5 text-sm ml-7">
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-0.5">Price</p>
                    {isDiscounted
                      ? <><span className="text-green-400 font-bold">₱{product.price}</span> <span className="text-[10px] text-gray-600 line-through">₱{product.compare_at_price}</span></>
                      : <span className="text-gold-400 font-bold">₱{product.price}</span>}
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-0.5">Stock</p>
                    <span className="text-gray-300">{product.stock_count != null ? `${product.stock_count} units` : 'Unlimited'}</span>
                  </div>
                  <div className="col-span-2">{statusBadge(product.available)}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination */}
        {!isLoading && totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 p-4 border-t border-white/10 bg-black/20">
            <button disabled={activePage === 1} onClick={() => setActivePage(p => p - 1)}
              className="p-2 border border-white/10 rounded hover:border-gold-400 text-gray-400 hover:text-gold-400 disabled:opacity-30 transition-colors"
            ><ChevronLeft size={18} /></button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(num => (
              <button key={num} onClick={() => setActivePage(num)}
                className={`w-8 h-8 rounded text-sm font-bold transition-all ${activePage === num ? 'bg-gold-400 text-black' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
              >{num}</button>
            ))}
            <button disabled={activePage === totalPages} onClick={() => setActivePage(p => p + 1)}
              className="p-2 border border-white/10 rounded hover:border-gold-400 text-gray-400 hover:text-gold-400 disabled:opacity-30 transition-colors"
            ><ChevronRight size={18} /></button>
          </div>
        )}
      </div>

      {/* Modal */}
      <ProductFormModal
        isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave}
        isSaving={isSaving} editingProduct={editingProduct}
        formData={formData} setFormData={setFormData}
        allDisplayNotes={allDisplayNotes}
        customNoteInput={customNoteInput} setCustomNoteInput={setCustomNoteInput}
        onAddCustomNote={handleAddCustomNote} onNoteToggle={handleNoteToggle}
        onRemoveImage={handleRemoveImage} showToast={showToast}
        onAIGenerate={() => showToast('AI Magic', 'AI Description Generation coming in V3! 🪄')}
      />
    </div>
  );
};

export default AdminProducts;