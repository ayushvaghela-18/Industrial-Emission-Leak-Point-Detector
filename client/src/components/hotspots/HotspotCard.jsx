import React from 'react';
import { SeverityBadge } from '../common/Badge';
import { Flame, ArrowRight, DollarSign, TrendingDown, Info } from 'lucide-react';

export const HotspotCard = ({ hotspot, onSelect }) => {
  return (
    <div className="bg-surface-card border border-surface-border rounded-xl p-5 shadow-card hover:shadow-card-hover transition-all duration-200 flex flex-col justify-between space-y-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <SeverityBadge severity={hotspot.severity} />
          <span className="text-xs font-extrabold text-forest-900 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
            {hotspot.contributionPct}% Contribution
          </span>
        </div>

        <div>
          <h3 className="text-base font-bold text-slate-primary">{hotspot.title}</h3>
          <p className="text-xs text-slate-secondary mt-1">{hotspot.category}</p>
        </div>

        <div className="p-3 bg-slate-50 rounded-lg text-xs space-y-1">
          <p className="font-semibold text-slate-primary flex items-center gap-1">
            <Info className="w-3.5 h-3.5 text-forest-900" /> Root Cause:
          </p>
          <p className="text-slate-secondary text-[11px] leading-relaxed">{hotspot.rootCause}</p>
        </div>
      </div>

      <div className="pt-3 border-t border-surface-border space-y-3">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2 bg-red-50 rounded-md border border-red-100">
            <span className="text-[10px] text-slate-secondary block">Annual Emissions</span>
            <span className="font-bold text-critical text-sm">{hotspot.annualEmissions?.toLocaleString()} tCO2e</span>
          </div>

          <div className="p-2 bg-emerald-50 rounded-md border border-emerald-100">
            <span className="text-[10px] text-slate-secondary block">Potential CO2 Savings</span>
            <span className="font-bold text-emerald-700 text-sm">-{hotspot.potentialCo2Savings?.toLocaleString()} tCO2e</span>
          </div>
        </div>

        <button
          onClick={() => onSelect(hotspot)}
          className="w-full py-2 bg-forest-900 hover:bg-forest-800 text-white rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors"
        >
          <span>Inspect Leak Point Details</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
