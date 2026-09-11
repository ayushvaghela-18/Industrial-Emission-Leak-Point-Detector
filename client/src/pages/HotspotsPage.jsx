import React, { useState } from 'react';
import { useFactory } from '../context/FactoryContext';
import { HotspotCard } from '../components/hotspots/HotspotCard';
import { HotspotDetailModal } from '../components/hotspots/HotspotDetailModal';
import { Flame, ShieldAlert } from 'lucide-react';

export const HotspotsPage = () => {
  const { activeFactory } = useFactory();
  const [selectedHotspot, setSelectedHotspot] = useState(null);

  if (!activeFactory || !activeFactory.hotspots) return null;

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700/50 shadow-lg rounded-2xl relative overflow-hidden p-6 text-white">
        <div className="flex items-center space-x-2">
          <Flame className="w-6 h-6 text-red-400 animate-pulse drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
          <h2 className="text-lg font-bold tracking-tight text-white">Industrial Emission Leak Point Diagnostics</h2>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Detailed breakdown of process inefficiencies, high-carbon fuel burn, and material extraction hotspots for <span className="font-semibold text-white">{activeFactory.name}</span>.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeFactory.hotspots.map((hotspot) => (
          <HotspotCard
            key={hotspot.id}
            hotspot={hotspot}
            onSelect={(h) => setSelectedHotspot(h)}
          />
        ))}
      </div>

      <HotspotDetailModal hotspot={selectedHotspot} onClose={() => setSelectedHotspot(null)} />
    </div>
  );
};
