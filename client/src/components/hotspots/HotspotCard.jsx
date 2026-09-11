import React from 'react';
import { SeverityBadge } from '../common/Badge';
import { Flame, ArrowRight, DollarSign, TrendingDown, Info } from 'lucide-react';

export const HotspotCard = ({ hotspot, onSelect }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm p-6 transition-all duration-300 hover:shadow-lg flex flex-col justify-between space-y-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <SeverityBadge severity={hotspot.severity} />
          <span className="text-xs font-bold text-slate-700 bg-slate-100 ring-1 ring-slate-200 px-3 py-1 rounded-full">
            {hotspot.contributionPct}% Contribution
          </span>
        </div>

        <div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight">{hotspot.title}</h3>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">{hotspot.category}</p>
        </div>

        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/60 text-xs space-y-1">
          <p className="font-semibold text-slate-900 flex items-center gap-1">
            <Info className="w-3.5 h-3.5 text-emerald-600" /> Root Cause:
          </p>
          <p className="text-slate-600 text-[11px] leading-relaxed">{hotspot.rootCause}</p>
        </div>
      </div>

      <div className="pt-3 border-t border-slate-200/70 space-y-3">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-3 bg-red-50/60 rounded-xl border border-red-100">
            <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider block">Annual Emissions</span>
            <span className="font-extrabold text-red-700 text-sm">{hotspot.annualEmissions?.toLocaleString()} tCO2e</span>
          </div>

          <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100">
            <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider block">Potential CO2 Savings</span>
            <span className="font-extrabold text-emerald-700 text-sm">-{hotspot.potentialCo2Savings?.toLocaleString()} tCO2e</span>
          </div>
        </div>

        <button
          onClick={() => onSelect(hotspot)}
          className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 shadow-md transition-all"
        >
          <span>Inspect Leak Point Details</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
