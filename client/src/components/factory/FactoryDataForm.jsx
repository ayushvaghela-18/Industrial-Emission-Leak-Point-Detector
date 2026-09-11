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

  const inputStyle = "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none transition-all text-sm shadow-sm";
  const labelStyle = "block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1";

  return (
    <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
      
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700/50 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden">
        <div>
          <h2 className="text-lg font-bold tracking-tight flex items-center gap-2 text-white">
            <FactoryIcon className="w-5 h-5 text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            Operational Telemetry Input
          </h2>
          <p className="text-xs text-slate-400 mt-1">Enter process parameters to calculate deterministic Scope 1, 2, and 3 emissions.</p>
        </div>

        {successMsg && (
          <div className="px-3.5 py-2 bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-semibold rounded-xl">
            {successMsg}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 bg-slate-50 px-4 pt-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('energy')}
          className={`flex items-center space-x-2 px-5 py-3 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'energy'
              ? 'border-emerald-600 text-slate-900 bg-white rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Zap className="w-4 h-4 text-amber-500" />
          <span>1. Energy & Fuels</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('materials')}
          className={`flex items-center space-x-2 px-5 py-3 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'materials'
              ? 'border-emerald-600 text-slate-900 bg-white rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Flame className="w-4 h-4 text-emerald-600" />
          <span>2. Raw Materials & Feedstock</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('waste')}
          className={`flex items-center space-x-2 px-5 py-3 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'waste'
              ? 'border-emerald-600 text-slate-900 bg-white rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Trash2 className="w-4 h-4 text-teal-600" />
          <span>3. Waste Streams</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('transport')}
          className={`flex items-center space-x-2 px-5 py-3 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'transport'
              ? 'border-emerald-600 text-slate-900 bg-white rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-900'
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
              <label className={labelStyle}>Annual Electricity Consumption (kWh/yr)</label>
              <input
                type="number"
                name="electricityKw"
                value={formData.electricityKw}
                onChange={handleChange}
                className={inputStyle}
              />
              <span className="text-[11px] font-medium text-slate-500">Scope 2 indirect electricity grid draw</span>
            </div>

            <div className="space-y-1">
              <label className={labelStyle}>Renewable Power Mix Share (%)</label>
              <input
                type="number"
                name="renewablePct"
                min="0"
                max="100"
                value={formData.renewablePct}
                onChange={handleChange}
                className={inputStyle}
              />
              <span className="text-[11px] font-medium text-slate-500">Solar, wind, or green PPA percentage</span>
            </div>

            <div className="space-y-1">
              <label className={labelStyle}>Annual Diesel Fuel Usage (Liters/yr)</label>
              <input
                type="number"
                name="dieselLiters"
                value={formData.dieselLiters}
                onChange={handleChange}
                className={inputStyle}
              />
              <span className="text-[11px] font-medium text-slate-500">Scope 1 furnace & stationary combustion</span>
            </div>

            <div className="space-y-1">
              <label className={labelStyle}>Natural Gas Consumption (m³/yr)</label>
              <input
                type="number"
                name="naturalGasM3"
                value={formData.naturalGasM3}
                onChange={handleChange}
                className={inputStyle}
              />
              <span className="text-[11px] font-medium text-slate-500">Direct process boiler thermal combustion</span>
            </div>
          </div>
        )}

        {/* Section 2: Materials & Feedstock */}
        {activeTab === 'materials' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className={labelStyle}>Primary Raw Material Category</label>
              <input
                type="text"
                name="rawMaterialType"
                value={formData.rawMaterialType}
                onChange={handleChange}
                className={inputStyle}
              />
            </div>

            <div className="space-y-1">
              <label className={labelStyle}>Annual Material Input (Tonnes/yr)</label>
              <input
                type="number"
                name="rawMaterialQuantityTonnes"
                value={formData.rawMaterialQuantityTonnes}
                onChange={handleChange}
                className={inputStyle}
              />
            </div>

            <div className="space-y-1 md:col-span-2">
              <label className={labelStyle}>Secondary Recycled Feedstock Ratio (%)</label>
              <input
                type="number"
                name="recycledMaterialPct"
                min="0"
                max="100"
                value={formData.recycledMaterialPct}
                onChange={handleChange}
                className={inputStyle}
              />
              <span className="text-[11px] font-medium text-slate-500">Higher recycled content slashes upstream Scope 3 extraction footprint</span>
            </div>
          </div>
        )}

        {/* Section 3: Waste Streams */}
        {activeTab === 'waste' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className={labelStyle}>Total Annual Process Waste (Tonnes/yr)</label>
              <input
                type="number"
                name="wasteGeneratedTonnes"
                value={formData.wasteGeneratedTonnes}
                onChange={handleChange}
                className={inputStyle}
              />
            </div>

            <div className="space-y-1">
              <label className={labelStyle}>Waste Recycling / Diversion Rate (%)</label>
              <input
                type="number"
                name="wasteRecycledPct"
                min="0"
                max="100"
                value={formData.wasteRecycledPct}
                onChange={handleChange}
                className={inputStyle}
              />
            </div>
          </div>
        )}

        {/* Section 4: Transport */}
        {activeTab === 'transport' && (
          <div className="space-y-4">
            <div className="space-y-1">
              <label className={labelStyle}>Total Logistics Haul Distance (km/yr)</label>
              <input
                type="number"
                name="transportDistanceKm"
                value={formData.transportDistanceKm}
                onChange={handleChange}
                className={inputStyle}
              />
              <span className="text-[11px] font-medium text-slate-500">Freight hauling distance for raw materials & finished product distribution</span>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="pt-4 border-t border-slate-200/70 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500">
            * All calculations execute deterministically on standard GHG Protocol emission factors.
          </p>

          <button
            type="submit"
            disabled={calculating}
            className="flex items-center space-x-2 bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white font-semibold text-xs px-6 py-3 rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50"
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
