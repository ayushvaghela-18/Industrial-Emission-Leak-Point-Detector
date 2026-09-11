import React, { useState } from 'react';
import { useFactory } from '../../context/FactoryContext';
import { Factory, Sparkles, PlusCircle, Building2, Activity } from 'lucide-react';
import { NewFactoryModal } from '../factory/NewFactoryModal';

export const Navbar = () => {
  const { factories, activeFactory, selectFactory, setCopilotOpen } = useFactory();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <header className="bg-forest-900 border-b border-forest-800 text-white sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg">
              <Factory className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold tracking-tight text-white">EcoForge <span className="text-emerald-400">AI</span></span>
                <span className="bg-forest-800 text-emerald-300 text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full border border-forest-700">
                  Industrial Telemetry
                </span>
              </div>
              <p className="text-[11px] text-slate-300 hidden sm:block">Leak-Point Detector & Circular Intelligence</p>
            </div>
          </div>

          {/* Center: Active Factory Dropdown */}
          <div className="flex items-center space-x-3">
            <div className="relative flex items-center bg-forest-800/90 border border-forest-700 rounded-lg px-3 py-1.5 shadow-inner">
              <Building2 className="w-4 h-4 text-emerald-400 mr-2 flex-shrink-0" />
              <select
                value={activeFactory?.id || ''}
                onChange={(e) => selectFactory(e.target.value)}
                className="bg-transparent text-sm font-medium text-white focus:outline-none cursor-pointer pr-6"
              >
                {factories.map((fac) => (
                  <option key={fac.id} value={fac.id} className="bg-slate-900 text-white">
                    {fac.name} ({fac.industry})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="p-2 text-slate-300 hover:text-white hover:bg-forest-800 rounded-lg transition-colors flex items-center text-xs font-medium gap-1"
              title="Add New Facility"
            >
              <PlusCircle className="w-4 h-4 text-emerald-400" />
              <span className="hidden md:inline">Add Facility</span>
            </button>
          </div>

          {/* Right: AI Copilot Trigger */}
          <div className="flex items-center space-x-3">
            {activeFactory && (
              <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-forest-800/50 rounded-lg border border-forest-700/60 text-xs">
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-slate-300">Footprint:</span>
                <span className="font-bold text-emerald-300">{activeFactory.metrics?.totalEmissionsTonnes?.toLocaleString() || 0} tCO2e</span>
              </div>
            )}

            <button
              onClick={() => setCopilotOpen(prev => !prev)}
              className="flex items-center space-x-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold px-3.5 py-2 rounded-lg shadow-md transition-all duration-200 transform hover:scale-[1.02]"
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
