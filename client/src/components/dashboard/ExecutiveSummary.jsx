import React from 'react';
import { useFactory } from '../../context/FactoryContext';
import { KPICard } from '../common/KPICard';
import { Factory, TrendingDown, DollarSign, Award, Flame, ArrowRight, ShieldCheck } from 'lucide-react';

export const ExecutiveSummary = () => {
  const { activeFactory, setActiveTab } = useFactory();

  if (!activeFactory) return null;

  const m = activeFactory.metrics || {};
  const topHotspot = activeFactory.hotspots?.[0];

  return (
    <div className="space-y-6">
      
      {/* Top Banner Alert */}
      <div className="bg-[#0B3D2E] text-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-white">Industrial Sustainability & Decarbonization Intelligence</h2>
          </div>
          <p className="text-xs text-emerald-100/90">
            Real-time deterministic emission analysis for <span className="font-semibold text-white">{activeFactory.name}</span>.
          </p>
        </div>
        {topHotspot && (
          <div className="flex items-center gap-3 bg-[#194C3E] border border-emerald-700/50 px-4 py-2.5 rounded-lg text-xs">
            <Flame className="w-4 h-4 text-red-400 animate-pulse flex-shrink-0" />
            <div>
              <span className="text-emerald-200">Highest Emission Leak Point:</span>
              <p className="font-bold text-white truncate max-w-[220px]">{topHotspot.title}</p>
            </div>
            <button
              onClick={() => setActiveTab('hotspots')}
              className="ml-2 p-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md transition-colors"
              title="Inspect Hotspots"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* KPI Metric Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Estimated Emissions"
          value={m.totalEmissionsTonnes?.toLocaleString() || 0}
          unit="tCO2e / yr"
          subtitle="Deterministic Scope 1, 2, 3"
          icon={Factory}
        />

        <KPICard
          title="Potential CO2 Reduction"
          value={`-${m.potentialCo2Reduction?.toLocaleString() || 0}`}
          unit="tCO2e / yr"
          subtitle="Via Circular Interventions"
          icon={TrendingDown}
          trend={{ positive: true, text: "32% Decarbonization" }}
        />

        <KPICard
          title="Potential Annual Savings"
          value={`$${(m.potentialAnnualSavings || 0).toLocaleString()}`}
          unit="/ yr"
          subtitle="Energy & Material Savings"
          icon={DollarSign}
          trend={{ positive: true, text: "ROI 1.6 yrs" }}
        />

        <KPICard
          title="EcoForge Index Score"
          value={`${m.sustainabilityScore || 50} / 100`}
          unit="Rating"
          subtitle={m.sustainabilityScore > 70 ? "Top Tier Efficiency" : "Requires Optimization"}
          icon={Award}
        />
      </div>

    </div>
  );
};
