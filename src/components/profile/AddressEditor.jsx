// src/components/profile/AddressEditor.jsx
// Extracted from ProfilePage.jsx — the PSGC-driven address form + display mode.
// ProfilePage just passes profileData, setProfileData, errors, and PSGC hook state down.

import React from 'react';
import { MapPin, Edit2, Loader2 } from 'lucide-react';

const AddressEditor = ({
  profileData,
  setProfileData,
  errors,
  isEditingAddress,
  setIsEditingAddress,
  // PSGC hook outputs
  regions,
  provinces,
  cities,
  barangays,
  getProvinces,
  getCities,
  getBarangays,
  isFetchingLocation,
  // PSGC code state lives in ProfilePage — passed down so this component stays pure
  addressCodes,
  setAddressCodes,
}) => {
  const handleRegionChange = (e) => {
    const code = e.target.value;
    const name = e.target.options[e.target.selectedIndex].text;
    setAddressCodes({ region: code, province: '', city: '', barangay: '' });
    setProfileData(prev => ({
      ...prev,
      address: { region: name, province: '', city: '', barangay: '', street: '', landmark: '' },
    }));
    getProvinces(code);
  };

  const handleProvinceChange = (e) => {
    const code = e.target.value;
    const name = e.target.options[e.target.selectedIndex].text;
    setAddressCodes(prev => ({ ...prev, province: code, city: '', barangay: '' }));
    setProfileData(prev => ({
      ...prev,
      address: { ...prev.address, province: name, city: '', barangay: '' },
    }));
    getCities(code);
  };

  const handleCityChange = (e) => {
    const code = e.target.value;
    const name = e.target.options[e.target.selectedIndex].text;
    setAddressCodes(prev => ({ ...prev, city: code, barangay: '' }));
    setProfileData(prev => ({
      ...prev,
      address: { ...prev.address, city: name, barangay: '' },
    }));
    getBarangays(code);
  };

  const handleBarangayChange = (e) => {
    const code = e.target.value;
    const name = e.target.options[e.target.selectedIndex].text;
    setAddressCodes(prev => ({ ...prev, barangay: code }));
    setProfileData(prev => ({
      ...prev,
      address: { ...prev.address, barangay: name },
    }));
  };

  const addr = profileData.address || {};
  const hasExistingAddress = !!addr.region;

  const selectClass = "w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:border-gold-400 outline-none disabled:opacity-50";

  return (
    <div className="md:col-span-2">
      {/* Label row */}
      <div className="flex justify-between items-end mb-2">
        <label className="text-xs text-gray-400 uppercase tracking-widest flex items-center gap-2">
          <MapPin size={14} className="text-gold-400" /> Default Delivery Address
        </label>
        {!isEditingAddress && hasExistingAddress && (
          <button
            type="button"
            onClick={() => setIsEditingAddress(true)}
            className="text-xs text-gold-400 hover:text-gold-300 flex items-center gap-1 font-bold"
          >
            <Edit2 size={12} /> Edit Address
          </button>
        )}
      </div>

      {/* ── Display mode ── */}
      {!isEditingAddress ? (
        <div className="w-full bg-black/40 border border-white/10 rounded-lg p-4 text-white">
          {hasExistingAddress ? (
            <>
              <p className="font-medium">{addr.street}</p>
              <p className="text-sm text-gray-400 mt-1">
                {[addr.barangay, addr.city, addr.province, addr.region].filter(Boolean).join(', ')}
              </p>
              {addr.landmark && (
                <p className="text-xs text-gold-400 mt-2">Landmark: {addr.landmark}</p>
              )}
            </>
          ) : (
            <p className="text-gray-500 text-sm">No address saved yet.</p>
          )}
          {!hasExistingAddress && (
            <button
              type="button"
              onClick={() => setIsEditingAddress(true)}
              className="text-xs text-gold-400 hover:text-gold-300 flex items-center gap-1 font-bold mt-3"
            >
              <Edit2 size={12} /> Add Address
            </button>
          )}
        </div>
      ) : (
        /* ── Edit mode ── */
        <div className="bg-black/40 border border-white/10 p-5 rounded-xl space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Region</label>
              <select value={addressCodes.region} onChange={handleRegionChange} className={selectClass}>
                <option value="" className="bg-rich-black text-white">Select Region</option>
                {regions.map(r => <option key={r.code} value={r.code} className="bg-rich-black text-white">{r.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Province</label>
              <select
                value={addressCodes.province}
                onChange={handleProvinceChange}
                disabled={!addressCodes.region || (provinces.length === 0 && cities.length > 0)}
                className={selectClass}
              >
                <option value="" className="bg-rich-black text-white">
                  {provinces.length === 0 && cities.length > 0 ? 'Metro Manila / NCR' : 'Select Province'}
                </option>
                {provinces.map(p => <option key={p.code} value={p.code} className="bg-rich-black text-white">{p.name}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="flex justify-between text-xs text-gray-500 mb-1">
                City / Municipality
                {isFetchingLocation && <Loader2 size={12} className="animate-spin text-gold-400" />}
              </label>
              <select
                value={addressCodes.city}
                onChange={handleCityChange}
                disabled={!addressCodes.region || cities.length === 0}
                className={selectClass}
              >
                <option value="" className="bg-rich-black text-white">Select City</option>
                {cities.map(c => <option key={c.code} value={c.code} className="bg-rich-black text-white">{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="flex justify-between text-xs text-gray-500 mb-1">
                Barangay
                {isFetchingLocation && <Loader2 size={12} className="animate-spin text-gold-400" />}
              </label>
              <select
                value={addressCodes.barangay}
                onChange={handleBarangayChange}
                disabled={!addressCodes.city || barangays.length === 0}
                className={selectClass}
              >
                <option value="" className="bg-rich-black text-white">Select Barangay</option>
                {barangays.map(b => <option key={b.code} value={b.code} className="bg-rich-black text-white">{b.name}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Street / House No. / Subdivision</label>
            <input
              type="text"
              value={addr.street || ''}
              onChange={e => setProfileData(prev => ({
                ...prev, address: { ...prev.address, street: e.target.value }
              }))}
              maxLength={150}
              placeholder="e.g. Blk 1 Lot 2, Mabini St."
              className={`w-full bg-white/5 border rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none ${errors?.street ? 'border-red-500 focus:border-red-500' : 'border-white/10 focus:border-gold-400'}`}
            />
            {errors?.street && <p className="text-red-400 text-xs mt-1.5">{errors.street}</p>}
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Nearest Landmark (Optional)</label>
            <input
              type="text"
              value={addr.landmark || ''}
              onChange={e => setProfileData(prev => ({
                ...prev, address: { ...prev.address, landmark: e.target.value }
              }))}
              maxLength={150}
              placeholder="e.g. Beside the blue gate"
              className={`w-full bg-white/5 border rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none ${errors?.landmark ? 'border-red-500 focus:border-red-500' : 'border-white/10 focus:border-gold-400'}`}
            />
            {errors?.landmark && <p className="text-red-400 text-xs mt-1.5">{errors.landmark}</p>}
          </div>

          {hasExistingAddress && (
            <button
              type="button"
              onClick={() => setIsEditingAddress(false)}
              className="text-xs text-gray-400 hover:text-white mt-2"
            >
              Cancel Address Edit
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default AddressEditor;