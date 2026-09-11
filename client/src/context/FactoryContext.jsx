import React, { createContext, useContext, useState, useEffect } from 'react';
import { factoryService } from '../services/factoryService';
import { emissionService } from '../services/emissionService';
import { simulationService } from '../services/simulationService';

const FactoryContext = createContext(null);

export const FactoryProvider = ({ children }) => {
  const [factories, setFactories] = useState([]);
  const [activeFactory, setActiveFactory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [copilotOpen, setCopilotOpen] = useState(false);
  const [simulationResult, setSimulationResult] = useState(null);
  const [simulating, setSimulating] = useState(false);

  // Load initial factory profiles
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const res = await factoryService.getFactories();
        if (res.success && res.data.length > 0) {
          setFactories(res.data);
          setActiveFactory(res.data[0]);
        }
      } catch (err) {
        console.error("Failed to load factory profiles:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Switch Active Factory
  const selectFactory = (id) => {
    const found = factories.find(f => f.id === id);
    if (found) {
      setActiveFactory(found);
      setSimulationResult(null); // reset active simulation when switching facility
    }
  };

  // Recalculate emissions when data form submitted
  const submitOperationalData = async (formData) => {
    if (!activeFactory) return;
    setCalculating(true);
    try {
      const res = await emissionService.calculateEmissions(activeFactory.id, formData);
      if (res.success) {
        const updated = {
          ...activeFactory,
          operationalData: { ...formData },
          metrics: res.data.metrics,
          breakdown: res.data.breakdown,
          hotspots: res.data.hotspots,
          recommendations: res.data.recommendations || activeFactory.recommendations
        };
        setActiveFactory(updated);
        setFactories(prev => prev.map(f => f.id === updated.id ? updated : f));
        setActiveTab('dashboard');
      }
    } catch (err) {
      console.error("Calculation failed:", err);
    } finally {
      setCalculating(false);
    }
  };

  // Create new Factory Profile
  const addFactory = async (profileData) => {
    setLoading(true);
    try {
      const res = await factoryService.createFactory(profileData);
      if (res.success) {
        setFactories(prev => [res.data, ...prev]);
        setActiveFactory(res.data);
        setActiveTab('dashboard');
      }
    } catch (err) {
      console.error("Failed to create factory:", err);
    } finally {
      setLoading(false);
    }
  };

  // Execute What-If Simulation
  const executeSimulation = async (parameters) => {
    if (!activeFactory) return;
    setSimulating(true);
    try {
      const res = await simulationService.runSimulation(activeFactory.id, parameters);
      if (res.success) {
        setSimulationResult(res.data);
      }
    } catch (err) {
      console.error("Simulation failed:", err);
    } finally {
      setSimulating(false);
    }
  };

  return (
    <FactoryContext.Provider
      value={{
        factories,
        activeFactory,
        loading,
        calculating,
        simulating,
        activeTab,
        setActiveTab,
        copilotOpen,
        setCopilotOpen,
        simulationResult,
        selectFactory,
        submitOperationalData,
        addFactory,
        executeSimulation
      }}
    >
      {children}
    </FactoryContext.Provider>
  );
};

export const useFactory = () => {
  const ctx = useContext(FactoryContext);
  if (!ctx) {
    throw new Error("useFactory must be used within FactoryProvider");
  }
  return ctx;
};
