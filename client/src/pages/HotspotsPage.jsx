import React, { useState } from 'react';
import { useFactory } from '../context/FactoryContext';
import { HotspotCard } from '../components/hotspots/HotspotCard';
import { HotspotDetailModal } from '../components/hotspots/HotspotDetailModal';
import { Flame, AlertTriangle, CheckCircle2, TrendingDown } from 'lucide-react';

export const HotspotsPage = () => {
  const { activeFactory, loading } = useFactory();
  const [selectedHotspot, setSelectedHotspot] = useState(null);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-28 bg-slate-200/60 animate-pulse rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="h-72 bg-slate-200/60 animate-pulse rounded-2xl" />
          <div className="h-72 bg-slate-200/60 animate-pulse rounded-2xl" />
          <div className="h-72 bg-slate-200/60 animate-pulse rounded-2xl" />
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

  const hotspots = activeFactory.hotspots || [];
  const criticalCount = hotspots.filter(h => h.severity?.toUpperCase() === 'CRITICAL').length;
  const highCount = hotspots.filter(h => h.severity?.toUpperCase() === 'HIGH').length;
  const totalPotentialSavings = hotspots.reduce((acc, h) => acc + (h.potentialCo2Savings || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700/50 shadow-lg rounded-2xl relative overflow-hidden p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <Flame className="w-5 h-5 text-red-400 animate-pulse drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
              <h2 className="text-lg font-bold tracking-tight text-white">Industrial Emission Leak Point Diagnostics</h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Process-level diagnostic scan for <span className="font-semibold text-emerald-400">{activeFactory.name}</span> ({activeFactory.industry}).
            </p>
          </div>

          {/* KPI Snapshot Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-800/80 border border-slate-700 text-slate-300">
              <span>{hotspots.length}</span> Active Leak Points
            </span>
            {criticalCount > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-950/60 border border-red-800 text-red-300">
                <AlertTriangle className="w-3 h-3 text-red-400" />
                <span>{criticalCount} Critical</span>
              </span>
            )}
            {highCount > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-950/60 border border-amber-800 text-amber-300">
                <span>{highCount} High Priority</span>
              </span>
            )}
            {totalPotentialSavings > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/60 border border-emerald-800 text-emerald-300">
                <TrendingDown className="w-3 h-3 text-emerald-400" />
                <span>-{totalPotentialSavings.toLocaleString()} tCO₂e / yr recoverable</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Grid or Empty State */}
      {hotspots.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200/60 shadow-sm space-y-3">
          <div className="inline-flex p-3 bg-emerald-50 rounded-full text-emerald-600">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Zero Critical Emission Hotspots Flagged</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            All current process lines are operating within standard thresholds. Update operational inputs or recalculate to refresh diagnostic telemetry.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hotspots.map((hotspot) => (
            <HotspotCard
              key={hotspot.id}
              hotspot={hotspot}
              onSelect={(h) => setSelectedHotspot(h)}
            />
          ))}
        </div>
      )}

      <HotspotDetailModal hotspot={selectedHotspot} onClose={() => setSelectedHotspot(null)} />
    </div>
  );
};

export default HotspotsPage;

