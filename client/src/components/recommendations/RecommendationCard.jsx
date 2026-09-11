import React from 'react';
import { FeasibilityBadge } from '../common/Badge';
import { Recycle, TrendingDown, DollarSign, Clock, ArrowRight, ShieldCheck } from 'lucide-react';

export const RecommendationCard = ({ rec, onSelect }) => {
  return (
    <div className="bg-surface-card border border-surface-border rounded-xl p-5 shadow-card hover:shadow-card-hover transition-all duration-200 flex flex-col justify-between space-y-4">
      
      {/* Top Meta */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold tracking-widest text-emerald-700 bg-emerald-100/70 border border-emerald-200 px-2.5 py-0.5 rounded-full uppercase">
            {rec.category}
          </span>
          <FeasibilityBadge text={rec.feasibility} score={rec.feasibilityScore} />
        </div>

        <div>
          <h3 className="text-base font-bold text-slate-primary">{rec.title}</h3>
          <p className="text-xs text-slate-secondary mt-1 leading-relaxed">{rec.whyRecommended}</p>
        </div>

        {/* Current vs Intervention */}
        <div className="grid grid-cols-2 gap-2 text-xs pt-1">
          <div className="p-2.5 bg-slate-50 rounded-lg border border-surface-border">
            <span className="text-[10px] font-bold text-slate-secondary uppercase block">Current Situation</span>
            <p className="text-slate-primary text-[11px] mt-0.5">{rec.currentSituation}</p>
          </div>

          <div className="p-2.5 bg-emerald-50/60 rounded-lg border border-emerald-100">
            <span className="text-[10px] font-bold text-emerald-800 uppercase block">Proposed Solution</span>
            <p className="text-emerald-950 text-[11px] mt-0.5">{rec.proposedIntervention}</p>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="pt-3 border-t border-surface-border space-y-3">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2 bg-emerald-50 rounded-lg border border-emerald-100">
            <span className="text-[10px] text-slate-secondary block">CO2 Reduction</span>
            <span className="text-xs font-black text-emerald-700">-{rec.co2ReductionTonnes?.toLocaleString()} tCO2e</span>
            <span className="text-[9px] text-emerald-600 block">({rec.co2ReductionPct}% cut)</span>
          </div>

          <div className="p-2 bg-slate-50 rounded-lg border border-surface-border">
            <span className="text-[10px] text-slate-secondary block">Annual Savings</span>
            <span className="text-xs font-black text-slate-primary">${(rec.annualSavingsUSD || 0).toLocaleString()}</span>
            <span className="text-[9px] text-slate-secondary block">/ year</span>
          </div>

          <div className="p-2 bg-slate-50 rounded-lg border border-surface-border">
            <span className="text-[10px] text-slate-secondary block">Payback Period</span>
            <span className="text-xs font-black text-forest-900">{rec.paybackPeriodYears} yrs</span>
            <span className="text-[9px] text-slate-secondary block">Capex: ${(rec.implementationCostUSD || 0).toLocaleString()}</span>
          </div>
        </div>

        <button
          onClick={() => onSelect(rec)}
          className="w-full py-2 bg-forest-900 hover:bg-forest-800 text-white rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors"
        >
          <span>View Implementation Roadmap</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
