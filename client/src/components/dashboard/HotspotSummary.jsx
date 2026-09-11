import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFactory } from '../../context/FactoryContext';
import { SeverityBadge } from '../common/Badge';
import { Flame, ArrowUpRight } from 'lucide-react';
import { HotspotDetailModal } from '../hotspots/HotspotDetailModal';

export const HotspotSummary = () => {
  const { activeFactory } = useFactory();
  const navigate = useNavigate();
  const [selectedHotspot, setSelectedHotspot] = useState(null);

  if (!activeFactory || !activeFactory.hotspots) return null;

  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-4">
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-red-50 text-red-600 rounded-xl ring-1 ring-red-600/20">
              <Flame className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">Identified Emission Leak Points</h3>
              <p className="text-xs font-medium text-slate-500">Ranked by carbon mass contribution</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/hotspots')}
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
              className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-100/80 transition-all hover:shadow-sm cursor-pointer group flex flex-col justify-between space-y-3"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <SeverityBadge severity={hotspot.severity} />
                  <span className="text-xs font-bold text-slate-700 bg-white px-2.5 py-0.5 rounded-full border border-slate-200">
                    {hotspot.contributionPct}% of total
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                  {hotspot.title}
                </h4>
                <p className="text-xs text-slate-500 line-clamp-2">{hotspot.rootCause}</p>
              </div>

              <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-xs">
                <span className="text-slate-500">Annual Output:</span>
                <span className="font-bold text-red-600">{hotspot.annualEmissions.toLocaleString()} tCO2e/yr</span>
              </div>
            </div>
          ))}
        </div>

      </div>

      <HotspotDetailModal hotspot={selectedHotspot} onClose={() => setSelectedHotspot(null)} />
    </>
  );
};
