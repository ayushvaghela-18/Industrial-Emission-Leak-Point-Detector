import React from 'react';
import { X, CheckCircle2, DollarSign, TrendingDown, Clock, ShieldCheck, ArrowRight } from 'lucide-react';
import { FeasibilityBadge } from '../common/Badge';

export const RecommendationDetailModal = ({ recommendation, onClose }) => {
  if (!recommendation) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white border border-slate-200/70 rounded-2xl shadow-2xl w-full max-w-xl p-6 space-y-5 text-slate-900">
        
        <div className="flex items-start justify-between border-b border-slate-200 pb-3">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-bold tracking-widest text-emerald-700 bg-emerald-50 ring-1 ring-emerald-600/20 px-3 py-1 rounded-full uppercase">
                {recommendation.category}
              </span>
              <FeasibilityBadge text={recommendation.feasibility} score={recommendation.feasibilityScore} />
            </div>
            <h3 className="text-lg font-bold tracking-tight text-slate-900">{recommendation.title}</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Financial & Environmental ROI Summary */}
        <div className="grid grid-cols-3 gap-3 p-5 bg-slate-900 text-white rounded-2xl shadow-sm">
          <div>
            <span className="text-[10px] text-slate-400 block uppercase tracking-wider font-medium">CO2 Reduction</span>
            <span className="text-lg font-extrabold text-emerald-400">-{recommendation.co2ReductionTonnes?.toLocaleString()} tCO2e</span>
            <span className="text-[10px] text-slate-400 block">({recommendation.co2ReductionPct}% reduction)</span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 block uppercase tracking-wider font-medium">Annual Savings</span>
            <span className="text-lg font-extrabold text-white">${(recommendation.annualSavingsUSD || 0).toLocaleString()}</span>
            <span className="text-[10px] text-slate-400 block">/ year</span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 block uppercase tracking-wider font-medium">Payback</span>
            <span className="text-lg font-extrabold text-emerald-400">{recommendation.paybackPeriodYears} Years</span>
            <span className="text-[10px] text-slate-400 block">Capex: ${(recommendation.implementationCostUSD || 0).toLocaleString()}</span>
          </div>
        </div>

        {/* Rationale & Comparison */}
        <div className="space-y-3">
          <div>
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Why Recommended</h4>
            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200/60">
              {recommendation.whyRecommended}
            </p>
          </div>

          {recommendation.steps && (
            <div>
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Implementation Milestones</h4>
              <div className="space-y-2">
                {recommendation.steps.map((step, idx) => (
                  <div key={idx} className="flex items-center space-x-2 text-xs text-slate-800 bg-white p-3 rounded-xl border border-slate-200/80">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Phase {idx + 1}: {step}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="pt-2 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-md transition-all"
          >
            Close Roadmap
          </button>
        </div>

      </div>
    </div>
  );
};
