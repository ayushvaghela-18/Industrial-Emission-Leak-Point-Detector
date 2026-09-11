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

export const EmissionBreakdownChart = () => {
  const { activeFactory } = useFactory();

  if (!activeFactory || !activeFactory.breakdown) return null;

  const data = activeFactory.breakdown;

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div className="bg-[#0F172A] text-white p-3 rounded-lg shadow-xl text-xs border border-slate-700">
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
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 transition-all hover:shadow-md p-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <PieIcon className="w-5 h-5 text-[#0B3D2E]" />
              <h3 className="text-sm font-bold text-[#0F172A]">Emission Category Contribution</h3>
            </div>
            <span className="text-xs text-[#64748B]">By Operational Stream</span>
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
                    <Cell key={`cell-${index}`} fill={entry.color || '#0B3D2E'} />
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
              <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }}></span>
              <span className="text-[#64748B] truncate flex-1">{item.category}</span>
              <span className="font-bold text-[#0F172A]">{item.pct}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bar Chart ranking */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 transition-all hover:shadow-md p-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <BarChart2 className="w-5 h-5 text-[#0B3D2E]" />
              <h3 className="text-sm font-bold text-[#0F172A]">Emissions Ranking (tCO2e)</h3>
            </div>
            <span className="text-xs text-[#64748B]">Deterministic Mass</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis dataKey="category" type="category" width={110} tick={{ fontSize: 10, fill: '#0F172A' }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="amount" radius={[0, 4, 4, 0]}>
                  {data.map((entry, index) => (
                    <Cell key={`cell-bar-${index}`} fill={entry.color || '#16A34A'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <p className="text-[11px] text-[#64748B] pt-3 border-t border-slate-100">
          * Calculated using GHG Protocol Scope 1, 2 & Scope 3 upstream factors.
        </p>
      </div>

    </div>
  );
};
