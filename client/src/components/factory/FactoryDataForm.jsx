import React, { useState, useEffect } from 'react';
import { useFactory } from '../../context/FactoryContext';
import { Zap, Flame, Factory as FactoryIcon, Trash2, Truck, Save, Loader2, RefreshCw } from 'lucide-react';

export const FactoryDataForm = () => {
  const { activeFactory, submitOperationalData, calculating } = useFactory();

  const [formData, setFormData] = useState({
    electricityKw: 14500000,
    electricitySource: 'Grid (Fossil Mix)',
    renewablePct: 12,
    dieselLiters: 480000,
    coalTonnes: 1200,
    naturalGasM3: 650000,
    rawMaterialType: 'Virgin Steel Billets',
    rawMaterialQuantityTonnes: 92000,
    recycledMaterialPct: 8,
    wasteGeneratedTonnes: 14500,
    wasteRecycledPct: 35,
    transportDistanceKm: 185000,
  });

  const [activeTab, setActiveTab] = useState('energy');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (activeFactory?.operationalData) {
      setFormData({ ...activeFactory.operationalData });
    }
  }, [activeFactory]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await submitOperationalData(formData);
    setSuccessMsg('Operational telemetry saved & carbon footprint recalculated deterministically!');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  return (
    <div className="bg-surface-card border border-surface-border rounded-xl shadow-card overflow-hidden">
      
      {/* Header */}
      <div className="p-5 border-b border-surface-border bg-forest-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold flex items-center gap-2">
            <FactoryIcon className="w-5 h-5 text-emerald-400" />
            Operational Telemetry Input
          </h2>
          <p className="text-xs text-slate-300">Enter process parameters to calculate deterministic Scope 1, 2, and 3 emissions.</p>
        </div>

        {successMsg && (
          <div className="px-3 py-1.5 bg-emerald-500/20 border border-emerald-400 text-emerald-300 text-xs font-semibold rounded-lg">
            {successMsg}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-surface-border bg-slate-50 px-4 pt-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('energy')}
          className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'energy'
              ? 'border-emerald-600 text-forest-900 bg-white rounded-t-lg'
              : 'border-transparent text-slate-secondary hover:text-slate-primary'
          }`}
        >
          <Zap className="w-4 h-4 text-amber-500" />
          <span>1. Energy & Fuels</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('materials')}
          className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'materials'
              ? 'border-emerald-600 text-forest-900 bg-white rounded-t-lg'
              : 'border-transparent text-slate-secondary hover:text-slate-primary'
          }`}
        >
          <Flame className="w-4 h-4 text-emerald-600" />
          <span>2. Raw Materials & Feedstock</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('waste')}
          className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'waste'
              ? 'border-emerald-600 text-forest-900 bg-white rounded-t-lg'
              : 'border-transparent text-slate-secondary hover:text-slate-primary'
          }`}
        >
          <Trash2 className="w-4 h-4 text-teal-600" />
          <span>3. Waste Streams</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('transport')}
          className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'transport'
              ? 'border-emerald-600 text-forest-900 bg-white rounded-t-lg'
              : 'border-transparent text-slate-secondary hover:text-slate-primary'
          }`}
        >
          <Truck className="w-4 h-4 text-blue-600" />
          <span>4. Transport & Logistics</span>
        </button>
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        
        {/* Section 1: Energy & Fuels */}
        {activeTab === 'energy' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-primary">Annual Electricity Consumption (kWh/yr)</label>
              <input
                type="number"
                name="electricityKw"
                value={formData.electricityKw}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-surface-border rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
              <span className="text-[11px] text-slate-secondary">Scope 2 indirect electricity grid draw</span>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-primary">Renewable Power Mix Share (%)</label>
              <input
                type="number"
                name="renewablePct"
                min="0"
                max="100"
                value={formData.renewablePct}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-surface-border rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
              <span className="text-[11px] text-slate-secondary">Solar, wind, or green PPA percentage</span>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-primary">Annual Diesel Fuel Usage (Liters/yr)</label>
              <input
                type="number"
                name="dieselLiters"
                value={formData.dieselLiters}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-surface-border rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
              <span className="text-[11px] text-slate-secondary">Scope 1 furnace & stationary combustion</span>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-primary">Natural Gas Consumption (m³/yr)</label>
              <input
                type="number"
                name="naturalGasM3"
                value={formData.naturalGasM3}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-surface-border rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
              <span className="text-[11px] text-slate-secondary">Direct process boiler thermal combustion</span>
            </div>
          </div>
        )}

        {/* Section 2: Materials & Feedstock */}
        {activeTab === 'materials' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-primary">Primary Raw Material Category</label>
              <input
                type="text"
                name="rawMaterialType"
                value={formData.rawMaterialType}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-surface-border rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-primary">Annual Material Input (Tonnes/yr)</label>
              <input
                type="number"
                name="rawMaterialQuantityTonnes"
                value={formData.rawMaterialQuantityTonnes}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-surface-border rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1 md:col-span-2">
              <label className="block text-xs font-bold text-slate-primary">Secondary Recycled Feedstock Ratio (%)</label>
              <input
                type="number"
                name="recycledMaterialPct"
                min="0"
                max="100"
                value={formData.recycledMaterialPct}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-surface-border rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
              <span className="text-[11px] text-slate-secondary">Higher recycled content slashes upstream Scope 3 extraction footprint</span>
            </div>
          </div>
        )}

        {/* Section 3: Waste Streams */}
        {activeTab === 'waste' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-primary">Total Annual Process Waste (Tonnes/yr)</label>
              <input
                type="number"
                name="wasteGeneratedTonnes"
                value={formData.wasteGeneratedTonnes}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-surface-border rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-primary">Waste Recycling / Diversion Rate (%)</label>
              <input
                type="number"
                name="wasteRecycledPct"
                min="0"
                max="100"
                value={formData.wasteRecycledPct}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-surface-border rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* Section 4: Transport */}
        {activeTab === 'transport' && (
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-primary">Total Logistics Haul Distance (km/yr)</label>
              <input
                type="number"
                name="transportDistanceKm"
                value={formData.transportDistanceKm}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-surface-border rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
              <span className="text-[11px] text-slate-secondary">Freight hauling distance for raw materials & finished product distribution</span>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="pt-4 border-t border-surface-border flex items-center justify-between">
          <p className="text-xs text-slate-secondary">
            * All calculations execute deterministically on standard GHG Protocol emission factors.
          </p>

          <button
            type="submit"
            disabled={calculating}
            className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-5 py-2.5 rounded-lg shadow-md transition-all disabled:opacity-50"
          >
            {calculating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Running Deterministic Engine...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Recalculate Carbon Footprint</span>
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
};
