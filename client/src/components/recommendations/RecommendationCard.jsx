import React from 'react';
import { FeasibilityBadge } from '../common/Badge';
import { Recycle, TrendingDown, DollarSign, Clock, ArrowRight, ShieldCheck } from 'lucide-react';

export const RecommendationCard = ({ rec, onSelect }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col justify-between space-y-4">
      
      {/* Top Meta */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold tracking-widest text-emerald-700 bg-emerald-50 ring-1 ring-emerald-600/20 px-3 py-1 rounded-full uppercase">
            {rec.category}
          </span>
          <FeasibilityBadge text={rec.feasibility} score={rec.feasibilityScore} />
        </div>

        <div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight">{rec.title}</h3>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">{rec.whyRecommended}</p>
        </div>

        {/* Current vs Intervention */}
        <div className="grid grid-cols-2 gap-2 text-xs pt-1">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">Current Situation</span>
            <p className="text-slate-900 text-[11px] mt-0.5">{rec.currentSituation}</p>
          </div>

          <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100">
            <span className="text-[10px] font-semibold text-emerald-800 uppercase tracking-wider block">Proposed Solution</span>
            <p className="text-emerald-950 text-[11px] mt-0.5">{rec.proposedIntervention}</p>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="pt-3 border-t border-slate-200/70 space-y-3">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2.5 bg-emerald-50/60 rounded-xl border border-emerald-100">
            <span className="text-[10px] font-medium text-slate-500 block uppercase tracking-wider">CO2 Cut</span>
            <span className="text-xs font-black text-emerald-700">-{rec.co2ReductionTonnes?.toLocaleString()} tCO2e</span>
            <span className="text-[9px] text-emerald-600 block font-semibold">({rec.co2ReductionPct}% cut)</span>
          </div>

          <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/60">
            <span className="text-[10px] font-medium text-slate-500 block uppercase tracking-wider">Annual Savings</span>
            <span className="text-xs font-black text-slate-900">${(rec.annualSavingsUSD || 0).toLocaleString()}</span>
            <span className="text-[9px] text-slate-500 block">/ year</span>
          </div>

          <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/60">
            <span className="text-[10px] font-medium text-slate-500 block uppercase tracking-wider">Payback</span>
            <span className="text-xs font-black text-slate-900">{rec.paybackPeriodYears} yrs</span>
            <span className="text-[9px] text-slate-500 block">Capex: ${(rec.implementationCostUSD || 0).toLocaleString()}</span>
          </div>
        </div>

        <button
          onClick={() => onSelect(rec)}
          className="w-full py-2.5 bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 shadow-md hover:shadow-lg transition-all"
        >
          <span>View Implementation Roadmap</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
