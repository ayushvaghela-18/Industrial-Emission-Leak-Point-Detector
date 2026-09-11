import React from 'react';

export const KPICard = ({ title, value, unit, subtitle, icon: Icon, trend }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 transition-all hover:shadow-md p-5 flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">{title}</span>
        {Icon && (
          <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-700">
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
      
      <div className="mt-3 flex items-baseline gap-1.5">
        <span className="text-2xl font-bold tracking-tight text-[#0F172A]">{value}</span>
        {unit && <span className="text-xs font-medium text-[#64748B]">{unit}</span>}
      </div>

      {subtitle && (
        <div className="mt-2 flex items-center gap-1.5 text-xs text-[#64748B]">
          {trend && (
            <span className={`font-semibold ${trend.positive ? 'text-emerald-600' : 'text-[#0F172A]'}`}>
              {trend.positive ? '↓' : '↑'} {trend.text}
            </span>
          )}
          <span>{subtitle}</span>
        </div>
      )}
    </div>
  );
};
