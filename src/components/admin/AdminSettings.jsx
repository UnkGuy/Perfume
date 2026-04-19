// src/components/admin/AdminSettings.jsx
import React, { useState, useEffect } from 'react';
import {
  Save, Loader2, ToggleLeft, ToggleRight, Plus, Trash2,
  Store, CreditCard, Truck, Settings, CheckCircle,
} from 'lucide-react';
import { saveSettingsAPI } from '../../services/settingsApi';
import { logAdminActionAPI } from '../../services/logApi';
import { useSettings } from '../../contexts/SettingsContext';
import { useAuth } from '../../contexts/AuthContext';
import { useShop } from '../../contexts/ShopContext';

// ─── Reusable Toggle ─────────────────────────────────────────────────────────
const Toggle = ({ checked, onChange, label, description }) => (
  <div className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
    <div className="flex-1 pr-4">
      <p className="text-sm font-medium text-white">{label}</p>
      {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
    </div>
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`flex-shrink-0 transition-colors ${checked ? 'text-gold-400' : 'text-gray-600 hover:text-gray-400'}`}
    >
      {checked
        ? <ToggleRight size={32} className="fill-gold-400/20" />
        : <ToggleLeft size={32} />}
    </button>
  </div>
);

// ─── Reusable List Editor ─────────────────────────────────────────────────────
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
    <div>
      <label className="block text-xs text-gray-400 uppercase tracking-widest mb-3">{label}</label>
      <div className="flex gap-2 mb-3">
        <input
          type="text"
          value={inputVal}
          onChange={e => setInputVal(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAdd())}
          placeholder={placeholder}
          className="flex-1 bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-gold-400 transition-colors"
        />
        <button
          type="button"
          onClick={handleAdd}
          className="px-4 py-2 bg-gold-400/10 hover:bg-gold-400/20 text-gold-400 border border-gold-400/30 rounded-lg text-sm font-bold transition-colors"
        >
          <Plus size={16} />
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {items.map(item => (
          <div
            key={item}
            className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-sm text-gray-300"
          >
            <span>{item}</span>
            <button
              type="button"
              onClick={() => handleRemove(item)}
              disabled={items.length <= 1}
              className="text-gray-500 hover:text-red-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              title={items.length <= 1 ? 'Must keep at least one option' : 'Remove'}
            >
              <Trash2 size={12} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Section Card ─────────────────────────────────────────────────────────────
const Section = ({ icon, title, description, children }) => (
  <div className="bg-white/5 border border-white/10 rounded-xl p-6">
    <div className="flex items-center gap-3 mb-1">
      <div className="w-8 h-8 rounded-lg bg-gold-400/10 flex items-center justify-center text-gold-400 flex-shrink-0">
        {icon}
      </div>
      <h4 className="text-base font-bold text-white">{title}</h4>
    </div>
    {description && <p className="text-xs text-gray-500 mb-5 ml-11">{description}</p>}
    {!description && <div className="mb-5" />}
    <div className="space-y-2">{children}</div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const AdminSettings = () => {
  const { settings, setSettings } = useSettings();
  const { user } = useAuth();
  const { showToast } = useShop();

  const [draft, setDraft] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [savedAt, setSavedAt] = useState(null);

  useEffect(() => {
    setDraft(JSON.parse(JSON.stringify(settings)));
  }, [settings]);

  if (!draft) return (
    <div className="flex justify-center items-center h-64">
      <Loader2 className="animate-spin text-gold-400" size={32} />
    </div>
  );

  const setFeature  = (key, val) => setDraft(d => ({ ...d, features: { ...d.features, [key]: val } }));
  const setCheckout = (key, val) => setDraft(d => ({ ...d, checkout: { ...d.checkout, [key]: val } }));
  const setStore    = (key, val) => setDraft(d => ({ ...d, storeInfo: { ...d.storeInfo, [key]: val } }));

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

  return (
    <div className="animate-fade-in space-y-8 max-w-3xl">

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

      {/* Unsaved changes banner */}
      {hasChanges && (
        <div className="flex items-center gap-3 px-4 py-3 bg-gold-400/10 border border-gold-400/30 rounded-lg text-sm text-gold-400 animate-fade-in">
          <Settings size={16} className="flex-shrink-0" />
          You have unsaved changes. Click <strong>Save Changes</strong> to apply them.
        </div>
      )}

      {/* ── Payment Methods ── */}
      <Section
        icon={<CreditCard size={16} />}
        title="Payment Methods"
        description="These options appear in the checkout payment dropdown."
      >
        <ListEditor
          label="Available Payment Options"
          items={draft.paymentMethods}
          onChange={val => setDraft(d => ({ ...d, paymentMethods: val }))}
          placeholder="e.g. Maya, PayPal…"
        />
      </Section>

      {/* ── Fulfillment Methods ── */}
      <Section
        icon={<Truck size={16} />}
        title="Fulfillment Methods"
        description="These options appear in the checkout fulfillment dropdown."
      >
        <ListEditor
          label="Available Fulfillment Options"
          items={draft.fulfillmentMethods}
          onChange={val => setDraft(d => ({ ...d, fulfillmentMethods: val }))}
          placeholder="e.g. Same-Day Delivery…"
        />
      </Section>

      {/* ── Store Info ── */}
      <Section
        icon={<Store size={16} />}
        title="Store Information"
        description="Basic store details used in the footer, invoices, and meta info."
      >
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
      <Section
        icon={<Settings size={16} />}
        title="Checkout Behaviour"
        description="Fine-tune order limits and anti-spam controls."
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { key: 'minOrderAmount',   label: 'Min. Order Amount (₱)', min: 0, placeholder: '0 = no minimum' },
            { key: 'maxCartItems',     label: 'Max Cart Items',         min: 1, placeholder: '20' },
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

      {/* Bottom save bar */}
      <div className="flex justify-end pt-4 border-t border-white/10">
        <button
          onClick={handleSave}
          disabled={isSaving || !hasChanges}
          className="flex items-center gap-2 px-8 py-3 bg-gold-400 hover:bg-gold-300 text-black font-bold rounded-lg shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving
            ? <><Loader2 size={18} className="animate-spin" /> Saving…</>
            : <><Save size={18} /> Save Changes</>}
        </button>
      </div>
    </div>
  );
};

export default AdminSettings;