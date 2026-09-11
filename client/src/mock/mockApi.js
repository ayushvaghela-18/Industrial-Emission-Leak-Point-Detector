import { INITIAL_FACTORIES, MOCK_AI_KNOWLEDGE_BASE } from './mockData';

// In-memory store for frontend session state
let factoriesStore = [...INITIAL_FACTORIES];

const delay = (ms = 400) => new Promise(resolve => setTimeout(resolve, ms));

export const mockApi = {
  // 1. Factory Profiles
  async getFactories() {
    await delay(300);
    return { success: true, data: factoriesStore };
  },

  async getFactoryById(id) {
    await delay(250);
    const factory = factoriesStore.find(f => f.id === id) || factoriesStore[0];
    return { success: true, data: factory };
  },

  async createFactory(factoryData) {
    await delay(500);
    const id = `fac-${Date.now()}`;
    
    // Perform deterministic calculation based on input data
    const calculated = calculateDeterministicMetrics(factoryData.operationalData || factoryData);

    const newFactory = {
      id,
      name: factoryData.name || "New Industrial Facility",
      industry: factoryData.industry || "General Manufacturing",
      location: factoryData.location || "Industrial Zone",
      size: factoryData.size || "SME Facility",
      annualProduction: factoryData.annualProduction || "10,000 Units",
      operationalData: factoryData.operationalData || factoryData,
      metrics: calculated.metrics,
      breakdown: calculated.breakdown,
      hotspots: calculated.hotspots,
      recommendations: calculated.recommendations
    };

    factoriesStore.unshift(newFactory);
    return { success: true, data: newFactory };
  },

  // 2. Emission Calculations & Analysis
  async calculateEmissions(factoryId, inputData) {
    await delay(600);
    const calculated = calculateDeterministicMetrics(inputData);
    
    // Update factory in store if exists
    const idx = factoriesStore.findIndex(f => f.id === factoryId);
    if (idx !== -1) {
      factoriesStore[idx].operationalData = { ...inputData };
      factoriesStore[idx].metrics = calculated.metrics;
      factoriesStore[idx].breakdown = calculated.breakdown;
      factoriesStore[idx].hotspots = calculated.hotspots;
      factoriesStore[idx].recommendations = calculated.recommendations;
    }

    return { success: true, data: calculated };
  },

  // 3. What-If Simulator
  async runSimulation(factoryId, parameters) {
    await delay(350);
    const factory = factoriesStore.find(f => f.id === factoryId) || factoriesStore[0];
    
    const baseline = factory.operationalData;
    
    // Apply slider parameters to baseline copy
    const simulatedInputs = {
      ...baseline,
      renewablePct: parameters.renewablePct ?? baseline.renewablePct,
      recycledMaterialPct: parameters.recycledMaterialPct ?? baseline.recycledMaterialPct,
      wasteRecycledPct: parameters.wasteRecycledPct ?? baseline.wasteRecycledPct,
      dieselLiters: baseline.dieselLiters * (1 - (parameters.fuelReductionPct || 0) / 100),
      electricityKw: baseline.electricityKw * (1 - (parameters.processEfficiencyPct || 0) / 100),
    };

    const simResults = calculateDeterministicMetrics(simulatedInputs);

    const co2ReductionTonnes = Math.max(0, factory.metrics.totalEmissionsTonnes - simResults.metrics.totalEmissionsTonnes);
    const co2ReductionPct = factory.metrics.totalEmissionsTonnes > 0 
      ? ((co2ReductionTonnes / factory.metrics.totalEmissionsTonnes) * 100).toFixed(1)
      : 0;

    const estimatedSavingsUSD = Math.round(co2ReductionTonnes * 65); // $65 per tonne CO2 reduced in energy/material efficiency

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
          co2ReductionPct: parseFloat(co2ReductionPct),
          estimatedSavingsUSD,
          newSustainabilityScore: Math.min(98, factory.metrics.sustainabilityScore + Math.round(co2ReductionPct * 0.6))
        }
      }
    };
  },

  // 4. Grounded AI Copilot Response
  async askCopilot(question, contextData) {
    await delay(700);
    const qLower = (question || "").toLowerCase();
    
    let reply = "";
    if (qLower.includes("diesel") || qLower.includes("heat") || qLower.includes("largest")) {
      reply = MOCK_AI_KNOWLEDGE_BASE.diesel;
    } else if (qLower.includes("payback") || qLower.includes("fastest") || qLower.includes("roi")) {
      reply = MOCK_AI_KNOWLEDGE_BASE.payback;
    } else if (qLower.includes("recycled") || qLower.includes("scrap") || qLower.includes("feedstock")) {
      reply = MOCK_AI_KNOWLEDGE_BASE.recycled;
    } else if (qLower.includes("cost") || qLower.includes("investment") || qLower.includes("total")) {
      reply = MOCK_AI_KNOWLEDGE_BASE.cost;
    } else if (qLower.includes("score") || qLower.includes("benchmark") || qLower.includes("index")) {
      reply = MOCK_AI_KNOWLEDGE_BASE.benchmark;
    } else {
      const activeFac = contextData?.factoryName || "your factory";
      reply = `Analysis for ${activeFac}: Based on calculated operational telemetry, your highest priority emission leak point is direct thermal energy usage (Scope 1). Implementing circular waste heat recuperation and increasing secondary material feedstock provides the highest carbon return on investment (CO2/$ ratio).`;
    }

    return {
      success: true,
      data: {
        answer: reply,
        groundedIn: {
          factoryName: contextData?.factoryName || "Apex Steel Fabrication",
          totalCalculatedEmissions: contextData?.totalEmissions || 18450,
          topHotspot: contextData?.topHotspot || "Diesel Process Heating"
        },
        timestamp: new Date().toISOString()
      }
    };
  }
};

