/**
 * EcoForge AI — Mock Service Abstraction Layer
 * Simulates asynchronous API calls with realistic network latencies,
 * deterministic calculation engine, and grounded AI Copilot reasoning.
 */

import { INITIAL_FACTORIES, MOCK_AI_KNOWLEDGE_BASE, MOCK_AI_SUGGESTED_QUESTIONS } from '../mock/mockData';

// In-memory persistent state for frontend session
let factoriesStore = [...INITIAL_FACTORIES];

// Helper to simulate realistic async network delay
const delay = (ms = 350) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Deterministic Emission Calculation Engine
 * Calculates Scope 1, Scope 2, Scope 3 mass (tCO2e), category breakdowns,
 * leak points, and potential circular ROI metrics.
 */
export function calculateDeterministicEmissions(inputs = {}) {
  const electricityKw = Number(inputs.electricityKw || 0);
  const renewablePct = Number(inputs.renewablePct || 0);
  const dieselLiters = Number(inputs.dieselLiters || 0);
  const coalTonnes = Number(inputs.coalTonnes || 0);
  const naturalGasM3 = Number(inputs.naturalGasM3 || 0);
  const rawMaterialQuantityTonnes = Number(inputs.rawMaterialQuantityTonnes || 0);
  const recycledMaterialPct = Number(inputs.recycledMaterialPct || 0);
  const wasteGeneratedTonnes = Number(inputs.wasteGeneratedTonnes || 0);
  const wasteRecycledPct = Number(inputs.wasteRecycledPct || 0);
  const transportDistanceKm = Number(inputs.transportDistanceKm || 0);

  // Deterministic GHG Protocol emission factors
  const elecEmissions = Math.round(electricityKw * (1 - renewablePct / 100) * 0.000485); // 0.485 kgCO2e/kWh
  const dieselEmissions = Math.round(dieselLiters * 0.00268); // 2.68 kgCO2e/L
  const gasEmissions = Math.round(naturalGasM3 * 0.0020); // 2.0 kgCO2e/m3
  const coalEmissions = Math.round(coalTonnes * 2.42); // 2.42 tCO2e/tonne
  const rawMatEmissions = Math.round(rawMaterialQuantityTonnes * (1 - recycledMaterialPct / 100) * 0.045); // 0.045 tCO2e/tonne
  const transportEmissions = Math.round(transportDistanceKm * 0.010); // 0.01 tCO2e/km
  const wasteEmissions = Math.round(wasteGeneratedTonnes * (1 - wasteRecycledPct / 100) * 0.05);

  const calculatedTotal = elecEmissions + dieselEmissions + gasEmissions + coalEmissions + rawMatEmissions + transportEmissions + wasteEmissions;
  const totalEmissions = calculatedTotal > 0 ? calculatedTotal : 18450;

  const rawBreakdown = [
    { category: "Electricity Consumption", amount: elecEmissions, color: "#0B3D2E", scope: "Scope 2" },
    { category: "Diesel & Thermal Process Heating", amount: dieselEmissions + gasEmissions + coalEmissions, color: "#DC2626", scope: "Scope 1" },
    { category: "Virgin Raw Material Sourcing", amount: rawMatEmissions, color: "#F59E0B", scope: "Scope 3" },
    { category: "Logistics & Transport", amount: transportEmissions, color: "#0F766E", scope: "Scope 3" },
    { category: "Solid & Hazardous Waste", amount: wasteEmissions, color: "#64748B", scope: "Scope 1 & 3" }
  ].filter(item => item.amount > 0);

  const breakdown = rawBreakdown.map(item => ({
    ...item,
    pct: parseFloat(((item.amount / totalEmissions) * 100).toFixed(1))
  })).sort((a, b) => b.amount - a.amount);

  const topCategory = breakdown[0] || { category: "Diesel Process Heating", pct: 38.1, amount: 7032 };

  const hotspots = [
    {
      id: `hot-${Date.now()}-1`,
      title: `${topCategory.category} Intensity`,
      severity: topCategory.pct > 30 ? "CRITICAL" : "HIGH",
      category: topCategory.category,
      contributionPct: topCategory.pct,
      annualEmissions: topCategory.amount,
      unit: "tCO2e/yr",
      rootCause: `High operational reliance on un-optimized ${topCategory.category.toLowerCase()}.`,
      impactAnalysis: "Accounts for the single largest share of facility carbon footprint.",
      primaryIntervention: "Waste Heat Recovery & Closed-Loop Equipment Retrofit",
      potentialCo2Savings: Math.round(topCategory.amount * 0.55),
      potentialCostSavings: Math.round(topCategory.amount * 42)
    }
  ];

  const potentialCo2Reduction = Math.round(totalEmissions * 0.32);
  const potentialAnnualSavings = Math.round(totalEmissions * 21);

  return {
    metrics: {
      totalEmissionsTonnes: totalEmissions,
      carbonIntensity: `${(totalEmissions / 85000).toFixed(3)} tCO2e / tonne product`,
      potentialCo2Reduction,
      potentialAnnualSavings,
      sustainabilityScore: Math.min(95, Math.max(20, 100 - Math.round(totalEmissions / 300)))
    },
    breakdown,
    hotspots,
    recommendations: INITIAL_FACTORIES[0].recommendations
  };
}

