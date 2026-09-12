import React, { useState } from 'react';
import { useFactory } from '../context/FactoryContext';
import { RecommendationCard } from '../components/recommendations/RecommendationCard';
import { RecommendationDetailModal } from '../components/recommendations/RecommendationDetailModal';
import { Recycle, TrendingDown, DollarSign, CheckCircle2 } from 'lucide-react';

export const RecommendationsPage = () => {
  const { activeFactory, loading } = useFactory();
  const [selectedRec, setSelectedRec] = useState(null);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-28 bg-slate-200/60 animate-pulse rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="h-80 bg-slate-200/60 animate-pulse rounded-2xl" />
          <div className="h-80 bg-slate-200/60 animate-pulse rounded-2xl" />
          <div className="h-80 bg-slate-200/60 animate-pulse rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!activeFactory) {
    return (
      <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
        <p className="text-slate-600 font-medium">No facility selected.</p>
        <p className="text-xs text-slate-400 mt-1">Please select an industrial plant from the top navigation bar.</p>
      </div>
    );
  }

  const recommendations = activeFactory.recommendations || [];
  const totalSavingsUSD = recommendations.reduce((acc, r) => acc + (r.annualSavingsUSD || 0), 0);
  const totalCo2Cut = recommendations.reduce((acc, r) => acc + (r.co2ReductionTonnes || 0), 0);
  const highFeasibilityCount = recommendations.filter(
    r => (r.feasibility?.toLowerCase() || '').includes('high') || (r.feasibilityScore || 0) >= 80
  ).length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700/50 shadow-lg rounded-2xl relative overflow-hidden p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <Recycle className="w-5 h-5 text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              <h2 className="text-lg font-bold tracking-tight text-white">Circular Economy & Decarbonization Action Plan</h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Prioritized circular solutions tailored to reduce CO2 emissions and maximize financial payback for <span className="font-semibold text-emerald-400">{activeFactory.name}</span>.
            </p>
          </div>

          {/* Action Plan KPIs */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-800/80 border border-slate-700 text-slate-300">
              <span>{recommendations.length}</span> Interventions
            </span>
            {totalCo2Cut > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/60 border border-emerald-800 text-emerald-300">
                <TrendingDown className="w-3 h-3 text-emerald-400" />
                <span>-{totalCo2Cut.toLocaleString()} tCO₂e / yr</span>
              </span>
            )}
            {totalSavingsUSD > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-800/80 border border-slate-700 text-emerald-400">
                <DollarSign className="w-3 h-3 text-emerald-400" />
                <span>${totalSavingsUSD.toLocaleString()} / yr savings</span>
              </span>
            )}
            {highFeasibilityCount > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/60 border border-emerald-800 text-emerald-300">
                <span>{highFeasibilityCount} Immediate Feasibility</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Grid or Empty State */}
      {recommendations.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200/60 shadow-sm space-y-3">
          <div className="inline-flex p-3 bg-emerald-50 rounded-full text-emerald-600">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No Action Plans Generated Yet</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            Interventions will appear after running diagnostics on operational inputs or process telemetry.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendations.map((rec) => (
            <RecommendationCard
              key={rec.id}
              rec={rec}
              onSelect={(r) => setSelectedRec(r)}
            />
          ))}
        </div>
      )}

      <RecommendationDetailModal recommendation={selectedRec} onClose={() => setSelectedRec(null)} />
    </div>
  );
};

export default RecommendationsPage;