// Deterministic Calculation Engine Helper (Client Mock)
function calculateDeterministicMetrics(inputs = {}) {
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

  // Deterministic emission factors
  const elecEmissions = Math.round(electricityKw * (1 - renewablePct / 100) * 0.000485);
  const dieselEmissions = Math.round(dieselLiters * 0.00268);
  const gasEmissions = Math.round(naturalGasM3 * 0.0020);
  const coalEmissions = Math.round(coalTonnes * 2.42);
  const rawMatEmissions = Math.round(rawMaterialQuantityTonnes * (1 - recycledMaterialPct / 100) * 0.045);
  const transportEmissions = Math.round(transportDistanceKm * 0.010);
  const wasteEmissions = Math.round(wasteGeneratedTonnes * (1 - wasteRecycledPct / 100) * 0.05);

  const total = elecEmissions + dieselEmissions + gasEmissions + coalEmissions + rawMatEmissions + transportEmissions + wasteEmissions;

  const totalEmissions = total > 0 ? total : 12400; // default safe fallback

  const breakdown = [
    { category: "Electricity Consumption", amount: elecEmissions, pct: parseFloat(((elecEmissions / totalEmissions) * 100).toFixed(1)), color: "#0B3D2E", scope: "Scope 2" },
    { category: "Diesel & Fuel Heating", amount: dieselEmissions + gasEmissions + coalEmissions, pct: parseFloat((((dieselEmissions + gasEmissions + coalEmissions) / totalEmissions) * 100).toFixed(1)), color: "#DC2626", scope: "Scope 1" },
    { category: "Raw Materials Sourcing", amount: rawMatEmissions, pct: parseFloat(((rawMatEmissions / totalEmissions) * 100).toFixed(1)), color: "#F59E0B", scope: "Scope 3" },
    { category: "Logistics & Transport", amount: transportEmissions, pct: parseFloat(((transportEmissions / totalEmissions) * 100).toFixed(1)), color: "#0F766E", scope: "Scope 3" },
    { category: "Waste Stream Treatment", amount: wasteEmissions, pct: parseFloat(((wasteEmissions / totalEmissions) * 100).toFixed(1)), color: "#64748B", scope: "Scope 1 & 3" }
  ].filter(b => b.amount > 0);

  // Sort breakdown by emission contribution
  breakdown.sort((a, b) => b.amount - a.amount);

  const topCategory = breakdown[0] || { category: "Thermal Fuel Heating", pct: 35.0, amount: 4000 };

  const hotspots = [
    {
      id: "hot-01",
      title: `${topCategory.category} High Intensity`,
      severity: topCategory.pct > 30 ? "CRITICAL" : "HIGH",
      category: topCategory.category,
      contributionPct: topCategory.pct,
      annualEmissions: topCategory.amount,
      unit: "tCO2e/yr",
      rootCause: `High operational reliance on un-optimized ${topCategory.category.toLowerCase()}.`,
      impactAnalysis: "Accounts for the largest single share of facility emissions.",
      primaryIntervention: "Waste Heat Recovery & High Efficiency Motors",
      potentialCo2Savings: Math.round(topCategory.amount * 0.45),
      potentialCostSavings: Math.round(topCategory.amount * 35)
    }
  ];

  const potentialCo2Reduction = Math.round(totalEmissions * 0.32);
  const potentialAnnualSavings = Math.round(totalEmissions * 22);

  return {
    metrics: {
      totalEmissionsTonnes: totalEmissions,
      carbonIntensity: `${(totalEmissions / 1000).toFixed(2)} tCO2e / unit`,
      potentialCo2Reduction,
      potentialAnnualSavings,
      sustainabilityScore: Math.min(95, Math.max(20, 100 - Math.round(totalEmissions / 250)))
    },
    breakdown,
    hotspots,
    recommendations: INITIAL_FACTORIES[0].recommendations
  };
}
