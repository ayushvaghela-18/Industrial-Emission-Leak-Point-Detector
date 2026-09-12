import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SeverityBadge } from '../common/Badge';
import { X, Lightbulb } from 'lucide-react';

export const HotspotDetailModal = ({ hotspot, onClose }) => {
  const navigate = useNavigate();

  if (!hotspot) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white border border-slate-200/70 rounded-2xl shadow-2xl w-full max-w-xl p-6 space-y-5 text-slate-900">
        
        <div className="flex items-start justify-between border-b border-slate-200 pb-3">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <SeverityBadge severity={hotspot.severity} />
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">{hotspot.category}</span>
            </div>
            <h3 className="text-lg font-bold tracking-tight text-slate-900">{hotspot.title}</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Detailed Breakdown */}
        <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200/60">
          <div>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block">Annual Emission Mass</span>
            <span className="text-2xl font-extrabold text-red-600 tracking-tight">{hotspot.annualEmissions?.toLocaleString()} tCO₂e / yr</span>
          </div>

          <div>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block">Footprint Share</span>
            <span className="text-2xl font-extrabold text-slate-900 tracking-tight">{hotspot.contributionPct}% of Total</span>
          </div>
        </div>

        {/* Why it Matters & Root Cause */}
        <div className="space-y-3">
          <div>
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Root Cause Analysis</h4>
            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200/60">
              {hotspot.rootCause}
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Environmental & Regulatory Risk</h4>
            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200/60">
              {hotspot.impactAnalysis}
            </p>
          </div>
        </div>

        {/* Recommended Circular Intervention */}
        <div className="p-4 bg-emerald-50/70 border border-emerald-100 rounded-xl space-y-2">
          <div className="flex items-center space-x-2 text-emerald-900 font-bold text-xs">
            <Lightbulb className="w-4 h-4 text-emerald-600" />
            <span>Recommended Circular Intervention</span>
          </div>
          <p className="text-xs font-semibold text-emerald-950">{hotspot.primaryIntervention}</p>

          <div className="pt-2 flex items-center justify-between text-xs text-emerald-800 border-t border-emerald-200/60">
            <span>Potential Savings: <strong className="text-emerald-900">-{hotspot.potentialCo2Savings?.toLocaleString()} tCO₂e / yr</strong></span>
            <span>Est. Financial Return: <strong className="text-emerald-900">${hotspot.potentialCostSavings?.toLocaleString()} / yr</strong></span>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-200 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Close
          </button>
          <button
            onClick={() => {
              onClose();
              navigate('/recommendations');
            }}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-md hover:shadow-lg transition-all"
          >
            View Full Circular Action Plan
          </button>
        </div>

      </div>
    </div>
  );
};
