import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Loader2, Tag, Calendar } from 'lucide-react';
import { fetchAllPromosAPI, createPromoAPI, deletePromoAPI } from '../../services/promoApi';

const AdminPromos = ({ showToast }) => {
  const [promos, setPromos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  // Form State
  const [code, setCode] = useState('');
  const [discount, setDiscount] = useState('');
  const [expiry, setExpiry] = useState('');
  const [limit, setLimit] = useState('');

  const loadPromos = async () => {
    setIsLoading(true);
    try {
      const data = await fetchAllPromosAPI();
      setPromos(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPromos();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setIsAdding(true);
    try {
      await createPromoAPI({
        code: code.toUpperCase().trim(),
        discount_percentage: parseInt(discount),
        expiry_date: expiry ? new Date(expiry).toISOString() : null,
        usage_limit: limit ? parseInt(limit) : null
      });
      if (showToast) showToast("Success", "Promo code created!");
      setCode(''); setDiscount(''); setExpiry(''); setLimit('');
      loadPromos();
    } catch (err) {
      if (showToast) showToast("Error", "Could not create code. Ensure it is unique.", "error");
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = async (id, codeString) => {
    if (window.confirm(`Delete promo code ${codeString}?`)) {
      try {
        await deletePromoAPI(id);
        if (showToast) showToast("Deleted", "Promo code removed.");
        loadPromos();
      } catch (err) {
        if (showToast) showToast("Error", "Failed to delete.", "error");
      }
    }
  };

  return (
    <div className="animate-fade-in space-y-8">
      <div>
        <h3 className="text-2xl font-bold text-white mb-1">Discount Codes</h3>
        <p className="text-gray-400 text-sm">Generate and manage promotional campaigns.</p>
      </div>

      {/* CREATE FORM */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
        <h4 className="text-sm font-bold uppercase tracking-widest text-gold-400 mb-4 flex items-center gap-2"><Plus size={16}/> Create New Code</h4>
        <form onSubmit={handleCreate} className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[150px]">
            <label className="block text-xs text-gray-400 uppercase tracking-widest mb-1">Code Name</label>
            <input required type="text" value={code} onChange={e => setCode(e.target.value.toUpperCase())} placeholder="e.g. SUMMER20" className="w-full bg-black/50 border border-white/10 rounded-lg p-2 text-white outline-none focus:border-gold-400" />
          </div>
          <div className="w-24">
            <label className="block text-xs text-gray-400 uppercase tracking-widest mb-1">% Off</label>
            <input required type="number" min="1" max="100" value={discount} onChange={e => setDiscount(e.target.value)} placeholder="20" className="w-full bg-black/50 border border-white/10 rounded-lg p-2 text-white outline-none focus:border-gold-400" />
          </div>
          <div className="flex-1 min-w-[150px]">
            <label className="block text-xs text-gray-400 uppercase tracking-widest mb-1">Expiry Date (Opt)</label>
            <input type="date" value={expiry} onChange={e => setExpiry(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-lg p-2 text-white outline-none focus:border-gold-400" />
          </div>
          <div className="w-32">
            <label className="block text-xs text-gray-400 uppercase tracking-widest mb-1">Usage Limit (Opt)</label>
            <input type="number" min="1" value={limit} onChange={e => setLimit(e.target.value)} placeholder="e.g. 50" className="w-full bg-black/50 border border-white/10 rounded-lg p-2 text-white outline-none focus:border-gold-400" />
          </div>
          <button type="submit" disabled={isAdding} className="bg-gold-400 hover:bg-gold-300 text-black font-bold px-6 py-2 rounded-lg transition-colors h-[42px]">
            {isAdding ? <Loader2 size={18} className="animate-spin" /> : 'Generate'}
          </button>
        </form>
      </div>

      {/* TABLE */}
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
            ) : (
              promos.map(promo => {
                const isExpired = promo.expiry_date && new Date(promo.expiry_date) < new Date();
                return (
                  <tr key={promo.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 font-bold text-white tracking-wider flex items-center gap-2">
                      <Tag size={14} className="text-gold-400"/> {promo.code}
                    </td>
                    <td className="p-4 text-green-400 font-bold">{promo.discount_percentage}% OFF</td>
                    <td className="p-4">
                      {promo.times_used} {promo.usage_limit ? `/ ${promo.usage_limit}` : 'uses'}
                    </td>
                    <td className="p-4">
                      {promo.expiry_date ? (
                        <span className={`flex items-center gap-1.5 ${isExpired ? 'text-red-400' : 'text-gray-300'}`}>
                          <Calendar size={14}/> {new Date(promo.expiry_date).toLocaleDateString()}
                        </span>
                      ) : <span className="text-gray-500 italic">Never</span>}
                    </td>
                    <td className="p-4 text-right">
                      <button onClick={() => handleDelete(promo.id, promo.code)} className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors">
                        <Trash2 size={16}/>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminPromos;