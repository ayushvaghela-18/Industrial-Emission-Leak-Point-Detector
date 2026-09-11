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
      <div className="bg-forest-900 text-white rounded-xl p-5 border border-forest-800 shadow-md">
        <div className="flex items-center space-x-2">
          <Flame className="w-6 h-6 text-red-400 animate-pulse" />
          <h2 className="text-lg font-bold">Industrial Emission Leak Point Diagnostics</h2>
        </div>
        <p className="text-xs text-slate-300 mt-1">
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
