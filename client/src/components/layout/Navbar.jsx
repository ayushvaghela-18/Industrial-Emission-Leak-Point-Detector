import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFactory } from '../../context/FactoryContext';
import { Factory, Sparkles, PlusCircle, Building2, Activity, LogOut } from 'lucide-react';
import { NewFactoryModal } from '../factory/NewFactoryModal';

export const Navbar = () => {
  const { factories, activeFactory, selectFactory, setCopilotOpen } = useFactory();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    // Navigate back to login screen using existing routing
    navigate('/');
  };

  return (
    <>
      <header className="bg-white border-b border-slate-200 shadow-sm text-slate-900 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
          
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 flex-shrink-0">
            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center shadow-md ring-1 ring-slate-800">
              <Factory className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-bold tracking-tight text-slate-900">
                  EcoForge <span className="text-emerald-600">AI</span>
                </span>
                <span className="hidden md:inline-flex bg-slate-100 text-slate-600 text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full border border-slate-200">
                  Decision Support
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">Industrial Emission Leak-Point Intelligence</p>
            </div>
          </div>

          {/* Center: Active Factory Dropdown */}
          <div className="flex items-center space-x-2">
            <div className="relative flex items-center bg-slate-50 border border-slate-200/90 rounded-xl px-3 py-1.5 shadow-sm focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500 transition-all">
              <Building2 className="w-4 h-4 text-emerald-600 mr-2 flex-shrink-0" />
              <div className="flex flex-col">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider leading-none">Active Facility</span>
                <select
                  aria-label="Select Active Industrial Facility"
                  value={activeFactory?.id || activeFactory?._id || ''}
                  onChange={(e) => selectFactory(e.target.value)}
                  className="bg-transparent text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none cursor-pointer pr-4 appearance-none"
                >
                  {factories.map((fac) => (
                    <option key={fac.id || fac._id} value={fac.id || fac._id} className="bg-white text-slate-900">
                      {fac.name} ({fac.industry || fac.industryType})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="px-3 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors flex items-center text-xs font-semibold gap-1.5 border border-transparent hover:border-slate-200"
              title="Register New Industrial Facility"
            >
              <PlusCircle className="w-4 h-4 text-emerald-600" />
              <span className="hidden md:inline">Add Plant</span>
            </button>
          </div>

          {/* Right: Telemetry Tag, AI Copilot Trigger & Single Logout Option */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {activeFactory && (
              <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <Activity className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-slate-500">Footprint:</span>
                <span className="font-bold text-slate-900">
                  {activeFactory.metrics?.totalEmissionsTonnes?.toLocaleString() || 0} tCO₂e
                </span>
              </div>
            )}

            <button
              onClick={() => setCopilotOpen((prev) => !prev)}
              className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-full font-semibold shadow-sm hover:shadow text-xs px-3.5 py-2 transition-all"
              title="Open AI Sustainability Copilot"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-200 animate-pulse" />
              <span className="hidden sm:inline">AI Copilot</span>
            </button>

            {/* Single Clear Logout Option */}
            <button
              onClick={handleLogout}
              className="flex items-center space-x-1 px-3 py-2 text-slate-600 hover:text-red-700 hover:bg-red-50/70 rounded-xl text-xs font-semibold border border-transparent hover:border-red-200/60 transition-all"
              title="Sign out of EcoForge AI"
            >
              <LogOut className="w-4 h-4 text-slate-500 group-hover:text-red-600" />
              <span className="hidden md:inline">Logout</span>
            </button>
          </div>

        </div>
      </header>

      <NewFactoryModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};
