import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useFactory } from '../../context/FactoryContext';
import { KPICard } from '../common/KPICard';
import { Factory, TrendingDown, DollarSign, Award, Flame, ArrowRight, ShieldCheck, MapPin } from 'lucide-react';

export const ExecutiveSummary = () => {
  const { activeFactory } = useFactory();
  const navigate = useNavigate();

  if (!activeFactory) return null;

  const m = activeFactory.metrics || {};
  const topHotspot = activeFactory.hotspots?.[0];

  return (
    <div className="space-y-5">
      
      {/* Top Banner Alert */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700/60 shadow-lg rounded-2xl relative overflow-hidden p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        
        {/* Left Side: Facility Title & Authenticity Chips */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-0.5 rounded-full text-[11px] font-semibold text-emerald-300">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>GHG Protocol Standardized</span>
            </div>
            <span className="text-[11px] font-medium text-slate-400 bg-slate-800/80 px-2.5 py-0.5 rounded-full border border-slate-700/60">
              Scope 1, 2 & 3 Deterministic
            </span>
          </div>

          <div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <span>{activeFactory.name}</span>
            </h2>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-0.5">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-slate-400" /> {activeFactory.location}
              </span>
              <span>•</span>
              <span className="text-slate-300 font-medium">{activeFactory.industry}</span>
              <span>•</span>
              <span>{activeFactory.size}</span>
            </div>
          </div>
        </div>

        {/* Right Side: Highest Emission Leak Point Callout */}
        {topHotspot && (
          <div className="flex items-center gap-3 bg-slate-800/90 border border-slate-700/90 px-4 py-3 rounded-xl text-xs shadow-inner flex-shrink-0 w-full md:w-auto justify-between md:justify-start">
            <div className="p-2 bg-red-500/10 text-red-400 rounded-lg border border-red-500/20 flex-shrink-0">
              <Flame className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Primary Leak Point</span>
              <p className="font-bold text-white truncate max-w-[200px] text-xs mt-0.5" title={topHotspot.title}>
                {topHotspot.title}
              </p>
              <span className="text-[10px] text-red-400 font-semibold">
                {topHotspot.annualEmissions?.toLocaleString()} tCO₂e/yr ({topHotspot.contributionPct}%)
              </span>
            </div>
            <button
              onClick={() => navigate('/hotspots')}
              className="ml-2 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded-lg transition-all font-semibold flex items-center gap-1 text-[11px] shadow-sm"
              title="Inspect Hotspots Details"
            >
              <span>Inspect</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* KPI Metric Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Estimated Emissions"
          value={m.totalEmissionsTonnes?.toLocaleString() || 0}
          unit="tCO₂e / yr"
          subtitle="Scope 1 (Direct) + Scope 2 (Grid) + Scope 3 (Supply Chain)"
          icon={Factory}
        />

        <KPICard
          title="Potential CO₂ Reduction"
          value={`-${m.potentialCo2Reduction?.toLocaleString() || 0}`}
          unit="tCO₂e / yr"
          subtitle="Identified Circular Interventions"
          icon={TrendingDown}
          trend={{ positive: true, text: "High Abatement Potential" }}
        />

        <KPICard
          title="Potential Annual Savings"
          value={`$${(m.potentialAnnualSavings || 0).toLocaleString()}`}
          unit="/ yr"
          subtitle="Operational Energy & Material Gains"
          icon={DollarSign}
          trend={{ positive: true, text: "Est. Payback ~1.5 yrs" }}
        />

        <KPICard
          title="EcoForge Health Index"
          value={`${m.sustainabilityScore || 50} / 100`}
          unit="Rating"
          subtitle={m.sustainabilityScore > 70 ? "Top-Tier Operational Efficiency" : "Significant Circular Potential"}
          icon={Award}
        />
      </div>

    </div>
  );
};
