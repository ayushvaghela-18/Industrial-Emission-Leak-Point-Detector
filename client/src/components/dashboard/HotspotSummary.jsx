import React, { useState } from 'react';
import { useFactory } from '../../context/FactoryContext';
import { SeverityBadge } from '../common/Badge';
import { Flame, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { HotspotDetailModal } from '../hotspots/HotspotDetailModal';

export const HotspotSummary = () => {
  const { activeFactory, setActiveTab } = useFactory();
  const [selectedHotspot, setSelectedHotspot] = useState(null);

  if (!activeFactory || !activeFactory.hotspots) return null;

  return (
    <>
      <div className="bg-surface-card border border-surface-border rounded-xl p-5 shadow-card space-y-4">
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-red-100 text-critical rounded-lg">
              <Flame className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-primary">Identified Emission Leak Points</h3>
              <p className="text-xs text-slate-secondary">Ranked by carbon mass contribution</p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('hotspots')}
            className="text-xs font-semibold text-forest-700 hover:text-forest-900 flex items-center gap-1"
          >
            View All ({activeFactory.hotspots.length}) <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeFactory.hotspots.map((hotspot) => (
            <div
              key={hotspot.id}
              onClick={() => setSelectedHotspot(hotspot)}
              className="p-4 rounded-xl border border-surface-border bg-slate-50/50 hover:bg-slate-100/80 transition-all cursor-pointer group flex flex-col justify-between space-y-3"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <SeverityBadge severity={hotspot.severity} />
                  <span className="text-xs font-bold text-slate-primary bg-white px-2 py-0.5 rounded border">
                    {hotspot.contributionPct}% of total
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-primary group-hover:text-forest-900 transition-colors">
                  {hotspot.title}
                </h4>
                <p className="text-xs text-slate-secondary line-clamp-2">{hotspot.rootCause}</p>
              </div>

              <div className="pt-2 border-t border-surface-border flex items-center justify-between text-xs">
                <span className="text-slate-secondary">Annual Output:</span>
                <span className="font-bold text-critical">{hotspot.annualEmissions.toLocaleString()} tCO2e/yr</span>
              </div>
            </div>
          ))}
        </div>

      </div>

      <HotspotDetailModal hotspot={selectedHotspot} onClose={() => setSelectedHotspot(null)} />
    </>
  );
};
