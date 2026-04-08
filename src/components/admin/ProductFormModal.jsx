// src/components/admin/ProductFormModal.jsx
// Extracted from AdminProducts.jsx — the add/edit product modal.
// AdminProducts now just passes formData + handlers down; no business logic lives here.

import React from 'react';
import { Loader2, X, Trash2, Sparkles } from 'lucide-react';
import ImageUploader from '../common/ImageUploader';

const LIMITS = {
  name: 100,
  brand: 50,
  size: 20,
  description: 800,
};

const nearLimit = (val = '', max) => val.length >= max * 0.9;

const inputBorder = (value, max) =>
  nearLimit(value, max)
    ? 'border-red-500/60 focus:border-red-500'
    : 'border-white/10 focus:border-gold-400';

const Counter = ({ value = '', max }) => (
  <span className={`text-xs ${nearLimit(value, max) ? 'text-red-400' : 'text-gray-600'}`}>
    {value.length}/{max}
  </span>
);

const ProductFormModal = ({
  isOpen,
  onClose,
  onSave,
  isSaving,
  editingProduct,
  formData,
  setFormData,
  allDisplayNotes,
  customNoteInput,
  setCustomNoteInput,
  onAddCustomNote,
  onNoteToggle,
  onRemoveImage,
  showToast,
  onAIGenerate,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-rich-black border border-gold-400/30 rounded-2xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl overflow-y-auto max-h-[90vh] custom-scrollbar">

        {/* ── Header ── */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">
            {editingProduct ? 'Edit Perfume' : 'Add New Perfume'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={onSave} className="space-y-6">

          {/* ── Core fields ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div>
              <label className="flex justify-between text-xs text-gray-400 uppercase tracking-widest mb-1">
                <span>Perfume Name</span>
                <Counter value={formData.name} max={LIMITS.name} />
              </label>
              <input
                required
                type="text"
                maxLength={LIMITS.name}
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Baccarat Rouge 540"
                className={`w-full bg-black/50 border rounded-lg p-3 text-white outline-none transition-colors ${inputBorder(formData.name, LIMITS.name)}`}
              />
            </div>

            <div>
              <label className="flex justify-between text-xs text-gray-400 uppercase tracking-widest mb-1">
                <span>Brand</span>
                <Counter value={formData.brand} max={LIMITS.brand} />
              </label>
              <input
                required
                type="text"
                maxLength={LIMITS.brand}
                value={formData.brand}
                onChange={e => setFormData({ ...formData, brand: e.target.value })}
                placeholder="e.g. Maison Francis Kurkdjian"
                className={`w-full bg-black/50 border rounded-lg p-3 text-white outline-none transition-colors ${inputBorder(formData.brand, LIMITS.brand)}`}
              />
            </div>

            <div>
              <label className="block text-xs text-gold-400 font-bold uppercase tracking-widest mb-1">
                Selling Price (₱)
              </label>
              <input
                required
                type="number"
                min="0"
                value={formData.price}
                onChange={e => setFormData({ ...formData, price: e.target.value })}
                className="w-full bg-black/50 border border-gold-400/30 rounded-lg p-3 text-white focus:border-gold-400 outline-none transition-colors"
                placeholder="Final Price"
              />
            </div>

            <div>
              <label className="flex justify-between text-xs text-gray-400 uppercase tracking-widest mb-1">
                <span>Original Price (₱)</span>
                <span className="text-gray-600">(Optional Sale)</span>
              </label>
              <input
                type="number"
                min="0"
                value={formData.compare_at_price}
                onChange={e => setFormData({ ...formData, compare_at_price: e.target.value })}
                className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-gold-400 outline-none transition-colors"
                placeholder="Leave blank if not on sale"
              />
            </div>

            <div>
              <label className="flex justify-between text-xs text-gray-400 uppercase tracking-widest mb-1">
                <span>Stock Count</span>
                <span className="text-gray-600">(Optional)</span>
              </label>
              <input
                type="number"
                min="0"
                value={formData.stock_count}
                onChange={e => setFormData({ ...formData, stock_count: e.target.value })}
                className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-gold-400 outline-none transition-colors"
                placeholder="Leave blank if unlimited"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="flex justify-between text-xs text-gray-400 uppercase tracking-widest mb-1">
                  <span>Size</span>
                  <Counter value={formData.size} max={LIMITS.size} />
                </label>
                <input
                  required
                  type="text"
                  maxLength={LIMITS.size}
                  value={formData.size}
                  onChange={e => setFormData({ ...formData, size: e.target.value })}
                  className={`w-full bg-black/50 border rounded-lg p-3 text-white outline-none transition-colors ${inputBorder(formData.size, LIMITS.size)}`}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 uppercase tracking-widest mb-1">Gender</label>
                <select
                  value={formData.gender}
                  onChange={e => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-gold-400 outline-none transition-colors"
                >
                  <option>Unisex</option>
                  <option>Male</option>
                  <option>Female</option>
                </select>
              </div>
            </div>
          </div>

          {/* ── Description ── */}
          <div>
            <label className="flex justify-between items-end text-xs text-gray-400 uppercase tracking-widest mb-1">
              <span>
                Product Description{' '}
                <Counter value={formData.description} max={LIMITS.description} />
              </span>
              <button
                type="button"
                onClick={onAIGenerate}
                className="flex items-center gap-1.5 text-gold-400 hover:text-white transition-colors"
              >
                <Sparkles size={14} />
                <span className="normal-case">Generate with AI</span>
              </button>
            </label>
            <textarea
              required
              maxLength={LIMITS.description}
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className={`w-full bg-black/50 border rounded-lg p-3 text-white outline-none transition-colors resize-none h-24 custom-scrollbar ${inputBorder(formData.description, LIMITS.description)}`}
              placeholder="Describe the scent profile, inspiration, and feeling of this perfume..."
            />
          </div>

          {/* ── Fragrance Notes ── */}
          <div>
            <label className="block text-xs text-gray-400 uppercase tracking-widest mb-2">
              Fragrance Notes
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                placeholder="Type a new note (e.g. White Musk)..."
                value={customNoteInput}
                onChange={e => setCustomNoteInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') onAddCustomNote(e); }}
                className="flex-1 bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-gold-400 outline-none"
              />
              <button
                type="button"
                onClick={onAddCustomNote}
                className="px-4 py-2 bg-white/10 hover:bg-gold-400 text-gold-400 hover:text-black font-bold rounded-lg transition-colors text-sm"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2 p-4 bg-black/30 border border-white/5 rounded-lg max-h-48 overflow-y-auto custom-scrollbar">
              {allDisplayNotes.map(note => {
                const isSelected = formData.notes.includes(note);
                return (
                  <button
                    key={note}
                    type="button"
                    onClick={() => onNoteToggle(note)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 ${
                      isSelected
                        ? 'bg-gold-400 text-black border-gold-400 shadow-[0_0_10px_rgba(212,175,55,0.3)]'
                        : 'bg-black/50 text-gray-400 border-white/10 hover:border-gold-400/50 hover:text-white'
                    }`}
                  >
                    {note}
                  </button>
                );
              })}
              {allDisplayNotes.length === 0 && (
                <p className="text-gray-500 text-xs italic">No notes found. Add one above!</p>
              )}
            </div>
          </div>

          {/* ── Availability ── */}
          <div className="flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-lg">
            <input
              type="checkbox"
              id="available"
              checked={formData.available}
              onChange={e => setFormData({ ...formData, available: e.target.checked })}
              className="w-5 h-5 accent-gold-400 bg-transparent border-gray-600 rounded cursor-pointer"
            />
            <label htmlFor="available" className="text-sm font-bold text-white cursor-pointer select-none">
              Product is Available for Purchase
            </label>
          </div>

          {/* ── Images ── */}
          <div className="bg-black/30 p-4 border border-white/5 rounded-lg">
            <div className="flex justify-between items-end mb-4">
              <label className="block text-xs text-gray-400 uppercase tracking-widest">
                Product Images ({formData.image_urls.length}/4)
              </label>
              <span className="text-xs text-gray-500">First image is the main thumbnail</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {formData.image_urls.map((url, index) => (
                <div
                  key={index}
                  className="relative group aspect-square rounded-lg border-2 border-white/10 overflow-hidden bg-white/5"
                >
                  <img src={url} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => onRemoveImage(index)}
                      className="p-2 bg-red-500 text-white rounded-full hover:scale-110 transition-transform shadow-lg"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  {index === 0 && (
                    <span className="absolute top-2 left-2 bg-gold-400 text-black text-[10px] font-bold px-2 py-0.5 rounded shadow-lg">
                      MAIN
                    </span>
                  )}
                </div>
              ))}
              {formData.image_urls.length < 4 && (
                <div className="aspect-square">
                  <ImageUploader
                    onUploadSuccess={url =>
                      setFormData(prev => ({ ...prev, image_urls: [...prev.image_urls, url] }))
                    }
                    onError={err => { if (showToast) showToast('Error', err, 'error'); }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* ── Actions ── */}
          <div className="flex gap-4 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 py-3 bg-gold-400 hover:bg-gold-300 text-black font-bold rounded-lg transition-all shadow-lg flex justify-center items-center"
            >
              {isSaving ? <Loader2 className="animate-spin" size={18} /> : 'Save Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export { LIMITS };
export default ProductFormModal;