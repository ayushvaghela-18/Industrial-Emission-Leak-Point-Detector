import React, { useState } from 'react';
import { useFactory } from '../../context/FactoryContext';
import { Building2, X, Plus } from 'lucide-react';

export const NewFactoryModal = ({ isOpen, onClose }) => {
  const { addFactory } = useFactory();
  const [name, setName] = useState('');
  const [industry, setIndustry] = useState('Metal Processing');
  const [location, setLocation] = useState('Industrial Zone');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    addFactory({
      name,
      industry,
      location,
      size: 'SME Facility',
      annualProduction: '25,000 Units',
      operationalData: {
        electricityKw: 8500000,
        renewablePct: 15,
        dieselLiters: 220000,
        naturalGasM3: 310000,
        rawMaterialQuantityTonnes: 45000,
        recycledMaterialPct: 10,
        wasteGeneratedTonnes: 5400,
        wasteRecycledPct: 30,
        transportDistanceKm: 95000
      }
    });

    setName('');
    onClose();
  };

  const inputStyle = "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none transition-all text-sm shadow-sm";
  const labelStyle = "block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white border border-slate-200/70 rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5 text-slate-900">
        
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center space-x-2">
            <Building2 className="w-5 h-5 text-slate-900" />
            <h3 className="text-sm font-bold tracking-tight text-slate-900">Register New Industrial Facility</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700 rounded-lg transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className={labelStyle}>Facility Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Titan Chemicals & Polymers"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputStyle}
            />
          </div>

          <div className="space-y-1">
            <label className={labelStyle}>Industry Sector</label>
            <select
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className={inputStyle}
            >
              <option value="Metal Processing & Metallurgy">Metal Processing & Metallurgy</option>
              <option value="Textiles & Synthetic Fabrics">Textiles & Synthetic Fabrics</option>
              <option value="Chemicals & Polymers">Chemicals & Polymers</option>
              <option value="Food & Beverage Processing">Food & Beverage Processing</option>
              <option value="Paper & Packaging">Paper & Packaging</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className={labelStyle}>Geographic Location</label>
            <input
              type="text"
              placeholder="e.g. Ohio, USA"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className={inputStyle}
            />
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center space-x-1.5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-md transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Create Facility Profile</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
