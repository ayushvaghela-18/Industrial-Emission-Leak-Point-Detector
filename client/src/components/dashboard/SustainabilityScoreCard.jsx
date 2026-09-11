import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useFactory } from '../../context/FactoryContext';
import { Award, Lightbulb } from 'lucide-react';

export const SustainabilityScoreCard = () => {
  const { activeFactory } = useFactory();
  const navigate = useNavigate();

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
    <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col justify-between space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Award className="w-5 h-5 text-emerald-600" />
          <h3 className="text-base font-bold text-slate-900 tracking-tight">Sustainability Health Score</h3>
        </div>
        <span className={`text-xs font-bold ${grade.color}`}>{grade.label}</span>
      </div>

      {/* Meter Bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-baseline">
          <span className="text-4xl font-extrabold text-slate-900 tracking-tight">{score} <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">/ 100</span></span>
          <span className="text-xs font-medium text-slate-500">Benchmark Avg: 58</span>
        </div>
        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex">
          <div 
            className={`h-full ${grade.bg} transition-all duration-500 rounded-full`} 
            style={{ width: `${score}%` }}
          ></div>
        </div>
      </div>

      <div className="p-3.5 bg-emerald-50/60 border border-emerald-100 rounded-xl flex items-start space-x-2.5 text-xs text-emerald-950">
        <Lightbulb className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
        <p>
          Implementing top circular recommendations will boost score by <span className="font-bold text-emerald-700">+28 points</span>.
        </p>
      </div>

      <button
        onClick={() => navigate('/recommendations')}
        className="w-full py-3 bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white rounded-xl text-xs font-semibold shadow-md hover:shadow-lg transition-all"
      >
        Explore Circular Interventions
      </button>
    </div>
  );
};
