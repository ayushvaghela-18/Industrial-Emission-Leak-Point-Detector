import React from 'react';
import { useFactory } from '../../context/FactoryContext';
import { Award, Lightbulb } from 'lucide-react';

export const SustainabilityScoreCard = () => {
  const { activeFactory, setActiveTab } = useFactory();

  if (!activeFactory) return null;

  const score = activeFactory.metrics?.sustainabilityScore || 50;

  const getScoreGrade = (s) => {
    if (s >= 80) return { label: 'A+ (Leader)', color: 'text-emerald-600', bg: 'bg-emerald-500' };
    if (s >= 65) return { label: 'B (Moderate)', color: 'text-teal-600', bg: 'bg-teal-500' };
    if (s >= 50) return { label: 'C (Needs Work)', color: 'text-amber-600', bg: 'bg-amber-500' };
    return { label: 'D (High Carbon Risk)', color: 'text-red-600', bg: 'bg-red-500' };
  };

  const grade = getScoreGrade(score);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 transition-all hover:shadow-md p-5 flex flex-col justify-between space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Award className="w-5 h-5 text-[#0B3D2E]" />
          <h3 className="text-sm font-bold text-[#0F172A]">Sustainability Health Score</h3>
        </div>
        <span className={`text-xs font-bold ${grade.color}`}>{grade.label}</span>
      </div>

      {/* Meter Bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-baseline">
          <span className="text-3xl font-black text-[#0F172A]">{score} <span className="text-sm font-normal text-[#64748B]">/ 100</span></span>
          <span className="text-xs text-[#64748B]">Benchmark Avg: 58</span>
        </div>
        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex">
          <div 
            className={`h-full ${grade.bg} transition-all duration-500 rounded-full`} 
            style={{ width: `${score}%` }}
          ></div>
        </div>
      </div>

      <div className="p-3 bg-emerald-50/60 border border-emerald-100 rounded-lg flex items-start space-x-2.5 text-xs text-[#0B3D2E]">
        <Lightbulb className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
        <p>
          Implementing top circular recommendations will boost score by <span className="font-bold text-emerald-700">+28 points</span>.
        </p>
      </div>

      <button
        onClick={() => setActiveTab('recommendations')}
        className="w-full py-2 bg-[#0B3D2E] hover:bg-[#082e22] text-white rounded-lg text-xs font-semibold transition-colors"
      >
        Explore Circular Interventions
      </button>
    </div>
  );
};
