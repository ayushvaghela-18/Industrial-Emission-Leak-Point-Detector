import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import DashboardPage from './pages/DashboardPage';
import DataInputPage from './pages/DataInputPage';
import HotspotsPage from './pages/HotspotsPage';
import RecommendationsPage from './pages/RecommendationsPage';
import SimulatorPage from './pages/SimulatorPage';
import LoginPage from './pages/LoginPage';

const App = () => {
  return (
    <Routes>
      <Route element={<LoginPage />} path="/" />
      <Route element={<Layout />}>
        <Route element={<DashboardPage />} path="/dashboard" />
        <Route element={<DataInputPage />} path="/input" />
        <Route element={<HotspotsPage />} path="/hotspots" />
        <Route element={<RecommendationsPage />} path="/recommendations" />
        <Route element={<SimulatorPage />} path="/simulator" />
      </Route>
      <Route element={<Navigate to="/" replace />} path="*" />
    </Routes>
  );
};

export default App;
