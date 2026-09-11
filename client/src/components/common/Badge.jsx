import React from 'react';

export const SeverityBadge = ({ severity }) => {
  const s = (severity || "").toUpperCase();
  if (s === 'CRITICAL') {
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 ring-1 ring-red-600/20">
        <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-red-600 animate-pulse"></span>
        CRITICAL LEAK POINT
      </span>
    );
  }
  if (s === 'HIGH') {
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 ring-1 ring-amber-600/20">
        <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-amber-600"></span>
        HIGH PRIORITY
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20">
      MEDIUM PRIORITY
    </span>
  );
};

export const FeasibilityBadge = ({ text, score }) => {
  const numScore = score || 80;
  let bg = "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20";
  if (numScore < 70) {
    bg = "bg-amber-50 text-amber-700 ring-1 ring-amber-600/20";
  }
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${bg}`}>
      Feasibility: {text || `${numScore}%`}
    </span>
  );
};
