import React from 'react';
import { X, CheckCircle2, DollarSign, TrendingDown, Clock, ShieldCheck, ArrowRight } from 'lucide-react';
import { FeasibilityBadge } from '../common/Badge';

export const RecommendationDetailModal = ({ recommendation, onClose }) => {
  if (!recommendation) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-surface-card border border-surface-border rounded-xl shadow-panel w-full max-w-xl p-6 space-y-5">
        
        <div className="flex items-start justify-between border-b border-surface-border pb-3">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-bold tracking-widest text-emerald-700 bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-full uppercase">
                {recommendation.category}
              </span>
              <FeasibilityBadge text={recommendation.feasibility} score={recommendation.feasibilityScore} />
            </div>
            <h3 className="text-lg font-bold text-slate-primary">{recommendation.title}</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-secondary hover:text-slate-primary">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Financial & Environmental ROI Summary */}
        <div className="grid grid-cols-3 gap-3 p-4 bg-forest-900 text-white rounded-xl">
          <div>
            <span className="text-[10px] text-slate-300 block">CO2 Reduction</span>
            <span className="text-base font-extrabold text-emerald-400">-{recommendation.co2ReductionTonnes?.toLocaleString()} tCO2e</span>
            <span className="text-[10px] text-slate-300 block">({recommendation.co2ReductionPct}% reduction)</span>
          </div>

          <div>
            <span className="text-[10px] text-slate-300 block">Annual Cost Savings</span>
            <span className="text-base font-extrabold text-white">${(recommendation.annualSavingsUSD || 0).toLocaleString()}</span>
            <span className="text-[10px] text-slate-300 block">/ year</span>
          </div>

          <div>
            <span className="text-[10px] text-slate-300 block">Capital Payback</span>
            <span className="text-base font-extrabold text-emerald-300">{recommendation.paybackPeriodYears} Years</span>
            <span className="text-[10px] text-slate-300 block">Capex: ${(recommendation.implementationCostUSD || 0).toLocaleString()}</span>
          </div>
        </div>

        {/* Rationale & Comparison */}
        <div className="space-y-3">
          <div>
            <h4 className="text-xs font-bold text-slate-primary uppercase tracking-wider mb-1">Why Recommended</h4>
            <p className="text-xs text-slate-secondary leading-relaxed bg-slate-50 p-3 rounded-lg border border-surface-border">
              {recommendation.whyRecommended}
            </p>
          </div>

          {recommendation.steps && (
            <div>
              <h4 className="text-xs font-bold text-slate-primary uppercase tracking-wider mb-2">Implementation Milestones</h4>
              <div className="space-y-2">
                {recommendation.steps.map((step, idx) => (
                  <div key={idx} className="flex items-center space-x-2 text-xs text-slate-primary bg-white p-2.5 rounded-lg border border-surface-border">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Phase {idx + 1}: {step}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="pt-2 border-t border-surface-border flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-md"
          >
            Close Roadmap
          </button>
        </div>

      </div>
    </div>
  );
};
