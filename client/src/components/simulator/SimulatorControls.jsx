import React, { useState } from 'react';
import { useFactory } from '../../context/FactoryContext';
import { SlidersHorizontal, RefreshCw, TrendingDown, DollarSign, Award, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export const SimulatorControls = () => {
  const { activeFactory, executeSimulation, simulationResult, simulating } = useFactory();

  const [params, setParams] = useState({
    renewablePct: activeFactory?.operationalData?.renewablePct || 12,
    recycledMaterialPct: activeFactory?.operationalData?.recycledMaterialPct || 8,
    wasteRecycledPct: activeFactory?.operationalData?.wasteRecycledPct || 35,
    fuelReductionPct: 20,
    processEfficiencyPct: 15,
  });

  const handleSliderChange = (e) => {
    const { name, value } = e.target;
    setParams(prev => ({ ...prev, [name]: parseFloat(value) }));
  };

  const handleRunSimulation = () => {
    executeSimulation(params);
  };

  if (!activeFactory) return null;

  const baselineCO2 = activeFactory.metrics?.totalEmissionsTonnes || 18450;
  const sim = simulationResult?.simulated;
  const deltas = simulationResult?.deltas;

  const chartData = [
    {
      name: 'Total CO2 Output',
      Baseline: baselineCO2,
      Simulated: sim ? sim.totalEmissionsTonnes : Math.round(baselineCO2 * 0.68),
    }
  ];

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold tracking-tight flex items-center gap-2 text-white">
            <SlidersHorizontal className="w-5 h-5 text-emerald-400" />
            Interactive Industrial Decarbonization Simulator
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Adjust operational levers to simulate real-time carbon reduction, financial savings, and payback scenarios.
          </p>
        </div>
        <button
          onClick={handleRunSimulation}
          disabled={simulating}
          className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-5 py-2.5 rounded-xl shadow-md transition-all disabled:opacity-50"
        >
          {simulating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-emerald-200" />}
          <span>Run Simulation Engine</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Sliders Column */}
        <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm p-6 transition-all duration-300 hover:shadow-lg space-y-6 lg:col-span-1">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 pb-3">
            Simulation Operational Levers
          </h3>

          {/* Slider 1: Renewable Energy */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-semibold">
              <span className="text-slate-700">Renewable Power Mix</span>
              <span className="text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full ring-1 ring-emerald-600/20 font-bold">{params.renewablePct}%</span>
            </div>
            <input
              type="range"
              name="renewablePct"
              min="0"
              max="100"
              value={params.renewablePct}
              onChange={handleSliderChange}
              className="w-full accent-emerald-600 cursor-pointer h-2 bg-slate-100 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>Baseline: {activeFactory.operationalData?.renewablePct || 12}%</span>
              <span>Target: 100% Green</span>
            </div>
          </div>

          {/* Slider 2: Recycled Feedstock */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-semibold">
              <span className="text-slate-700">Secondary Recycled Feedstock</span>
              <span className="text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full ring-1 ring-emerald-600/20 font-bold">{params.recycledMaterialPct}%</span>
            </div>
            <input
              type="range"
              name="recycledMaterialPct"
              min="0"
              max="100"
              value={params.recycledMaterialPct}
              onChange={handleSliderChange}
              className="w-full accent-emerald-600 cursor-pointer h-2 bg-slate-100 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>Baseline: {activeFactory.operationalData?.recycledMaterialPct || 8}%</span>
              <span>Target: 100% Scrap</span>
            </div>
          </div>

          {/* Slider 3: Fuel Reduction */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-semibold">
              <span className="text-slate-700">Direct Diesel/Thermal Cut</span>
              <span className="text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full ring-1 ring-teal-600/20 font-bold">-{params.fuelReductionPct}%</span>
            </div>
            <input
              type="range"
              name="fuelReductionPct"
              min="0"
              max="60"
              value={params.fuelReductionPct}
              onChange={handleSliderChange}
              className="w-full accent-emerald-600 cursor-pointer h-2 bg-slate-100 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>0% (No Heat Recov)</span>
              <span>-60% Max Heat Recov</span>
            </div>
          </div>

          {/* Slider 4: Waste Diversion */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-semibold">
              <span className="text-slate-700">Waste Recycling / Circular Loop</span>
              <span className="text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full ring-1 ring-emerald-600/20 font-bold">{params.wasteRecycledPct}%</span>
            </div>
            <input
              type="range"
              name="wasteRecycledPct"
              min="0"
              max="100"
              value={params.wasteRecycledPct}
              onChange={handleSliderChange}
              className="w-full accent-emerald-600 cursor-pointer h-2 bg-slate-100 rounded-lg"
            />
          </div>

          <button
            onClick={handleRunSimulation}
            disabled={simulating}
            className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center space-x-2 shadow-md transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${simulating ? 'animate-spin' : ''}`} />
            <span>Recalculate Scenario</span>
          </button>
        </div>

        {/* Results & Comparison Column */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Comparison Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-6 bg-white rounded-2xl border border-slate-200/70 shadow-sm transition-all hover:shadow-lg">
              <span className="text-sm font-medium text-slate-500 uppercase tracking-wider block">CO2 Reduction Delta</span>
              <span className="text-4xl font-extrabold text-emerald-600 tracking-tight block mt-2">
                -{deltas ? deltas.co2ReductionTonnes.toLocaleString() : Math.round(baselineCO2 * 0.32).toLocaleString()}
              </span>
              <span className="text-xs font-semibold text-emerald-600 block mt-1">
                ({deltas ? deltas.co2ReductionPct : '32.0'}% Reduction)
              </span>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-slate-200/70 shadow-sm transition-all hover:shadow-lg">
              <span className="text-sm font-medium text-slate-500 uppercase tracking-wider block">Est. Annual Cost Savings</span>
              <span className="text-4xl font-extrabold text-slate-900 tracking-tight block mt-2">
                ${deltas ? deltas.estimatedSavingsUSD.toLocaleString() : '384,000'}
              </span>
              <span className="text-xs font-medium text-slate-500 block mt-1">/ year operational gain</span>
            </div>

            <div className="p-6 bg-slate-900 text-white rounded-2xl shadow-md border border-slate-800">
              <span className="text-sm font-medium text-slate-400 uppercase tracking-wider block">Projected Score</span>
              <span className="text-4xl font-extrabold text-emerald-400 tracking-tight block mt-2">
                {deltas ? deltas.newSustainabilityScore : 74} <span className="text-base text-slate-400 font-normal">/ 100</span>
              </span>
              <span className="text-xs text-slate-400 block mt-1">Industry Top Tier</span>
            </div>
          </div>

          {/* Chart Baseline vs Simulated */}
          <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm p-6 transition-all duration-300 hover:shadow-lg space-y-4">
            <h3 className="text-base font-bold text-slate-900 tracking-tight">Baseline vs Simulated Footprint (tCO2e/yr)</h3>
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#0F172A' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Baseline" fill="#0f172a" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="Simulated" fill="#10b981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
