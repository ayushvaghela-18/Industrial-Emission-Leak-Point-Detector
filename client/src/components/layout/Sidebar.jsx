import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useFactory } from '../../context/FactoryContext';
import { 
  LayoutDashboard, 
  FileSpreadsheet, 
  Flame, 
  Recycle, 
  SlidersHorizontal, 
  Bot,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

export const Sidebar = () => {
  const { activeFactory, setCopilotOpen } = useFactory();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { id: 'dashboard', path: '/dashboard', label: 'Executive Dashboard', icon: LayoutDashboard, badge: null },
    { id: 'input', path: '/input', label: 'Operational Telemetry', icon: FileSpreadsheet, badge: null },
    { 
      id: 'hotspots', 
      path: '/hotspots',
      label: 'Emission Hotspots', 
      icon: Flame, 
      badge: activeFactory?.hotspots?.length ? `${activeFactory.hotspots.length} LEAKS` : null,
      badgeColor: 'bg-red-500/20 text-red-400 border-red-500/30'
    },
    { 
      id: 'recommendations', 
      path: '/recommendations',
      label: 'Circular Actions', 
      icon: Recycle, 
      badge: activeFactory?.recommendations?.length ? `${activeFactory.recommendations.length} REC` : null,
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
    },
    { 
      id: 'simulator', 
      path: '/simulator', 
      label: 'What-If Simulator', 
      icon: SlidersHorizontal, 
      badge: 'MODELS', 
      badgeColor: 'bg-teal-500/20 text-teal-300 border-teal-500/30' 
    },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 text-slate-400 min-h-[calc(100vh-4rem)] flex flex-col justify-between p-4 flex-shrink-0">
      <div className="space-y-6">
        
        {/* Facility Info Card */}
        {activeFactory && (
          <div className="bg-slate-800/60 border border-slate-700/70 rounded-xl p-3.5 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold tracking-widest text-emerald-400 uppercase">Plant Telemetry</span>
              <span className="inline-flex items-center text-[10px] text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1 animate-pulse"></span> Live
              </span>
            </div>
            <h4 className="text-sm font-bold text-white truncate" title={activeFactory.name}>
              {activeFactory.name}
            </h4>
            <p className="text-xs text-slate-400 truncate">{activeFactory.industry}</p>
            <div className="pt-2 flex items-center justify-between text-[11px] border-t border-slate-700/50">
              <span className="text-slate-400">Sustainability Score</span>
              <span className="font-bold text-emerald-400">
                {activeFactory.metrics?.sustainabilityScore || 50}/100
              </span>
            </div>
          </div>
        )}

        {/* Main Navigation Links */}
        <nav className="space-y-1">
          <p className="px-3 text-[10px] font-bold tracking-widest text-slate-500 uppercase mb-2">Core Functional Modules</p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-semibold transition-all ${
                  isActive 
                    ? 'bg-emerald-500/15 text-emerald-300 border-r-4 border-emerald-500 rounded-l-lg shadow-sm font-bold' 
                    : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200 rounded-lg'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge ? (
                  <span className={`px-2 py-0.5 text-[9px] font-bold rounded border ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                ) : (
                  isActive && <ChevronRight className="w-3.5 h-3.5 text-emerald-400" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Quick Launch Copilot */}
        <div className="pt-4 border-t border-slate-800">
          <button
            onClick={() => setCopilotOpen(true)}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-slate-800/80 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700/80 transition-all hover:border-emerald-500/40"
          >
            <div className="flex items-center space-x-2.5">
              <Bot className="w-4 h-4 text-emerald-400" />
              <span>Grounded AI Copilot</span>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          </button>
        </div>

      </div>

      {/* Footer Info & Methodology Trust Element */}
      <div className="text-[10px] text-slate-500 border-t border-slate-800 pt-3 space-y-1">
        <div className="flex items-center gap-1 text-slate-400 font-semibold">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>GHG Protocol Scope 1, 2, 3</span>
        </div>
        <p className="text-[10px] text-slate-500">Deterministic Carbon Assessment</p>
      </div>
    </aside>
  );
};
