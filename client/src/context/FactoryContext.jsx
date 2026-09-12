import React, { createContext, useContext, useState, useEffect } from 'react';
import { factoryService } from '../services/factoryService';
import { emissionService } from '../services/emissionService';
import { simulationService } from '../services/simulationService';
import { recommendationService } from '../services/recommendationService';

const FactoryContext = createContext(null);

/**
 * Hydrates raw backend MongoDB documents into the data structure expected by the frontend components.
 */
function hydrateFactoryRecord(factory = {}, latestProcessData = null, latestAnalysis = null, recommendations = [], mlInsights = null) {
  const id = factory._id || factory.id;
  const name = factory.name || 'Industrial Facility';
  const industry = factory.industryType || factory.industry || 'Manufacturing';

  const loc = typeof factory.location === 'object'
    ? [factory.location?.city, factory.location?.region, factory.location?.country].filter(Boolean).join(', ')
    : (factory.location || 'Industrial Zone');

  const empCount = factory.operationalProfile?.employeeCount || 150;
  const size = `Enterprise (${empCount} Employees)`;

  // Operational Process Data mapping
  const energy = latestProcessData?.energy || {};
  const materials = latestProcessData?.materials || {};
  const waste = latestProcessData?.waste || {};
  const logistics = latestProcessData?.logistics || {};
  const production = latestProcessData?.production || {};

  const totalElectricity = (energy.gridElectricityKwh || 0) + (energy.renewableElectricityKwh || 0);
  const renewablePct = totalElectricity > 0
    ? Math.round(((energy.renewableElectricityKwh || 0) / totalElectricity) * 100)
    : 0;

  const operationalData = {
    electricityKw: totalElectricity,
    renewablePct,
    dieselLiters: energy.dieselLiters || 0,
    coalTonnes: Math.round((energy.coalKg || 0) / 1000),
    naturalGasM3: energy.naturalGasM3 || 0,
    rawMaterialType: materials.materialType || 'cotton',
    rawMaterialQuantityTonnes: Math.round((materials.rawMaterialKg || 0) / 1000),
    recycledMaterialPct: materials.recycledMaterialPercentage || 0,
    wasteGeneratedTonnes: Math.round((waste.wasteGeneratedKg || 0) / 1000),
    wasteRecycledPct: waste.wasteRecycledPercentage || 0,
    transportDistanceKm: logistics.transportTkm && materials.rawMaterialKg
      ? Math.round((logistics.transportTkm * 1000) / (materials.rawMaterialKg / 1000))
      : (logistics.transportTkm || 50000),
  };

  // Metrics mapping
  const totalEmissionsTonnes = Math.round((latestAnalysis?.totalEmissionsTonsCO2e ?? 0) * 10) / 10;
  const hotspotsList = latestAnalysis?.hotspots || [];

  const potentialCo2Reduction = Math.round(
    hotspotsList.reduce((acc, h) => acc + (h.reductionPotentialEstimate?.potentialTonsReduction || 0), 0)
  );

  const potentialAnnualSavings = Math.round(
    hotspotsList.reduce((acc, h) => acc + ((h.reductionPotentialEstimate?.potentialTonsReduction || 0) * 65), 0)
  );

  const sustainabilityScore = Math.min(95, Math.max(38, Math.round(100 - (totalEmissionsTonnes / 60))));

  const metrics = {
    totalEmissionsTonnes,
    carbonIntensity: production.productionVolumeUnits
      ? `${(totalEmissionsTonnes / (production.productionVolumeUnits || 1)).toFixed(4)} tCO2e / ${production.productionUnit || 'unit'}`
      : '0.245 tCO2e / unit',
    potentialCo2Reduction,
    potentialAnnualSavings,
    sustainabilityScore,
  };

  // Category breakdown for charts
  const CHART_COLORS = ['#0f172a', '#10b981', '#14b8a6', '#f59e0b', '#f43f5e'];
  const breakdown = (latestAnalysis?.categories || []).map((cat, idx) => ({
    category: cat.category,
    amount: Math.round((cat.emissionsTonsCO2e ?? (cat.emissionsKgCO2e / 1000)) * 10) / 10,
    pct: Number((cat.percentage || 0).toFixed(1)),
    scope: cat.category.includes('Energy') ? 'Scope 1 & 2' : 'Scope 3',
    color: CHART_COLORS[idx % CHART_COLORS.length]
  }));

  // Hotspots mapping
  const hotspots = hotspotsList.map((h, idx) => ({
    id: `hot-${h.rank || idx + 1}`,
    title: h.source || 'Operational Leak Point',
    severity: h.severity || 'HIGH',
    category: h.category || 'Direct Combustion',
    contributionPct: Number((h.percentage || 0).toFixed(1)),
    annualEmissions: Math.round((h.emissionsTonsCO2e || 0) * 10) / 10,
    unit: 'tCO2e/yr',
    rootCause: h.explanation || 'Operational process emissions identified by GHG Protocol diagnostic engine.',
    impactAnalysis: `Accounts for ${Number((h.percentage || 0).toFixed(1))}% of facility carbon footprint.`,
    primaryIntervention: h.reductionPotentialEstimate?.primaryInterventionType || 'Operational Process Optimization',
    potentialCo2Savings: Math.round(h.reductionPotentialEstimate?.potentialTonsReduction || 0),
    potentialCostSavings: Math.round((h.reductionPotentialEstimate?.potentialTonsReduction || 0) * 65)
  }));

  return {
    ...factory,
    id,
    _id: id,
    name,
    industry,
    location: loc,
    size,
    annualProduction: production.productionVolumeUnits
      ? `${production.productionVolumeUnits.toLocaleString()} ${production.productionUnit || 'Units'}`
      : '85,000 Tonnes Product',
    operationalData,
    metrics,
    breakdown,
    hotspots,
    recommendations: recommendations || [],
    mlInsights: mlInsights || null,
    latestProcessData,
    latestAnalysis
  };
}

