import React, { useState } from 'react';
import { useFactory } from '../../context/FactoryContext';
import { Factory, Sparkles, PlusCircle, Building2, Activity } from 'lucide-react';
import { NewFactoryModal } from '../factory/NewFactoryModal';

export const Navbar = () => {
  const { factories, activeFactory, selectFactory, setCopilotOpen } = useFactory();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <header className="bg-white border-b border-slate-200 shadow-sm text-slate-900 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center shadow-md">
              <Factory className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold tracking-tight text-slate-900">EcoForge <span className="text-emerald-600">AI</span></span>
                <span className="bg-slate-100 text-slate-600 text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full border border-slate-200">
                  Industrial Telemetry
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">Leak-Point Detector & Circular Intelligence</p>
            </div>
          </div>

          {/* Center: Active Factory Dropdown */}
          <div className="flex items-center space-x-3">
            <div className="relative flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-1.5 shadow-sm">
              <Building2 className="w-4 h-4 text-emerald-600 mr-2 flex-shrink-0" />
              <select
                value={activeFactory?.id || ''}
                onChange={(e) => selectFactory(e.target.value)}
                className="bg-transparent text-sm font-semibold text-slate-900 focus:outline-none cursor-pointer pr-6"
              >
                {factories.map((fac) => (
                  <option key={fac.id} value={fac.id} className="bg-white text-slate-900">
                    {fac.name} ({fac.industry})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors flex items-center text-xs font-semibold gap-1.5"
              title="Add New Facility"
            >
              <PlusCircle className="w-4 h-4 text-emerald-600" />
              <span className="hidden md:inline">Add Facility</span>
            </button>
          </div>

          {/* Right: AI Copilot Trigger */}
          <div className="flex items-center space-x-3">
            {activeFactory && (
              <div className="hidden lg:flex items-center gap-2 px-3.5 py-1.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <Activity className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-slate-500">Footprint:</span>
                <span className="font-bold text-slate-900">{activeFactory.metrics?.totalEmissionsTonnes?.toLocaleString() || 0} tCO2e</span>
              </div>
            )}

            <button
              onClick={() => setCopilotOpen(prev => !prev)}
              className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full font-semibold shadow-md text-xs px-4 py-2 transition-all transform hover:scale-[1.02]"
            >
              <Sparkles className="w-4 h-4 text-emerald-200 animate-pulse" />
              <span>AI Copilot</span>
            </button>
          </div>

        </div>
      </header>

      <NewFactoryModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};
