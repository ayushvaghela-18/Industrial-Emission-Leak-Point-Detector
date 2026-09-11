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
      <div className="bg-forest-900 text-white rounded-xl p-5 border border-forest-800 shadow-md flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-teal-400" />
            Interactive Industrial Decarbonization Simulator
          </h2>
          <p className="text-xs text-slate-300">
            Adjust operational levers to simulate real-time carbon reduction, financial savings, and payback scenarios.
          </p>
        </div>
        <button
          onClick={handleRunSimulation}
          disabled={simulating}
          className="flex items-center space-x-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow-md transition-all disabled:opacity-50"
        >
          {simulating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-emerald-200" />}
          <span>Run Simulation Engine</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Sliders Column */}
        <div className="bg-surface-card border border-surface-border rounded-xl p-5 shadow-card space-y-5 lg:col-span-1">
          <h3 className="text-xs font-bold text-slate-primary uppercase tracking-wider border-b border-surface-border pb-2">
            Simulation Operational Levers
          </h3>

          {/* Slider 1: Renewable Energy */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs font-semibold">
              <span className="text-slate-primary">Renewable Power Mix</span>
              <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">{params.renewablePct}%</span>
            </div>
            <input
              type="range"
              name="renewablePct"
              min="0"
              max="100"
              value={params.renewablePct}
              onChange={handleSliderChange}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-secondary">
              <span>Baseline: {activeFactory.operationalData?.renewablePct || 12}%</span>
              <span>Target: 100% Green</span>
            </div>
          </div>

          {/* Slider 2: Recycled Feedstock */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs font-semibold">
              <span className="text-slate-primary">Secondary Recycled Feedstock</span>
              <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">{params.recycledMaterialPct}%</span>
            </div>
            <input
              type="range"
              name="recycledMaterialPct"
              min="0"
              max="100"
              value={params.recycledMaterialPct}
              onChange={handleSliderChange}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-secondary">
              <span>Baseline: {activeFactory.operationalData?.recycledMaterialPct || 8}%</span>
              <span>Target: 100% Scrap</span>
            </div>
          </div>

          {/* Slider 3: Fuel Reduction */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs font-semibold">
              <span className="text-slate-primary">Direct Diesel/Thermal Cut</span>
              <span className="text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">-{params.fuelReductionPct}%</span>
            </div>
            <input
              type="range"
              name="fuelReductionPct"
              min="0"
              max="60"
              value={params.fuelReductionPct}
              onChange={handleSliderChange}
              className="w-full accent-teal-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-secondary">
              <span>0% (No Heat Recov)</span>
              <span>-60% Max Heat Recov</span>
            </div>
          </div>

          {/* Slider 4: Waste Diversion */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs font-semibold">
              <span className="text-slate-primary">Waste Recycling / Circular Loop</span>
              <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">{params.wasteRecycledPct}%</span>
            </div>
            <input
              type="range"
              name="wasteRecycledPct"
              min="0"
              max="100"
              value={params.wasteRecycledPct}
              onChange={handleSliderChange}
              className="w-full accent-emerald-600 cursor-pointer"
            />
          </div>

          <button
            onClick={handleRunSimulation}
            disabled={simulating}
            className="w-full py-2.5 bg-forest-900 hover:bg-forest-800 text-white rounded-lg text-xs font-semibold flex items-center justify-center space-x-2 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${simulating ? 'animate-spin' : ''}`} />
            <span>Recalculate Scenario</span>
          </button>
        </div>

        {/* Results & Comparison Column */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Comparison Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-surface-card border border-surface-border rounded-xl shadow-card">
              <span className="text-xs text-slate-secondary block">CO2 Reduction Delta</span>
              <span className="text-xl font-extrabold text-emerald-700">
                -{deltas ? deltas.co2ReductionTonnes.toLocaleString() : Math.round(baselineCO2 * 0.32).toLocaleString()} tCO2e
              </span>
              <span className="text-[10px] text-emerald-600 block mt-1">
                ({deltas ? deltas.co2ReductionPct : '32.0'}% Reduction)
              </span>
            </div>

            <div className="p-4 bg-surface-card border border-surface-border rounded-xl shadow-card">
              <span className="text-xs text-slate-secondary block">Est. Annual Cost Savings</span>
              <span className="text-xl font-extrabold text-slate-primary">
                ${deltas ? deltas.estimatedSavingsUSD.toLocaleString() : '384,000'}
              </span>
              <span className="text-[10px] text-slate-secondary block mt-1">/ year operational gain</span>
            </div>

            <div className="p-4 bg-forest-900 text-white rounded-xl shadow-card">
              <span className="text-xs text-slate-300 block">Projected Score</span>
              <span className="text-xl font-extrabold text-emerald-400">
                {deltas ? deltas.newSustainabilityScore : 74} / 100
              </span>
              <span className="text-[10px] text-slate-300 block mt-1">Industry Top Tier</span>
            </div>
          </div>

          {/* Chart Baseline vs Simulated */}
          <div className="bg-surface-card border border-surface-border rounded-xl p-5 shadow-card space-y-4">
            <h3 className="text-sm font-bold text-slate-primary">Baseline vs Simulated Footprint (tCO2e/yr)</h3>
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#0F172A' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Baseline" fill="#DC2626" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Simulated" fill="#16A34A" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