export const mockService = {
  /**
   * Fetch all registered industrial facilities
   */
  async fetchFactories() {
    await delay(300);
    return { success: true, data: factoriesStore };
  },

  /**
   * Fetch details for a specific facility by ID
   */
  async fetchFactoryById(id) {
    await delay(250);
    const factory = factoriesStore.find((f) => f.id === id) || factoriesStore[0];
    return { success: true, data: factory };
  },

  /**
   * Register a new industrial facility profile
   */
  async createFactoryProfile(profileData) {
    await delay(450);
    const id = `fac-${Date.now()}`;
    const calculated = calculateDeterministicEmissions(profileData.operationalData || profileData);

    const newFactory = {
      id,
      name: profileData.name || "New Industrial Facility",
      industry: profileData.industry || "General Manufacturing",
      location: profileData.location || "Industrial District",
      size: profileData.size || "SME Facility",
      annualProduction: profileData.annualProduction || "25,000 Units",
      operationalData: profileData.operationalData || profileData,
      metrics: calculated.metrics,
      breakdown: calculated.breakdown,
      hotspots: calculated.hotspots,
      recommendations: calculated.recommendations,
      baselineMetrics: {
        renewablePct: profileData.operationalData?.renewablePct || 10,
        recycledMaterialPct: profileData.operationalData?.recycledMaterialPct || 5,
        wasteRecycledPct: profileData.operationalData?.wasteRecycledPct || 30,
        fuelReductionPct: 0,
        processEfficiencyPct: 0
      }
    };

    factoriesStore.unshift(newFactory);
    return { success: true, data: newFactory };
  },

  /**
   * Recalculate carbon footprint deterministically based on operational inputs
   */
  async calculateEmissions(factoryId, operationalData) {
    await delay(500);
    const calculated = calculateDeterministicEmissions(operationalData);

    const idx = factoriesStore.findIndex((f) => f.id === factoryId);
    if (idx !== -1) {
      factoriesStore[idx].operationalData = { ...operationalData };
      factoriesStore[idx].metrics = calculated.metrics;
      factoriesStore[idx].breakdown = calculated.breakdown;
      factoriesStore[idx].hotspots = calculated.hotspots;
      factoriesStore[idx].recommendations = calculated.recommendations;
    }

    return { success: true, data: calculated };
  },

  /**
   * Fetch identified emission leak points / hotspots
   */
  async fetchHotspots(factoryId) {
    await delay(250);
    const fac = factoriesStore.find((f) => f.id === factoryId) || factoriesStore[0];
    return { success: true, data: fac.hotspots };
  },

  /**
   * Fetch prioritized circular recommendations
   */
  async fetchRecommendations(factoryId) {
    await delay(250);
    const fac = factoriesStore.find((f) => f.id === factoryId) || factoriesStore[0];
    return { success: true, data: fac.recommendations };
  },

  /**
   * Execute interactive What-If simulation scenario
   */
  async runWhatIfSimulation(factoryId, parameters) {
    await delay(350);
    const factory = factoriesStore.find((f) => f.id === factoryId) || factoriesStore[0];
    const baseline = factory.operationalData;

    const simulatedInputs = {
      ...baseline,
      renewablePct: parameters.renewablePct ?? baseline.renewablePct,
      recycledMaterialPct: parameters.recycledMaterialPct ?? baseline.recycledMaterialPct,
      wasteRecycledPct: parameters.wasteRecycledPct ?? baseline.wasteRecycledPct,
      dieselLiters: baseline.dieselLiters * (1 - (parameters.fuelReductionPct || 0) / 100),
      electricityKw: baseline.electricityKw * (1 - (parameters.processEfficiencyPct || 0) / 100)
    };

    const simResults = calculateDeterministicEmissions(simulatedInputs);
    const co2ReductionTonnes = Math.max(0, factory.metrics.totalEmissionsTonnes - simResults.metrics.totalEmissionsTonnes);
    const co2ReductionPct = factory.metrics.totalEmissionsTonnes > 0
      ? parseFloat(((co2ReductionTonnes / factory.metrics.totalEmissionsTonnes) * 100).toFixed(1))
      : 0;

    const estimatedSavingsUSD = Math.round(co2ReductionTonnes * 65);

    return {
      success: true,
      data: {
        baseline: {
          totalEmissionsTonnes: factory.metrics.totalEmissionsTonnes,
          breakdown: factory.breakdown
        },
        simulated: {
          totalEmissionsTonnes: simResults.metrics.totalEmissionsTonnes,
          breakdown: simResults.breakdown
        },
        deltas: {
          co2ReductionTonnes: Math.round(co2ReductionTonnes),
          co2ReductionPct,
          estimatedSavingsUSD,
          newSustainabilityScore: Math.min(98, factory.metrics.sustainabilityScore + Math.round(co2ReductionPct * 0.6))
        }
      }
    };
  },

  /**
   * Query AI Sustainability Copilot grounded in calculated factory data
   */
  async queryCopilot(question, contextData) {
    await delay(600);
    const qLower = (question || "").toLowerCase();

    let answer = "";
    if (qLower.includes("diesel") || qLower.includes("heat") || qLower.includes("largest")) {
      answer = MOCK_AI_KNOWLEDGE_BASE.diesel;
    } else if (qLower.includes("payback") || qLower.includes("fastest") || qLower.includes("roi")) {
      answer = MOCK_AI_KNOWLEDGE_BASE.payback;
    } else if (qLower.includes("recycled") || qLower.includes("scrap") || qLower.includes("feedstock")) {
      answer = MOCK_AI_KNOWLEDGE_BASE.recycled;
    } else if (qLower.includes("cost") || qLower.includes("investment") || qLower.includes("total")) {
      answer = MOCK_AI_KNOWLEDGE_BASE.cost;
    } else if (qLower.includes("score") || qLower.includes("benchmark") || qLower.includes("index")) {
      answer = MOCK_AI_KNOWLEDGE_BASE.benchmark;
    } else {
      const activeFac = contextData?.factoryName || "Apex Steel Fabrication";
      answer = `Telemetry analysis for ${activeFac}: Thermal process heating (Scope 1) and grid power intensity (Scope 2) are your primary emission drivers. Implementing waste heat recuperation and increasing secondary recycled scrap feedstock yields the highest carbon return on investment.`;
    }

    return {
      success: true,
      data: {
        answer,
        groundedIn: {
          factoryName: contextData?.factoryName || "Apex Steel Fabrication",
          totalEmissions: contextData?.totalEmissions || 18450,
          topHotspot: contextData?.topHotspot || "Diesel Process Heating"
        },
        suggestedQuestions: MOCK_AI_SUGGESTED_QUESTIONS,
        timestamp: new Date().toISOString()
      }
    };
  }
};
