import React, { useState } from 'react';
import { useFactory } from '../context/FactoryContext';
import { RecommendationCard } from '../components/recommendations/RecommendationCard';
import { RecommendationDetailModal } from '../components/recommendations/RecommendationDetailModal';
import { Recycle, Sparkles } from 'lucide-react';

export const RecommendationsPage = () => {
  const { activeFactory } = useFactory();
  const [selectedRec, setSelectedRec] = useState(null);

  if (!activeFactory || !activeFactory.recommendations) return null;

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-md flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <Recycle className="w-6 h-6 text-emerald-400" />
            <h2 className="text-lg font-bold tracking-tight text-white">Circular Economy & Decarbonization Action Plan</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Prioritized circular solutions tailored to reduce CO2 emissions and maximize financial payback for <span className="font-semibold text-white">{activeFactory.name}</span>.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeFactory.recommendations.map((rec) => (
          <RecommendationCard
            key={rec.id}
            rec={rec}
            onSelect={(r) => setSelectedRec(r)}
          />
        ))}
      </div>

      <RecommendationDetailModal recommendation={selectedRec} onClose={() => setSelectedRec(null)} />
    </div>
  );
};
