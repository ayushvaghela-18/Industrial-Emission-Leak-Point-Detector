import React from 'react';
import { FactoryProvider, useFactory } from './context/FactoryContext';
import { Layout } from './components/layout/Layout';
import { DashboardPage } from './pages/DashboardPage';
import { DataInputPage } from './pages/DataInputPage';
import { HotspotsPage } from './pages/HotspotsPage';
import { RecommendationsPage } from './pages/RecommendationsPage';
import { SimulatorPage } from './pages/SimulatorPage';
import { Loader2 } from 'lucide-react';

const MainContent = () => {
  const { activeTab, loading } = useFactory();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
        <p className="text-sm font-semibold text-slate-primary">Initializing EcoForge Industrial Telemetry Engine...</p>
      </div>
    );
  }

  switch (activeTab) {
    case 'input':
      return <DataInputPage />;
    case 'hotspots':
      return <HotspotsPage />;
    case 'recommendations':
      return <RecommendationsPage />;
    case 'simulator':
      return <SimulatorPage />;
    case 'dashboard':
    default:
      return <DashboardPage />;
  }
};

export default function App() {
  return (
    <FactoryProvider>
      <Layout>
        <MainContent />
      </Layout>
    </FactoryProvider>
  );
}
