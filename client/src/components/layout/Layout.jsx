import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { CopilotDrawer } from '../copilot/CopilotDrawer';
import { useFactory } from '../../context/FactoryContext';

export const Layout = ({ children }) => {
  const { error } = useFactory();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      <Navbar />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 w-full bg-slate-50 overflow-y-auto p-6 md:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {error && (
              <div className="p-4 bg-red-50/90 border border-red-200 text-red-800 rounded-xl text-xs font-medium shadow-sm flex items-center justify-between">
                <span><strong>Backend Connection Error:</strong> {error}</span>
              </div>
            )}
            {children || <Outlet />}
          </div>
        </main>
      </div>
      <CopilotDrawer />
    </div>
  );
};

export default Layout;
