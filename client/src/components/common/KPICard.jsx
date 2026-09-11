import React from 'react';

export const KPICard = ({ title, value, unit, subtitle, icon: Icon, trend }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm p-6 transition-all duration-300 hover:shadow-lg flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">{title}</span>
        {Icon && (
          <div className="p-3 rounded-xl bg-slate-100 text-slate-700">
            <Icon className="w-5 h-5 text-emerald-600" />
          </div>
        )}
      </div>
      
      <div className="mt-4 flex items-baseline gap-1.5">
        <span className="text-4xl font-extrabold text-slate-900 tracking-tight">{value}</span>
        {unit && <span className="text-xs font-semibold text-slate-500">{unit}</span>}
      </div>

      {subtitle && (
        <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
          {trend && (
            <span className={`font-semibold ${trend.positive ? 'text-emerald-600' : 'text-slate-900'}`}>
              {trend.positive ? '↓' : '↑'} {trend.text}
            </span>
          )}
          <span>{subtitle}</span>
        </div>
      )}
    </div>
  );
};
