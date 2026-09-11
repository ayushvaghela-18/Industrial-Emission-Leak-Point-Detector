import React from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { CopilotDrawer } from '../copilot/CopilotDrawer';

export const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-surface-bg flex flex-col font-sans">
      <Navbar />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-6 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
      <CopilotDrawer />
    </div>
  );
};
