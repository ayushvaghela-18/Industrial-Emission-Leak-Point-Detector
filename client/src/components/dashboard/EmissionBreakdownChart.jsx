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
  YAxis, 
  CartesianGrid 
} from 'recharts';
import { PieChart as PieIcon, BarChart2 } from 'lucide-react';

const CHART_COLORS = ['#0f172a', '#10b981', '#14b8a6', '#f59e0b', '#f43f5e'];

export const EmissionBreakdownChart = () => {
  const { activeFactory } = useFactory();

  if (!activeFactory || !activeFactory.breakdown) return null;

  const data = activeFactory.breakdown;

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs border border-slate-800">
          <p className="font-bold">{d.category}</p>
          <p className="text-emerald-400 font-semibold">{d.amount.toLocaleString()} tCO2e ({d.pct}%)</p>
          <span className="text-[10px] text-slate-400">{d.scope}</span>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      
      {/* Donut Category Breakdown */}
      <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm p-6 transition-all duration-300 hover:shadow-lg flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <PieIcon className="w-5 h-5 text-emerald-600" />
              <h3 className="text-base font-bold text-slate-900 tracking-tight">Emission Category Contribution</h3>
            </div>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">By Operational Stream</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={95}
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
        <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100">
          {data.map((item, idx) => (
            <div key={idx} className="flex items-center space-x-2 text-xs">
              <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }}></span>
              <span className="text-slate-500 truncate flex-1">{item.category}</span>
              <span className="font-bold text-slate-900">{item.pct}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bar Chart ranking */}
      <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm p-6 transition-all duration-300 hover:shadow-lg flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <BarChart2 className="w-5 h-5 text-emerald-600" />
              <h3 className="text-base font-bold text-slate-900 tracking-tight">Emissions Ranking (tCO2e)</h3>
            </div>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Deterministic Mass</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, left: 40, bottom: 5 }}>
                <XAxis type="number" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <YAxis dataKey="category" type="category" width={110} tick={{ fontSize: 10, fill: '#0F172A' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="amount" radius={[0, 6, 6, 0]}>
                  {data.map((entry, index) => (
                    <Cell key={`cell-bar-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <p className="text-[11px] text-slate-500 pt-3 border-t border-slate-100">
          * Calculated using GHG Protocol Scope 1, 2 & Scope 3 upstream factors.
        </p>
      </div>

    </div>
  );
};
