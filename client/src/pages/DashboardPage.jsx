import React from 'react';
import { ExecutiveSummary } from '../components/dashboard/ExecutiveSummary';
import { EmissionBreakdownChart } from '../components/dashboard/EmissionBreakdownChart';
import { HotspotSummary } from '../components/dashboard/HotspotSummary';
import { SustainabilityScoreCard } from '../components/dashboard/SustainabilityScoreCard';
import { useFactory } from '../context/FactoryContext';
import { ArrowUpRight } from 'lucide-react';

export const DashboardPage = () => {
  const { activeFactory, setActiveTab } = useFactory();

  const topRec = activeFactory?.recommendations?.[0];

  return (
    <div className="space-y-6">
      <ExecutiveSummary />
      <EmissionBreakdownChart />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <HotspotSummary />
        </div>
        <div className="space-y-6">
          <SustainabilityScoreCard />

          {/* Top Recommendation Highlight */}
          {topRec && (
            <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Top Priority Intervention</span>
                <button
                  onClick={() => setActiveTab('recommendations')}
                  className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                >
                  View All <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-100 space-y-1.5">
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">{topRec.category}</span>
                <h4 className="text-xs font-bold text-emerald-950">{topRec.title}</h4>
                <div className="flex justify-between text-xs text-emerald-900 font-medium">
                  <span>Savings: -{topRec.co2ReductionTonnes?.toLocaleString()} tCO2e</span>
                  <span>ROI: {topRec.paybackPeriodYears} yrs</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
