import { api } from './api';

export const simulationService = {
  async runSimulation(factoryId, parameters = {}) {
    const scenarioChanges = {
      renewableEnergyPercentage: Number(parameters.renewablePct || 0),
      recycledMaterialPercentage: Number(parameters.recycledMaterialPct || 0),
      fuelReductionPercentage: Number(parameters.fuelReductionPct || 0),
      wasteRecyclingPercentage: Number(parameters.wasteRecycledPct || 0),
      processEfficiencyPercentage: Number(parameters.processEfficiencyPct || 0),
    };

    const res = await api.post('/simulation', {
      factoryId,
      scenarioChanges,
    });

    if (res.success && res.data) {
      const d = res.data;
      return {
        success: true,
        data: {
          baseline: {
            totalEmissionsTonnes: d.baseline?.totalEmissionsTonsCO2e ?? 0,
            annualCostUSD: d.baseline?.annualCostUSD ?? 0,
            categories: d.baseline?.categories ?? []
          },
          simulated: {
            totalEmissionsTonnes: d.projected?.totalEmissionsTonsCO2e ?? 0,
            annualCostUSD: d.projected?.annualCostUSD ?? 0,
            categories: d.projected?.categories ?? []
          },
          deltas: {
            co2ReductionTonnes: Math.round(d.impact?.co2ReductionTons ?? 0),
            co2ReductionPct: Number((d.impact?.percentageReduction ?? 0).toFixed(1)),
            estimatedSavingsUSD: Math.round(d.impact?.estimatedAnnualSavingsUSD ?? 0),
            newSustainabilityScore: Math.min(98, Math.round(50 + (d.impact?.percentageReduction ?? 0) * 0.5))
          },
          raw: d
        }
      };
    }

    return res;
  }
};
