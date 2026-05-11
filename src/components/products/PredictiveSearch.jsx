import React, { useState, useEffect } from 'react'; 
import { Save, Loader2, ToggleLeft, ToggleRight, Plus, Trash2, Store, CreditCard, Truck, Settings, CheckCircle, Image as ImageIcon, Box, FileText, Star, Search, X } from 'lucide-react'; 
import { saveSettingsAPI } from '../../services/settingsApi'; 
import { logAdminActionAPI } from '../../services/logApi'; 
import { useSettings } from '../../contexts/SettingsContext'; 
import { useAuth } from '../../contexts/AuthContext'; 
import { useShop } from '../../contexts/ShopContext';
import { useStoreProducts } from '../../hooks/useStoreProducts';
import ImageUploader from '../common/ImageUploader';

const FALLBACK_IMAGE = 'https://zmewzupojoufgryrskrs.supabase.co/storage/v1/object/public/product-images/test.jpg';

const Toggle = ({ checked, onChange, label, description }) => (
  <div className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
    <div>
      <div className="text-sm font-bold text-white">{label}</div>
      {description && <div className="text-xs text-gray-500 mt-1">{description}</div>}
    </div>
    <button type="button" onClick={() => onChange(!checked)} className={`flex-shrink-0 transition-colors ${checked ? 'text-gold-400' : 'text-gray-600 hover:text-gray-400'}`} > 
      {checked ? <ToggleRight size={32} /> : <ToggleLeft size={32} />} 
    </button>
  </div>
);

