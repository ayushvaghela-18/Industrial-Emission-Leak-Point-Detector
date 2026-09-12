import React, { useState, useEffect } from 'react';
import { useFactory } from '../../context/FactoryContext';
import { Zap, Flame, Factory as FactoryIcon, Trash2, Truck, Save, Loader2 } from 'lucide-react';

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
          <div className="flex items-center space-x-2">
            <FactoryIcon className="w-5 h-5 text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            <h2 className="text-lg font-bold tracking-tight text-white">Operational Telemetry Input</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Configure process parameters for <span className="font-semibold text-emerald-400">{activeFactory?.name || 'Selected Facility'}</span> ({activeFactory?.industry || 'Industrial'}).
          </p>
        </div>

        {successMsg ? (
          <div className="px-3.5 py-2 bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-semibold rounded-xl animate-fade-in">
            {successMsg}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>GHG Protocol Compliant Engine</span>
          </div>
        )}
      </div>

      {/* Tabs with Scope classification */}
      <div className="flex border-b border-slate-200 bg-slate-50 px-4 pt-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('energy')}
          className={`flex items-center space-x-2 px-4 py-3 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'energy'
              ? 'border-emerald-600 text-slate-900 bg-white rounded-t-xl shadow-sm'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Zap className="w-4 h-4 text-amber-500" />
          <span>1. Energy & Fuels</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 font-bold border border-amber-200">Scope 1 & 2</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('materials')}
          className={`flex items-center space-x-2 px-4 py-3 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'materials'
              ? 'border-emerald-600 text-slate-900 bg-white rounded-t-xl shadow-sm'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Flame className="w-4 h-4 text-emerald-600" />
          <span>2. Raw Materials</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">Scope 3</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('waste')}
          className={`flex items-center space-x-2 px-4 py-3 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'waste'
              ? 'border-emerald-600 text-slate-900 bg-white rounded-t-xl shadow-sm'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Trash2 className="w-4 h-4 text-teal-600" />
          <span>3. Waste Streams</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-teal-50 text-teal-700 font-bold border border-teal-200">Scope 3</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('transport')}
          className={`flex items-center space-x-2 px-4 py-3 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'transport'
              ? 'border-emerald-600 text-slate-900 bg-white rounded-t-xl shadow-sm'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Truck className="w-4 h-4 text-blue-600" />
          <span>4. Logistics</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-bold border border-blue-200">Scope 3</span>
        </button>
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        
        {/* Section 1: Energy & Fuels */}
        {activeTab === 'energy' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className={labelStyle}>Annual Electricity Draw</label>
                <span className="text-[10px] text-slate-400 font-medium">kWh / yr</span>
              </div>
              <input
                type="number"
                name="electricityKw"
                value={formData.electricityKw}
                onChange={handleChange}
                className={inputStyle}
              />
              <span className="text-[11px] font-medium text-slate-500">Scope 2 indirect electricity consumption from grid</span>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className={labelStyle}>Renewable Power Mix Share</label>
                <span className="text-[10px] text-slate-400 font-medium">%</span>
              </div>
              <input
                type="number"
                name="renewablePct"
                min="0"
                max="100"
                value={formData.renewablePct}
                onChange={handleChange}
                className={inputStyle}
              />
              <span className="text-[11px] font-medium text-slate-500">On-site solar, wind, or verified green PPA ratio</span>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className={labelStyle}>Annual Diesel Fuel Usage</label>
                <span className="text-[10px] text-slate-400 font-medium">Liters / yr</span>
              </div>
              <input
                type="number"
                name="dieselLiters"
                value={formData.dieselLiters}
                onChange={handleChange}
                className={inputStyle}
              />
              <span className="text-[11px] font-medium text-slate-500">Scope 1 furnace, backup generators & stationary combustion</span>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className={labelStyle}>Coal Consumption</label>
                <span className="text-[10px] text-slate-400 font-medium">Tonnes / yr</span>
              </div>
              <input
                type="number"
                name="coalTonnes"
                value={formData.coalTonnes}
                onChange={handleChange}
                className={inputStyle}
              />
              <span className="text-[11px] font-medium text-slate-500">Scope 1 direct solid fuel boiler combustion</span>
            </div>

            <div className="space-y-1 md:col-span-2">
              <div className="flex items-center justify-between">
                <label className={labelStyle}>Natural Gas Consumption</label>
                <span className="text-[10px] text-slate-400 font-medium">m³ / yr</span>
              </div>
              <input
                type="number"
                name="naturalGasM3"
                value={formData.naturalGasM3}
                onChange={handleChange}
                className={inputStyle}
              />
              <span className="text-[11px] font-medium text-slate-500">Scope 1 thermal process heating & direct pipeline combustion</span>
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
                placeholder="e.g. Steel, Cotton, Aluminum, Paper"
                className={inputStyle}
              />
              <span className="text-[11px] font-medium text-slate-500">Determines cradle-to-gate extraction emission coefficient</span>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className={labelStyle}>Annual Material Input</label>
                <span className="text-[10px] text-slate-400 font-medium">Tonnes / yr</span>
              </div>
              <input
                type="number"
                name="rawMaterialQuantityTonnes"
                value={formData.rawMaterialQuantityTonnes}
                onChange={handleChange}
                className={inputStyle}
              />
              <span className="text-[11px] font-medium text-slate-500">Total raw feedstocks processed annually</span>
            </div>

            <div className="space-y-1 md:col-span-2">
              <div className="flex items-center justify-between">
                <label className={labelStyle}>Secondary Recycled Feedstock Ratio</label>
                <span className="text-[10px] text-slate-400 font-medium">%</span>
              </div>
              <input
                type="number"
                name="recycledMaterialPct"
                min="0"
                max="100"
                value={formData.recycledMaterialPct}
                onChange={handleChange}
                className={inputStyle}
              />
              <span className="text-[11px] font-medium text-slate-500">Higher circular recycled content slashes upstream Scope 3 extraction footprint</span>
            </div>
          </div>
        )}

        {/* Section 3: Waste Streams */}
        {activeTab === 'waste' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className={labelStyle}>Total Annual Process Waste</label>
                <span className="text-[10px] text-slate-400 font-medium">Tonnes / yr</span>
              </div>
              <input
                type="number"
                name="wasteGeneratedTonnes"
                value={formData.wasteGeneratedTonnes}
                onChange={handleChange}
                className={inputStyle}
              />
              <span className="text-[11px] font-medium text-slate-500">Scope 3 end-of-life byproduct & scrap generation</span>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className={labelStyle}>Waste Recycling / Diversion Rate</label>
                <span className="text-[10px] text-slate-400 font-medium">%</span>
              </div>
              <input
                type="number"
                name="wasteRecycledPct"
                min="0"
                max="100"
                value={formData.wasteRecycledPct}
                onChange={handleChange}
                className={inputStyle}
              />
              <span className="text-[11px] font-medium text-slate-500">Share diverted from municipal or industrial landfill</span>
            </div>
          </div>
        )}

        {/* Section 4: Transport */}
        {activeTab === 'transport' && (
          <div className="space-y-4">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className={labelStyle}>Total Logistics Haul Distance</label>
                <span className="text-[10px] text-slate-400 font-medium">km / yr</span>
              </div>
              <input
                type="number"
                name="transportDistanceKm"
                value={formData.transportDistanceKm}
                onChange={handleChange}
                className={inputStyle}
              />
              <span className="text-[11px] font-medium text-slate-500">Scope 3 Category 4 & 9 freight hauling distance for materials & distribution</span>
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
