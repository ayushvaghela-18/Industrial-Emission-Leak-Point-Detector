import React from 'react';

export const SeverityBadge = ({ severity }) => {
  const s = (severity || '').toUpperCase();

  if (s === 'CRITICAL') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-50 text-red-700 ring-1 ring-red-600/25 tracking-wide">
        <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-red-600 animate-pulse"></span>
        CRITICAL LEAK POINT
      </span>
    );
  }

  if (s === 'HIGH') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 ring-1 ring-amber-600/25 tracking-wide">
        <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-amber-600"></span>
        HIGH PRIORITY
      </span>
    );
  }

  if (s === 'MEDIUM') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-800 ring-1 ring-slate-300/60 tracking-wide">
        <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-slate-500"></span>
        MEDIUM PRIORITY
      </span>
    );
  }

  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 ring-1 ring-emerald-600/20 tracking-wide">
      <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-emerald-600"></span>
      LOW PRIORITY
    </span>
  );
};

export const FeasibilityBadge = ({ text, score }) => {
  const numScore = score || (text?.toLowerCase().includes('high') ? 90 : 70);
  const isHigh = numScore >= 75;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide ${
        isHigh
          ? 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-600/20'
          : 'bg-amber-50 text-amber-800 ring-1 ring-amber-600/25'
      }`}
    >
      <span className={`w-1.5 h-1.5 mr-1.5 rounded-full ${isHigh ? 'bg-emerald-600' : 'bg-amber-600'}`}></span>
      Feasibility: {text || `${numScore}%`}
    </span>
  );
};
