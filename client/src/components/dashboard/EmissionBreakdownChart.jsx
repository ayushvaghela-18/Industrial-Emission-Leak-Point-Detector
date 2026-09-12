import React from 'react';
import { useFactory } from '../../context/FactoryContext';
import { 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis 
} from 'recharts';
import { PieChart as PieIcon, BarChart2, AlertCircle } from 'lucide-react';

const CHART_COLORS = ['#0f172a', '#10b981', '#14b8a6', '#f59e0b', '#f43f5e'];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const d = payload[0].payload;
    return (
      <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl border border-slate-700/80 text-xs space-y-1">
        <p className="font-bold text-white text-xs">{d.category}</p>
        <p className="text-emerald-400 font-semibold text-xs">
          {d.amount?.toLocaleString()} tCO₂e ({d.pct}%)
        </p>
        <span className="text-[10px] text-slate-400 block">{d.scope}</span>
      </div>
    );
  }
  return null;
};

export const EmissionBreakdownChart = () => {
  const { activeFactory } = useFactory();

  if (!activeFactory) return null;

  const data = activeFactory.breakdown || [];

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-8 text-center space-y-3">
        <AlertCircle className="w-8 h-8 text-slate-400 mx-auto" />
        <h3 className="text-sm font-bold text-slate-900">No Emission Breakdown Available</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Operational process metrics have not yet been recorded for this facility. Please submit baseline telemetry in the Data Input section.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      
      {/* Donut Category Breakdown */}
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <PieIcon className="w-5 h-5 text-emerald-600" />
              <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">Category Contribution</h3>
            </div>
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">By Operational Stream</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={92}
                  paddingAngle={4}
                  dataKey="amount"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Legend */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100">
          {data.map((item, idx) => (
            <div key={idx} className="flex items-center space-x-2 text-xs">
              <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }}></span>
              <span className="text-slate-600 truncate flex-1">{item.category}</span>
              <span className="font-bold text-slate-900">{item.pct}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bar Chart ranking */}
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <BarChart2 className="w-5 h-5 text-emerald-600" />
              <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">Emissions Ranking (tCO₂e)</h3>
            </div>
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Deterministic Mass</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, left: 35, bottom: 5 }}>
                <XAxis type="number" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <YAxis dataKey="category" type="category" width={115} tick={{ fontSize: 10, fill: '#0F172A' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="amount" radius={[0, 4, 4, 0]}>
                  {data.map((entry, index) => (
                    <Cell key={`cell-bar-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <p className="text-[11px] text-slate-500 pt-3 border-t border-slate-100">
          * Deterministic calculations strictly follow GHG Protocol Scope 1 (Direct), Scope 2 (Grid) & Scope 3 (Supply Chain) factors.
        </p>
      </div>

    </div>
  );
};
