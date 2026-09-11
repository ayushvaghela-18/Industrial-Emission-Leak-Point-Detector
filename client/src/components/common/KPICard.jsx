import React from 'react';

export const KPICard = ({ title, value, unit, subtitle, icon: Icon, color = "emerald", trend }) => {
  const colorMap = {
    forest: "bg-forest-900 text-white border-forest-800",
    emerald: "bg-surface-card text-slate-primary border-surface-border",
    teal: "bg-surface-card text-slate-primary border-surface-border",
    amber: "bg-surface-card text-slate-primary border-surface-border",
  };

  const iconBgMap = {
    forest: "bg-forest-800 text-mint",
    emerald: "bg-emerald-100 text-emerald-700",
    teal: "bg-teal-100 text-teal-700",
    amber: "bg-amber-100 text-warning",
    critical: "bg-red-100 text-critical",
  };

  return (
    <div className={`p-5 rounded-xl border shadow-card transition-all duration-200 hover:shadow-card-hover ${colorMap[color] || colorMap.emerald}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-secondary">{title}</span>
        {Icon && (
          <div className={`p-2.5 rounded-lg ${iconBgMap[color] || 'bg-slate-100 text-slate-primary'}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
      <div className="mt-3 flex items-baseline gap-1.5">
        <span className="text-2xl font-bold tracking-tight text-slate-primary">{value}</span>
        {unit && <span className="text-xs font-medium text-slate-secondary">{unit}</span>}
      </div>
      {subtitle && (
        <div className="mt-2 flex items-center gap-1 text-xs text-slate-secondary">
          {trend && (
            <span className={`font-semibold ${trend.positive ? 'text-emerald-600' : 'text-slate-primary'}`}>
              {trend.positive ? '↓' : '↑'} {trend.text}
            </span>
          )}
          <span>{subtitle}</span>
        </div>
      )}
    </div>
  );
};
