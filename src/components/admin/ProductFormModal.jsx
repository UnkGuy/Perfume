import React from 'react';
import { Loader2, X, Trash2, Sparkles, Plus } from 'lucide-react';
import ImageUploader from '../common/ImageUploader';

const LIMITS = { name: 100, brand: 50, description: 800 };
const nearLimit = (val = '', max) => val.length >= max * 0.9;
const inputBorder = (value, max) => nearLimit(value, max) ? 'border-red-500/60 focus:border-red-500' : 'border-white/10 focus:border-gold-400';
const Counter = ({ value = '', max }) => ( <span className={`text-xs ${nearLimit(value, max) ? 'text-red-400' : 'text-gray-600'}`}>{value.length}/{max}</span> );

const ProductFormModal = ({
  isOpen, onClose, onSave, isSaving, editingProduct, formData, setFormData,
  allDisplayNotes, allDisplaySizes, customNoteInput, setCustomNoteInput, onAddCustomNote,
  onNoteToggle, onRemoveImage, showToast, onAIGenerate,
  onAddVariant, onRemoveVariant, onVariantChange
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-rich-black border border-gold-400/30 rounded-2xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl overflow-y-auto max-h-[90vh] custom-scrollbar">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">{editingProduct ? 'Edit Perfume' : 'Add New Perfume'}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors"><X size={24} /></button>
        </div>

        <form onSubmit={onSave} className="space-y-6">
          {/* Core Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="flex justify-between text-xs text-gray-400 uppercase tracking-widest mb-1">
                <span>Perfume Name</span><Counter value={formData.name} max={LIMITS.name} />
              </label>
              <input required type="text" maxLength={LIMITS.name} value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Baccarat Rouge 540" className={`w-full bg-black/50 border rounded-lg p-3 text-white outline-none transition-colors ${inputBorder(formData.name, LIMITS.name)}`} />
            </div>
            <div>
              <label className="flex justify-between text-xs text-gray-400 uppercase tracking-widest mb-1">
                <span>Brand</span><Counter value={formData.brand} max={LIMITS.brand} />
              </label>
              <input required type="text" maxLength={LIMITS.brand} value={formData.brand} onChange={e => setFormData({ ...formData, brand: e.target.value })} placeholder="e.g. Maison Francis Kurkdjian" className={`w-full bg-black/50 border rounded-lg p-3 text-white outline-none transition-colors ${inputBorder(formData.brand, LIMITS.brand)}`} />
            </div>
            <div>
              <label className="block text-xs text-gray-400 uppercase tracking-widest mb-1">Gender Focus</label>
              <select value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value })} className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-gold-400 outline-none transition-colors">
                <option>Unisex</option><option>Male</option><option>Female</option>
              </select>
            </div>
          </div>

          {/* Size Variants (Mandatory Now) */}
          <div className="bg-black/30 p-4 border border-gold-400/30 rounded-lg relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-gold-400"></div>
            <div className="flex justify-between items-center mb-4 pl-2">
              <div>
                <label className="block text-sm font-bold text-white uppercase tracking-widest">Pricing & Sizes</label>
                <p className="text-[10px] text-gray-400 mt-0.5">Define your available sizes, inventory, and cost here.</p>
              </div>
              <button type="button" onClick={onAddVariant} className="flex items-center gap-1.5 px-3 py-1.5 bg-gold-400/10 hover:bg-gold-400/20 text-gold-400 border border-gold-400/30 rounded text-xs font-bold transition-colors">
                <Plus size={13} /> Add Size
              </button>
            </div>

            <div className="space-y-3 pl-2">
              {formData.variants.map((variant, idx) => (
                <div key={idx} className="bg-black/50 border border-white/10 rounded-lg p-3 relative group">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                    <div>
                      <label className="block text-[10px] text-gray-500 uppercase tracking-wider mb-1">Size (Add unit e.g. ml) *</label>
                      <input list={`size-options-${idx}`} required type="text" value={variant.size} onChange={e => onVariantChange(idx, 'size', e.target.value)} placeholder="e.g. 50ml" className="w-full bg-black/60 border border-white/10 rounded px-2 py-1.5 text-xs text-white focus:border-gold-400 outline-none" />
                      <datalist id={`size-options-${idx}`}>
                        {allDisplaySizes && allDisplaySizes.map(s => <option key={s} value={s} />)}
                      </datalist>
                    </div>
                    <div>
                      <label className="block text-[10px] text-gray-500 uppercase tracking-wider mb-1">Selling Price (₱) *</label>
                      <input required type="number" min="0" value={variant.price} onChange={e => onVariantChange(idx, 'price', e.target.value)} placeholder="1500" className="w-full bg-black/60 border border-gold-400/30 rounded px-2 py-1.5 text-xs text-white focus:border-gold-400 outline-none" />
                    </div>
                    <div>
                      <label className="block text-[10px] text-gray-500 uppercase tracking-wider mb-1">Orig. Price (₱)</label>
                      <input type="number" min="0" value={variant.compare_at_price} onChange={e => onVariantChange(idx, 'compare_at_price', e.target.value)} placeholder="Optional Sale" className="w-full bg-black/60 border border-white/10 rounded px-2 py-1.5 text-xs text-white focus:border-gold-400 outline-none" />
                    </div>
                    <div>
                      <label className="block text-[10px] text-gray-500 uppercase tracking-wider mb-1">Stock</label>
                      <input type="number" min="0" value={variant.stock_count} onChange={e => onVariantChange(idx, 'stock_count', e.target.value)} placeholder="∞ if blank" className="w-full bg-black/60 border border-white/10 rounded px-2 py-1.5 text-xs text-white focus:border-gold-400 outline-none" />
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-gray-500 uppercase tracking-wider">Custom image:</span>
                    {variant.image_url ? (
                      <div className="flex items-center gap-2">
                        <div className="relative w-10 h-10 rounded border border-white/10 overflow-hidden group/img cursor-pointer flex-shrink-0" onClick={() => onVariantChange(idx, 'image_url', '')}>
                          <img src={variant.image_url} alt="" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/70 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity"><X size={10} className="text-red-400" /></div>
                        </div>
                        <span className="text-[10px] text-gray-500">Click image to remove</span>
                      </div>
                    ) : (
                      <div className="flex-1 max-w-xs"><ImageUploader onUploadSuccess={url => onVariantChange(idx, 'image_url', url)} onError={err => { if (showToast) showToast('Error', err, 'error'); }} /></div>
                    )}
                    {formData.variants.length > 1 && (
                      <button type="button" onClick={() => onRemoveVariant(idx)} className="ml-auto p-1.5 text-gray-600 hover:text-red-400 hover:bg-red-400/10 rounded transition-colors flex-shrink-0" title="Remove size"><Trash2 size={14} /></button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Description & Notes */}
          <div>
            <label className="flex justify-between items-end text-xs text-gray-400 uppercase tracking-widest mb-1">
              <span>Description <Counter value={formData.description} max={LIMITS.description} /></span>
            </label>
            <textarea required maxLength={LIMITS.description} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className={`w-full bg-black/50 border rounded-lg p-3 text-white outline-none transition-colors resize-none h-24 custom-scrollbar ${inputBorder(formData.description, LIMITS.description)}`} placeholder="Describe the scent profile..." />
          </div>

          <div>
            <label className="block text-xs text-gray-400 uppercase tracking-widest mb-2">Fragrance Notes</label>
            <div className="flex gap-2 mb-3">
              <input type="text" placeholder="Type a new note..." value={customNoteInput} onChange={e => setCustomNoteInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') onAddCustomNote(e); }} className="flex-1 bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-gold-400 outline-none" />
              <button type="button" onClick={onAddCustomNote} className="px-4 py-2 bg-white/10 hover:bg-gold-400 text-gold-400 hover:text-black font-bold rounded-lg transition-colors text-sm">Add</button>
            </div>
            <div className="flex flex-wrap gap-2 p-4 bg-black/30 border border-white/5 rounded-lg max-h-48 overflow-y-auto custom-scrollbar">
              {allDisplayNotes.map(note => (
                <button key={note} type="button" onClick={() => onNoteToggle(note)} className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 ${formData.notes.includes(note) ? 'bg-gold-400 text-black border-gold-400' : 'bg-black/50 text-gray-400 border-white/10 hover:border-gold-400/50'}`}>{note}</button>
              ))}
            </div>
          </div>

          {/* Images */}
          <div className="bg-black/30 p-4 border border-white/5 rounded-lg">
            <div className="flex justify-between items-end mb-4">
              <label className="block text-xs text-gray-400 uppercase tracking-widest">Base Product Images</label>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {formData.image_urls.map((url, index) => (
                <div key={index} className="relative group aspect-square rounded-lg border-2 border-white/10 overflow-hidden bg-white/5">
                  <img src={url} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button type="button" onClick={() => onRemoveImage(index)} className="p-2 bg-red-500 text-white rounded-full hover:scale-110"><Trash2 size={16} /></button>
                  </div>
                </div>
              ))}
              {formData.image_urls.length < 5 && <div className="aspect-square"><ImageUploader onUploadSuccess={url => setFormData(prev => ({ ...prev, image_urls: [...prev.image_urls, url] }))} /></div>}
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-lg">
            <input type="checkbox" id="available" checked={formData.available} onChange={e => setFormData({ ...formData, available: e.target.checked })} className="w-5 h-5 accent-gold-400 bg-transparent border-gray-600 rounded cursor-pointer" />
            <label htmlFor="available" className="text-sm font-bold text-white cursor-pointer select-none">Product is Available for Purchase</label>
          </div>

          <div className="flex gap-4 pt-4 border-t border-white/10">
            <button type="button" onClick={onClose} className="flex-1 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors font-medium">Cancel</button>
            <button type="submit" disabled={isSaving} className="flex-1 py-3 bg-gold-400 hover:bg-gold-300 text-black font-bold rounded-lg shadow-lg flex justify-center items-center">{isSaving ? <Loader2 className="animate-spin" size={18} /> : 'Save Product'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export { LIMITS };
export default ProductFormModal;