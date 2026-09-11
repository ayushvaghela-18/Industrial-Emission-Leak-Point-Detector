import React, { useState } from 'react';
import { useFactory } from '../../context/FactoryContext';
import { SeverityBadge } from '../common/Badge';
import { Flame, ArrowUpRight } from 'lucide-react';
import { HotspotDetailModal } from '../hotspots/HotspotDetailModal';

export const HotspotSummary = () => {
  const { activeFactory, setActiveTab } = useFactory();
  const [selectedHotspot, setSelectedHotspot] = useState(null);

  if (!activeFactory || !activeFactory.hotspots) return null;

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 transition-all hover:shadow-md p-5 space-y-4">
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-red-100 text-red-600 rounded-lg">
              <Flame className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#0F172A]">Identified Emission Leak Points</h3>
              <p className="text-xs text-[#64748B]">Ranked by carbon mass contribution</p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('hotspots')}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
          >
            View All ({activeFactory.hotspots.length}) <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeFactory.hotspots.map((hotspot) => (
            <div
              key={hotspot.id}
              onClick={() => setSelectedHotspot(hotspot)}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-100/80 transition-all hover:shadow-sm cursor-pointer group flex flex-col justify-between space-y-3"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <SeverityBadge severity={hotspot.severity} />
                  <span className="text-xs font-bold text-[#0F172A] bg-white px-2 py-0.5 rounded border border-slate-200">
                    {hotspot.contributionPct}% of total
                  </span>
                </div>
                <h4 className="text-sm font-bold text-[#0F172A] group-hover:text-[#0B3D2E] transition-colors">
                  {hotspot.title}
                </h4>
                <p className="text-xs text-[#64748B] line-clamp-2">{hotspot.rootCause}</p>
              </div>

              <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                <span className="text-[#64748B]">Annual Output:</span>
                <span className="font-bold text-[#DC2626]">{hotspot.annualEmissions.toLocaleString()} tCO2e/yr</span>
              </div>
            </div>
          ))}
        </div>

      </div>

      <HotspotDetailModal hotspot={selectedHotspot} onClose={() => setSelectedHotspot(null)} />
    </>
  );
};