const ListEditor = ({ items, onChange, placeholder, label }) => { 
  const [inputVal, setInputVal] = useState('');
  const handleAdd = () => { 
    const trimmed = inputVal.trim(); 
    if (!trimmed || items.includes(trimmed)) return; 
    onChange([...items, trimmed]); 
    setInputVal(''); 
  };
  const handleRemove = (item) => { 
    if (items.length <= 1) return; 
    onChange(items.filter(i => i !== item)); 
  };
  return (
    <div className="mb-4">
      <label className="block text-xs text-gray-400 uppercase tracking-widest mb-2">{label}</label>
      <div className="flex gap-2 mb-3">
        <input type="text" value={inputVal} onChange={e => setInputVal(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAdd())} placeholder={placeholder} className="flex-1 bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-gold-400 transition-colors" />
        <button type="button" onClick={handleAdd} className="bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-lg transition-colors"><Plus size={18} /></button>
      </div>
      <div className="flex flex-wrap gap-2">
        {items.map(item => ( 
          <div key={item} className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg pl-3 pr-2 py-1 text-sm text-gray-300">
            <span className="truncate max-w-[200px]">{item}</span>
            <button type="button" onClick={() => handleRemove(item)} disabled={items.length <= 1} className="text-gray-500 hover:text-red-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed" title={items.length <= 1 ? 'Must keep at least one option' : 'Remove'} >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  ); 
};

const Section = ({ icon, title, description, children }) => (
  <div className="bg-white/5 border border-white/10 rounded-xl p-5 sm:p-6 mb-6">
    <div className="flex items-center gap-3 mb-4">
      <div className="p-2 bg-gold-400/10 text-gold-400 rounded-lg">{icon}</div>
      <div>
        <h4 className="text-lg font-bold text-white">{title}</h4>
        {description && <p className="text-xs text-gray-400 mt-0.5">{description}</p>}
      </div>
    </div>
    {children}
  </div>
);

const AdminSettings = () => { 
  const { settings, setSettings } = useSettings(); 
  const { user } = useAuth(); 
  const { showToast } = useShop();
  const { products } = useStoreProducts();

  const [draft, setDraft] = useState(null); 
  const [isSaving, setIsSaving] = useState(false); 
  const [savedAt, setSavedAt] = useState(null);

  // Predictive search states
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => { setDraft(JSON.parse(JSON.stringify(settings))); }, [settings]);

  if (!draft) return <div className="p-8 text-center text-gray-500"><Loader2 className="animate-spin mx-auto" /></div>;

  const setFeature = (key, val) => setDraft(d => ({ ...d, features: { ...d.features, [key]: val } })); 
  const setCheckout = (key, val) => setDraft(d => ({ ...d, checkout: { ...d.checkout, [key]: val } })); 
  const setStore = (key, val) => setDraft(d => ({ ...d, storeInfo: { ...d.storeInfo, [key]: val } }));
  const setInventory = (key, val) => setDraft(d => ({ ...d, inventory: { ...d.inventory, [key]: val } }));
  const setLegal = (key, val) => setDraft(d => ({ ...d, legal: { ...d.legal, [key]: val } }));

  const addHeroImage = (url) => setDraft(d => {
    const current = d.welcomeImages?.hero || [];
    if (current.length >= 10) {
      showToast('Limit Reached', 'You can only upload up to 10 hero images.', 'error');
      return d;
    }
    return { ...d, welcomeImages: { ...d.welcomeImages, hero: [...current, url] } };
  });
  const removeHeroImage = (idx) => setDraft(d => ({ ...d, welcomeImages: { ...d.welcomeImages, hero: d.welcomeImages.hero.filter((_, i) => i !== idx) } }));
  
  const addSecondaryImage = (url) => setDraft(d => {
    const current = d.welcomeImages?.secondary || [];
    if (current.length >= 10) {
      showToast('Limit Reached', 'You can only upload up to 10 secondary images.', 'error');
      return d;
    }
    return { ...d, welcomeImages: { ...d.welcomeImages, secondary: [...current, url] } };
  });
  const removeSecondaryImage = (idx) => setDraft(d => ({ ...d, welcomeImages: { ...d.welcomeImages, secondary: d.welcomeImages.secondary.filter((_, i) => i !== idx) } }));

  const handleAddFeatured = (id) => {
    const current = draft.featuredProducts || [];
    if (!current.includes(id)) {
      setDraft(d => ({ ...d, featuredProducts: [...current, id] }));
    }
  };

  const handleRemoveFeatured = (id) => {
    setDraft(d => ({ ...d, featuredProducts: (d.featuredProducts || []).filter(pid => pid !== id) }));
  };

  const handleSave = async () => { 
    setIsSaving(true); 
    try { 
      await saveSettingsAPI(draft); 
      setSettings(draft); 
      setSavedAt(new Date()); 
      showToast('Settings Saved', 'Website configuration has been updated.'); 
      logAdminActionAPI(user?.email, 'Updated Website Settings', 'site_settings'); 
    } catch (err) { 
      showToast('Error', err.message || 'Could not save settings.', 'error'); 
    } finally { 
      setIsSaving(false); 
    } 
  };

  const handleReset = () => { 
    setDraft(JSON.parse(JSON.stringify(settings))); 
    showToast('Reset', 'Draft reverted to last saved state.', 'info'); 
  };

  const hasChanges = JSON.stringify(draft) !== JSON.stringify(settings);

  // Filter logic for predictive search
  const searchSuggestions = (products || [])
    .filter(p => p.available && !(draft.featuredProducts || []).includes(p.id))
    .filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.brand.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-bold text-white mb-1">Website Settings</h3>
          <p className="text-gray-400 text-sm">Configure features, payments, and store behaviour.</p>
        </div>
        <div className="flex items-center gap-3">
          {savedAt && !hasChanges && (
            <span className="hidden sm:flex items-center gap-1.5 text-xs text-green-400">
              <CheckCircle size={14} /> Saved {savedAt.toLocaleTimeString()}
            </span>
          )}
          {hasChanges && (
            <button
              onClick={handleReset}
              className="px-4 py-2 text-sm text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
            >
              Discard
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={isSaving || !hasChanges}
            className="flex items-center gap-2 px-5 py-2.5 bg-gold-400 hover:bg-gold-300 text-black font-bold rounded-lg shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving
              ? <><Loader2 size={16} className="animate-spin" /> Saving…</>
              : <><Save size={16} /> Save Changes</>}
          </button>
        </div>
      </div>

      {hasChanges && (
        <div className="flex items-center gap-3 px-4 py-3 bg-gold-400/10 border border-gold-400/30 rounded-lg text-sm text-gold-400 animate-fade-in">
          <Settings size={16} className="flex-shrink-0" />
          You have unsaved changes. Click <strong>Save Changes</strong> to apply them.
        </div>
      )}

      {/* ── Welcome Page Featured Products ── */}
      <Section icon={<Star size={16} />} title="Curated Works (Welcome Page)" description="Select which products appear in the oversized carousel on the Welcome Page.">
        <div className="space-y-6">
          
          {/* Predictive Search Input */}
          <div className="relative z-30">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-gold-400 transition-colors" size={16} />
              {searchQuery && (
                <button 
                  onClick={() => { setSearchQuery(''); setShowSuggestions(false); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                >
                  <X size={14} />
                </button>
              )}
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                placeholder="Search products by name or brand to feature..."
                className="w-full bg-black/50 border border-white/10 rounded-lg py-3 pl-10 pr-10 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gold-400 transition-colors"
              />
            </div>

            {/* Suggestions Dropdown */}
            {showSuggestions && searchQuery && searchSuggestions.length > 0 && (
              <div className="absolute top-full left-0 w-full mt-2 bg-rich-black border border-white/10 rounded-lg shadow-2xl overflow-hidden animate-slide-in">
                {searchSuggestions.map(suggestion => {
                  const displayPrice = suggestion.product_variants?.length > 0 
                    ? Math.min(...suggestion.product_variants.map(v => v.price)) 
                    : suggestion.price;

                  return (
                    <div 
                      key={suggestion.id}
                      onClick={() => { 
                        handleAddFeatured(suggestion.id); 
                        setSearchQuery(''); 
                        setShowSuggestions(false); 
                      }}
                      className="px-4 py-3 hover:bg-white/5 cursor-pointer flex justify-between items-center gap-4 border-b border-white/5 last:border-0 transition-colors"
                    >
                      <div className="min-w-0 flex-1">
                        <span className="font-bold text-white text-sm block truncate">{suggestion.name}</span>
                        <span className="text-xs text-gray-400 block truncate">{suggestion.brand}</span>
                      </div>
                      <span className="text-gold-400 font-medium text-sm whitespace-nowrap">₱{displayPrice}</span>
                    </div>
                  );
                })}
              </div>
            )}
            
            {showSuggestions && searchQuery && searchSuggestions.length === 0 && (
              <div className="absolute top-full left-0 w-full mt-2 bg-rich-black border border-white/10 rounded-lg shadow-xl p-4 text-center text-sm text-gray-500">
                No matching products found, or product is already featured.
              </div>
            )}
          </div>

          {/* Selected Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
            {(draft.featuredProducts || []).map(pid => {
              const p = products?.find(prod => prod.id === pid);
              if (!p) return null;
              const imgUrl = p.image_urls?.[0] || FALLBACK_IMAGE;
              
              return (
                <div key={pid} className="relative group bg-white/5 border border-white/10 rounded-lg p-2 flex items-center gap-3 hover:border-white/20 transition-colors">
                  <img src={imgUrl} alt={p.name} className="w-12 h-12 rounded object-cover border border-white/10" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">{p.name}</p>
                    <p className="text-xs text-gray-400 uppercase tracking-wider truncate">{p.brand}</p>
                  </div>
                  <button 
                    onClick={() => handleRemoveFeatured(pid)} 
                    className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-colors"
                    title="Remove from featured"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              );
            })}
            
            {(draft.featuredProducts || []).length === 0 && (
              <div className="col-span-full py-6 text-center text-sm text-gray-500 border border-dashed border-white/10 rounded-lg">
                No products featured. The welcome page will automatically show the newest 8 items.
              </div>
            )}
          </div>
        </div>
      </Section>

      {/* ── Welcome Page Images ── */}
      <Section icon={<ImageIcon size={16} />} title="Welcome Page Images" description="Upload images to feature on the welcome page hero carousel and story section.">
        <div className="space-y-6">
          
          {/* Hero Images */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-xs text-gray-400 uppercase tracking-widest">Hero Carousel Images</label>
              <span className="text-xs text-gray-500">{(draft.welcomeImages?.hero || []).length} / 10</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {(draft.welcomeImages?.hero || []).map((url, idx) => (
                <div key={idx} className="relative group aspect-[4/5] rounded-lg overflow-hidden border border-white/10">
                  <img src={url} alt={`Hero ${idx + 1}`} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button onClick={() => removeHeroImage(idx)} className="p-2 bg-red-500/80 text-white rounded-full hover:bg-red-500">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
              {(draft.welcomeImages?.hero || []).length < 10 && (
                <div className="aspect-[4/5] h-full min-h-[200px]">
                  <ImageUploader 
                    bucketName="assets-images"
                    onUploadSuccess={(url) => addHeroImage(url)} 
                    onError={(err) => showToast('Upload Failed', err, 'error')} 
                  />
                </div>
              )}
            </div>
          </div>

          <div className="w-full h-px bg-white/10"></div>

          {/* Secondary Story Images */}
          <div>
            <label className="block text-xs text-gray-400 uppercase tracking-widest mb-3">Secondary Story Images</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {(draft.welcomeImages?.secondary || []).map((url, idx) => (
                <div key={idx} className="relative group aspect-[4/5] rounded-lg overflow-hidden border border-white/10">
                  <img src={url} alt={`Story ${idx + 1}`} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button onClick={() => removeSecondaryImage(idx)} className="p-2 bg-red-500/80 text-white rounded-full hover:bg-red-500">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
              <div className="aspect-[4/5] h-full min-h-[200px]">
                <ImageUploader 
                  bucketName="assets-images"
                  onUploadSuccess={(url) => addSecondaryImage(url)} 
                  onError={(err) => showToast('Upload Failed', err, 'error')} 
                />
              </div>
            </div>
          </div>

        </div>
      </Section>

      {/* ── Inventory & Stock Settings ── */}
      <Section icon={<Box size={16} />} title="Inventory Settings" description="Configure when stock alerts trigger in your dashboard.">
        <div>
          <label className="block text-xs text-gray-400 uppercase tracking-widest mb-1">Low Stock Threshold</label>
          <p className="text-xs text-gray-500 mb-3">Products with stock at or below this number will be flagged as Low Stock.</p>
          <input
            type="number"
            min={0}
            value={draft.inventory?.lowStockThreshold || 0}
            onChange={e => setInventory('lowStockThreshold', parseInt(e.target.value) || 0)}
            placeholder="10"
            className="w-full md:w-1/3 bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-gold-400 transition-colors"
          />
        </div>
      </Section>

      {/* ── Store Info ── */}
      <Section icon={<Store size={16} />} title="Store Information" description="Basic store details used in the footer, invoices, and meta info.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { key: 'name',         label: 'Store Name',    placeholder: 'KL Scents' },
            { key: 'tagline',      label: 'Tagline',       placeholder: 'Experience luxury…' },
            { key: 'contactEmail', label: 'Contact Email', placeholder: 'hello@klscents.com' },
            { key: 'contactPhone', label: 'Contact Phone', placeholder: '09xxxxxxxxx' },
            { key: 'instagramUrl', label: 'Instagram URL', placeholder: 'https://instagram.com/…' },
            { key: 'facebookUrl',  label: 'Facebook URL',  placeholder: 'https://facebook.com/…' },
          ].map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className="block text-xs text-gray-400 uppercase tracking-widest mb-1">{label}</label>
              <input
                type="text"
                value={draft.storeInfo[key] || ''}
                onChange={e => setStore(key, e.target.value)}
                placeholder={placeholder}
                className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-gold-400 transition-colors"
              />
            </div>
          ))}
        </div>
      </Section>

      {/* ── Checkout Behaviour ── */}
      <Section icon={<Settings size={16} />} title="Checkout Behaviour" description="Fine-tune order limits and anti-spam controls.">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { key: 'minOrderAmount',   label: 'Min. Order Amount (₱)', min: 0, placeholder: '0 = no minimum' },
            { key: 'maxCartItems',     label: 'Max Cart Items',        min: 1, placeholder: '20' },
            { key: 'spamLimitSeconds', label: 'Order Cooldown (secs)',  min: 0, placeholder: '60' },
          ].map(({ key, label, min, placeholder }) => (
            <div key={key}>
              <label className="block text-xs text-gray-400 uppercase tracking-widest mb-1">{label}</label>
              <input
                type="number"
                min={min}
                value={draft.checkout[key]}
                onChange={e => setCheckout(key, parseInt(e.target.value) || 0)}
                placeholder={placeholder}
                className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-gold-400 transition-colors"
              />
            </div>
          ))}
        </div>
      </Section>
      
      {/* ── Payment Methods ── */}
      <Section icon={<CreditCard size={16} />} title="Payment Methods" description="These options appear in the checkout payment dropdown.">
        <ListEditor label="Available Payment Options" items={draft.paymentMethods} onChange={val => setDraft(d => ({ ...d, paymentMethods: val }))} placeholder="e.g. Maya, PayPal…" />
      </Section>

      {/* ── Fulfillment Methods ── */}
      <Section icon={<Truck size={16} />} title="Fulfillment Methods" description="These options appear in the checkout fulfillment dropdown.">
        <ListEditor label="Available Fulfillment Options" items={draft.fulfillmentMethods} onChange={val => setDraft(d => ({ ...d, fulfillmentMethods: val }))} placeholder="e.g. Same-Day Delivery…" />
      </Section>

      {/* ── Legal Pages ── */}
      <Section icon={<FileText size={16} />} title="Legal & Compliance Pages" description="Content for your terms and privacy policies.">
        <div className="space-y-6">
          <Toggle 
            label="Enable Legal Pages & Consent" 
            description="Show policy links in the footer and require consent on sign up." 
            checked={draft.legal?.showLegalPages || false} 
            onChange={val => setLegal('showLegalPages', val)} 
          />
          
          <div className="w-full h-px bg-white/10"></div>
          
          <div>
            <label className="block text-xs text-gray-400 uppercase tracking-widest mb-2">Terms & Conditions</label>
            <textarea
              value={draft.legal?.termsAndConditions || ''}
              onChange={e => setLegal('termsAndConditions', e.target.value)}
              placeholder="Paste your Terms and Conditions here..."
              className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-gold-400 transition-colors h-48 custom-scrollbar resize-y"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 uppercase tracking-widest mb-2">Privacy Policy</label>
            <textarea
              value={draft.legal?.privacyPolicy || ''}
              onChange={e => setLegal('privacyPolicy', e.target.value)}
              placeholder="Paste your Privacy Policy here..."
              className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-gold-400 transition-colors h-48 custom-scrollbar resize-y"
            />
          </div>
        </div>
      </Section>

      <div className="flex justify-end pt-4 border-t border-white/10 pb-12">
        <button
          onClick={handleSave}
          disabled={isSaving || !hasChanges}
          className="flex items-center gap-2 px-8 py-3 bg-gold-400 hover:bg-gold-300 text-black font-bold rounded-lg shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? <><Loader2 size={18} className="animate-spin" /> Saving…</> : <><Save size={18} /> Save Changes</>}
        </button>
      </div>
    </div>
  ); 
};

export default AdminSettings;z