export const FactoryProvider = ({ children }) => {
  const [factories, setFactories] = useState([]);
  const [activeFactory, setActiveFactory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [copilotOpen, setCopilotOpen] = useState(false);
  const [simulationResult, setSimulationResult] = useState(null);
  const [simulating, setSimulating] = useState(false);
  const [error, setError] = useState(null);

  // Load initial factory profiles from backend MongoDB
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const res = await factoryService.getFactories();
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          // Normalize base list
          const rawFactories = res.data;
          
          // Hydrate the first active factory with its full details from backend
          const firstId = rawFactories[0]._id || rawFactories[0].id;
          const [detailRes, recRes] = await Promise.all([
            factoryService.getFactoryById(firstId),
            recommendationService.getRecommendations(firstId)
          ]);

          let activeHydrated = null;
          if (detailRes.success && detailRes.data) {
            const { factory, latestProcessData, latestAnalysis } = detailRes.data;
            activeHydrated = hydrateFactoryRecord(
              factory,
              latestProcessData,
              latestAnalysis,
              recRes.data || [],
              recRes.mlInsights || null
            );
          } else {
            activeHydrated = hydrateFactoryRecord(rawFactories[0], null, null, recRes.data || [], recRes.mlInsights || null);
          }

          const allHydrated = rawFactories.map((f, idx) => {
            if (idx === 0) return activeHydrated;
            return {
              ...f,
              id: f._id || f.id,
              industry: f.industryType || f.industry || 'Manufacturing'
            };
          });

          setFactories(allHydrated);
          setActiveFactory(activeHydrated);
        } else {
          setFactories([]);
          setActiveFactory(null);
        }
      } catch (err) {
        console.error("Failed to load factory profiles from backend:", err);
        setError(err.message || 'Unable to connect to EcoForge AI backend server.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Switch Active Factory
  const selectFactory = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const [detailRes, recRes] = await Promise.all([
        factoryService.getFactoryById(id),
        recommendationService.getRecommendations(id)
      ]);

      if (detailRes.success && detailRes.data) {
        const { factory, latestProcessData, latestAnalysis } = detailRes.data;
        const hydrated = hydrateFactoryRecord(
          factory,
          latestProcessData,
          latestAnalysis,
          recRes.data || [],
          recRes.mlInsights || null
        );
        setActiveFactory(hydrated);
        setSimulationResult(null); // reset active simulation when switching facility
        setFactories(prev => prev.map(f => (f.id === id || f._id === id) ? hydrated : f));
      }
    } catch (err) {
      console.error("Failed to switch factory:", err);
      setError(err.message || 'Failed to retrieve factory details from backend.');
    } finally {
      setLoading(false);
    }
  };

  // Recalculate emissions when operational form is submitted
  const submitOperationalData = async (formData) => {
    if (!activeFactory) return;
    setCalculating(true);
    setError(null);
    try {
      const targetId = activeFactory._id || activeFactory.id;
      const res = await emissionService.calculateEmissions(targetId, formData);
      
      if (res.success && res.data) {
        // Hydrate circular recommendations for updated hotspot ranking
        const recRes = await recommendationService.getRecommendations(targetId);

        const updated = hydrateFactoryRecord(
          activeFactory,
          res.data.processData || activeFactory.latestProcessData,
          res.data,
          recRes.data || activeFactory.recommendations,
          recRes.mlInsights || activeFactory.mlInsights || null
        );

        // Keep current form values in state
        updated.operationalData = { ...formData };

        setActiveFactory(updated);
        setFactories(prev => prev.map(f => (f.id === updated.id || f._id === updated.id) ? updated : f));
        setActiveTab('dashboard');
      }
    } catch (err) {
      console.error("Emission calculation failed on backend:", err);
      setError(err.message || 'Emission calculation request failed.');
    } finally {
      setCalculating(false);
    }
  };

  // Create new Factory Profile
  const addFactory = async (profileData) => {
    setLoading(true);
    setError(null);
    try {
      const res = await factoryService.createFactory(profileData);
      if (res.success && res.data) {
        const newDoc = res.data.factory || res.data;
        const newId = newDoc._id || newDoc.id;

        const recRes = await recommendationService.getRecommendations(newId);

        const hydrated = hydrateFactoryRecord(
          newDoc,
          profileData.operationalData,
          res.data.initialAnalysis,
          recRes.data || [],
          recRes.mlInsights || null
        );

        setFactories(prev => [hydrated, ...prev]);
        setActiveFactory(hydrated);
        setActiveTab('dashboard');
      }
    } catch (err) {
      console.error("Failed to create factory profile on backend:", err);
      setError(err.message || 'Failed to create factory profile.');
    } finally {
      setLoading(false);
    }
  };

  // Execute What-If Simulation
  const executeSimulation = async (parameters) => {
    if (!activeFactory) return;
    setSimulating(true);
    setError(null);
    try {
      const targetId = activeFactory._id || activeFactory.id;
      const res = await simulationService.runSimulation(targetId, parameters);
      if (res.success && res.data) {
        setSimulationResult(res.data);
      }
    } catch (err) {
      console.error("Simulation request failed on backend:", err);
      setError(err.message || 'Simulation execution failed.');
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
        mlInsights: activeFactory?.mlInsights || null,
        selectFactory,
        submitOperationalData,
        addFactory,
        executeSimulation,
        error,
        setError
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
