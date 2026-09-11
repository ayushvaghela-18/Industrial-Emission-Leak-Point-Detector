import React from 'react';
import { SeverityBadge } from '../common/Badge';
import { Flame, X, CheckCircle2, TrendingDown, DollarSign, Lightbulb } from 'lucide-react';
import { useFactory } from '../../context/FactoryContext';

export const HotspotDetailModal = ({ hotspot, onClose }) => {
  const { setActiveTab } = useFactory();

  if (!hotspot) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-surface-card border border-surface-border rounded-xl shadow-panel w-full max-w-xl p-6 space-y-5">
        
        <div className="flex items-start justify-between border-b border-surface-border pb-3">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <SeverityBadge severity={hotspot.severity} />
              <span className="text-xs font-bold text-slate-secondary">{hotspot.category}</span>
            </div>
            <h3 className="text-lg font-bold text-slate-primary">{hotspot.title}</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-secondary hover:text-slate-primary">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Detailed Breakdown */}
        <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-surface-border">
          <div>
            <span className="text-xs text-slate-secondary block">Annual Emission Mass</span>
            <span className="text-xl font-extrabold text-critical">{hotspot.annualEmissions?.toLocaleString()} tCO2e/yr</span>
          </div>

          <div>
            <span className="text-xs text-slate-secondary block">Footprint Share</span>
            <span className="text-xl font-extrabold text-forest-900">{hotspot.contributionPct}% of Total</span>
          </div>
        </div>

        {/* Why it Matters & Root Cause */}
        <div className="space-y-3">
          <div>
            <h4 className="text-xs font-bold text-slate-primary uppercase tracking-wider mb-1">Root Cause Analysis</h4>
            <p className="text-xs text-slate-secondary leading-relaxed bg-white p-3 rounded-lg border border-surface-border">
              {hotspot.rootCause}
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-primary uppercase tracking-wider mb-1">Environmental & Regulatory Risk</h4>
            <p className="text-xs text-slate-secondary leading-relaxed bg-white p-3 rounded-lg border border-surface-border">
              {hotspot.impactAnalysis}
            </p>
          </div>
        </div>

        {/* Recommended Circular Intervention */}
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
          <div className="flex items-center space-x-2 text-emerald-900 font-bold text-xs">
            <Lightbulb className="w-4 h-4 text-emerald-600" />
            <span>Recommended Circular Intervention</span>
          </div>
          <p className="text-xs font-semibold text-emerald-950">{hotspot.primaryIntervention}</p>

          <div className="pt-2 flex items-center justify-between text-xs text-emerald-800 border-t border-emerald-200">
            <span>Potential Savings: <strong className="text-emerald-900">-${hotspot.potentialCo2Savings?.toLocaleString()} tCO2e/yr</strong></span>
            <span>Est. Financial Return: <strong className="text-emerald-900">${hotspot.potentialCostSavings?.toLocaleString()}/yr</strong></span>
          </div>
        </div>

        <div className="pt-2 border-t border-surface-border flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-secondary hover:bg-slate-100"
          >
            Close
          </button>
          <button
            onClick={() => {
              onClose();
              setActiveTab('recommendations');
            }}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-md"
          >
            View Full Circular Action Plan
          </button>
        </div>

      </div>
    </div>
  );
};
