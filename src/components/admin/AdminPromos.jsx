import React, { useState } from 'react';
import { Plus, Trash2, Loader2, Tag, Calendar, AlertCircle } from 'lucide-react';
import { useShop } from '../../contexts/ShopContext';
import { usePromos } from '../../hooks/usePromos';

const PROMO_CODE_REGEX = /^[A-Z0-9_-]{3,30}$/;

const AdminPromos = () => {
  const { showToast } = useShop();
  const { promos, isLoading, isAdding, createPromo, deletePromo } = usePromos(showToast);

  const [code, setCode]       = useState('');
  const [discount, setDiscount] = useState('');
  const [expiry, setExpiry]   = useState('');
  const [limit, setLimit]     = useState('');
  const [formErrors, setFormErrors] = useState({});

  const validateForm = () => {
    const errors = {};
    if (!PROMO_CODE_REGEX.test(code.toUpperCase().trim())) {
      errors.code = '3–30 characters, letters, numbers, hyphens and underscores only.';
    }
    const disc = parseInt(discount);
    if (isNaN(disc) || disc < 1 || disc > 100) {
      errors.discount = 'Discount must be between 1 and 100.';
    }
    if (expiry && new Date(expiry) <= new Date()) {
      errors.expiry = 'Expiry date must be in the future.';
    }
    if (limit && (parseInt(limit) < 1 || !Number.isInteger(Number(limit)))) {
      errors.limit = 'Usage limit must be a positive whole number.';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      await createPromo({
        code: code.toUpperCase().trim(),
        discount_percentage: parseInt(discount),
        expiry_date: expiry ? new Date(expiry).toISOString() : null,
        usage_limit: limit ? parseInt(limit) : null,
      });
      setCode(''); setDiscount(''); setExpiry(''); setLimit(''); setFormErrors({});
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id, codeString) => {
    if (window.confirm(`Delete promo code "${codeString}"?`)) {
      try { await deletePromo(id, codeString); } catch (err) { console.error(err); }
    }
  };

  const inputClass = (field) =>
    `w-full bg-black/50 border rounded-lg p-2 text-white outline-none focus:border-gold-400 transition-colors ${formErrors[field] ? 'border-red-500/70' : 'border-white/10'}`;

  const ErrorMsg = ({ field }) =>
    formErrors[field] ? (
      <p className="flex items-center gap-1 text-red-400 text-xs mt-1"><AlertCircle size={11} />{formErrors[field]}</p>
    ) : null;

  return (
    <div className="animate-fade-in space-y-8">
      <div>
        <h3 className="text-2xl font-bold text-white mb-1">Discount Codes</h3>
        <p className="text-gray-400 text-sm">Generate and manage promotional campaigns.</p>
      </div>

      {/* Create form */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
        <h4 className="text-sm font-bold uppercase tracking-widest text-gold-400 mb-4 flex items-center gap-2">
          <Plus size={16} /> Create New Code
        </h4>
        <form onSubmit={handleCreate} className="flex flex-wrap items-start gap-4">
          <div className="flex-1 min-w-[150px]">
            <label className="block text-xs text-gray-400 uppercase tracking-widest mb-1">Code Name</label>
            <input required type="text" value={code}
              onChange={e => { setCode(e.target.value.toUpperCase()); setFormErrors(f => ({...f, code: ''})); }}
              placeholder="e.g. SUMMER20" maxLength={30}
              className={inputClass('code')}
            />
            <ErrorMsg field="code" />
          </div>
          <div className="w-28">
            <label className="block text-xs text-gray-400 uppercase tracking-widest mb-1">% Off</label>
            <input required type="number" min="1" max="100" value={discount}
              onChange={e => { setDiscount(e.target.value); setFormErrors(f => ({...f, discount: ''})); }}
              placeholder="20"
              className={inputClass('discount')}
            />
            <ErrorMsg field="discount" />
          </div>
          <div className="flex-1 min-w-[150px]">
            <label className="block text-xs text-gray-400 uppercase tracking-widest mb-1">Expiry Date (Opt)</label>
            <input type="date" value={expiry}
              onChange={e => { setExpiry(e.target.value); setFormErrors(f => ({...f, expiry: ''})); }}
              min={new Date().toISOString().split('T')[0]}
              className={inputClass('expiry')}
            />
            <ErrorMsg field="expiry" />
          </div>
          <div className="w-36">
            <label className="block text-xs text-gray-400 uppercase tracking-widest mb-1">Usage Limit (Opt)</label>
            <input type="number" min="1" step="1" value={limit}
              onChange={e => { setLimit(e.target.value); setFormErrors(f => ({...f, limit: ''})); }}
              placeholder="e.g. 50"
              className={inputClass('limit')}
            />
            <ErrorMsg field="limit" />
          </div>
          <div className="flex items-end pb-0.5">
            <button type="submit" disabled={isAdding}
              className="bg-gold-400 hover:bg-gold-300 text-black font-bold px-6 py-2 rounded-lg transition-colors h-[38px] min-w-[120px] flex justify-center items-center"
            >
              {isAdding ? <Loader2 size={18} className="animate-spin" /> : 'Generate'}
            </button>
          </div>
        </form>
      </div>

      {/* Table */}
      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-black/40 border-b border-white/10 text-xs uppercase tracking-widest text-gray-500">
              <th className="p-4 font-medium">Code</th>
              <th className="p-4 font-medium">Discount</th>
              <th className="p-4 font-medium">Uses</th>
              <th className="p-4 font-medium">Expires</th>
              <th className="p-4 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-sm text-gray-300">
            {isLoading ? (
              <tr><td colSpan="5" className="p-8 text-center"><Loader2 className="animate-spin text-gold-400 mx-auto" /></td></tr>
            ) : promos.length === 0 ? (
              <tr><td colSpan="5" className="p-8 text-center text-gray-500">No promo codes generated yet.</td></tr>
            ) : promos.map(promo => {
              const isExpired = promo.expiry_date && new Date(promo.expiry_date) < new Date();
              return (
                <tr key={promo.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-4 font-bold text-white tracking-wider flex items-center gap-2">
                    <Tag size={14} className="text-gold-400" /> {promo.code}
                  </td>
                  <td className="p-4 text-green-400 font-bold">{promo.discount_percentage}% OFF</td>
                  <td className="p-4">{promo.times_used}{promo.usage_limit ? ` / ${promo.usage_limit}` : ' uses'}</td>
                  <td className="p-4">
                    {promo.expiry_date ? (
                      <span className={`flex items-center gap-1.5 ${isExpired ? 'text-red-400' : 'text-gray-300'}`}>
                        <Calendar size={14} /> {new Date(promo.expiry_date).toLocaleDateString()}
                        {isExpired && <span className="text-[10px] bg-red-500/10 text-red-400 px-1.5 py-0.5 rounded font-bold">EXPIRED</span>}
                      </span>
                    ) : <span className="text-gray-500 italic">Never</span>}
                  </td>
                  <td className="p-4 text-right">
                    <button onClick={() => handleDelete(promo.id, promo.code)} className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminPromos;