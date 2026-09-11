import React from 'react';

export const SeverityBadge = ({ severity }) => {
  const s = (severity || "").toUpperCase();
  if (s === 'CRITICAL') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-critical border border-red-200">
        <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-critical animate-pulse"></span>
        CRITICAL LEAK POINT
      </span>
    );
  }
  if (s === 'HIGH') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-warning border border-amber-200">
        <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-warning"></span>
        HIGH PRIORITY
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-secondary border border-slate-200">
      MEDIUM PRIORITY
    </span>
  );
};

export const FeasibilityBadge = ({ text, score }) => {
  const numScore = score || 80;
  let bg = "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (numScore < 70) {
    bg = "bg-amber-50 text-amber-700 border-amber-200";
  }
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${bg}`}>
      Feasibility: {text || `${numScore}%`}
    </span>
  );
};
