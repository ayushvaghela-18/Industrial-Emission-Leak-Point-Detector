import { EmissionCalculator } from './emissionCalculator.js';
import { COST_BENCHMARKS } from '../../data/emissionFactors.js';

/**
 * Deterministic What-If Scenario Simulation Service
 * Primary Ownership: Member 2 (Backend & Emissions)
 *
 * Models the environmental and financial impacts of operational changes
 * without modifying baseline production records.
 */
export class SimulationService {
  /**
   * Simulates emissions and cost changes under alternative operational parameters.
   * @param {Object} baselineProcessData - Current baseline process metrics
   * @param {Object} scenarioChanges - Operational assumptions to change
   * @returns {Object} Deterministic before-and-after simulation analysis
   */
  static simulate(baselineProcessData, scenarioChanges = {}) {
    // 1. Calculate Baseline
    const baselineResults = EmissionCalculator.calculate(baselineProcessData);

    // 2. Clone and apply operational modifications
    const modified = JSON.parse(JSON.stringify(baselineProcessData));
    modified.energy = modified.energy || {};
    modified.materials = modified.materials || {};
    modified.waste = modified.waste || {};

    const {
      renewableEnergyPercentage, // Target % of electricity from renewables (0 - 100)
      recycledMaterialPercentage, // Target % of raw materials from recycled (0 - 100)
      fuelReductionPercentage,    // % reduction in fossil fuels (diesel, coal, gas) (0 - 100)
      wasteRecyclingPercentage,   // % of waste diverted to recycling (0 - 100)
      energyEfficiencyPercentage, // % reduction in total power demand (0 - 100)
    } = scenarioChanges;

    // Apply Energy Efficiency first if specified
    if (energyEfficiencyPercentage !== undefined && energyEfficiencyPercentage > 0) {
      const effFactor = (100 - Math.min(100, Math.max(0, energyEfficiencyPercentage))) / 100;
      modified.energy.gridElectricityKwh = (modified.energy.gridElectricityKwh || 0) * effFactor;
      modified.energy.renewableElectricityKwh = (modified.energy.renewableElectricityKwh || 0) * effFactor;
    }

    // Apply Renewable Energy Shift
    if (renewableEnergyPercentage !== undefined) {
      const targetRenewablePct = Math.min(100, Math.max(0, Number(renewableEnergyPercentage)));
      const totalElectricityKwh = (modified.energy.gridElectricityKwh || 0) + (modified.energy.renewableElectricityKwh || 0);

      modified.energy.renewableElectricityKwh = totalElectricityKwh * (targetRenewablePct / 100);
      modified.energy.gridElectricityKwh = totalElectricityKwh * ((100 - targetRenewablePct) / 100);
    }

    // Apply Fossil Fuel Reductions (Boiler optimization / Electrification)
    if (fuelReductionPercentage !== undefined && fuelReductionPercentage > 0) {
      const fuelFactor = (100 - Math.min(100, Math.max(0, Number(fuelReductionPercentage)))) / 100;
      modified.energy.dieselLiters = (modified.energy.dieselLiters || 0) * fuelFactor;
      modified.energy.coalKg = (modified.energy.coalKg || 0) * fuelFactor;
      modified.energy.naturalGasM3 = (modified.energy.naturalGasM3 || 0) * fuelFactor;
    }

    // Apply Recycled Material Increase
    if (recycledMaterialPercentage !== undefined) {
      const targetRecycledPct = Math.min(100, Math.max(0, Number(recycledMaterialPercentage)));
      modified.materials.recycledMaterialPercentage = targetRecycledPct;
      modified.materials.virginMaterialPercentage = 100 - targetRecycledPct;
    }

    // Apply Waste Landfill Diversion
    if (wasteRecyclingPercentage !== undefined) {
      const targetWasteRecycledPct = Math.min(100, Math.max(0, Number(wasteRecyclingPercentage)));
      modified.waste.wasteRecycledPercentage = targetWasteRecycledPct;
      modified.waste.wasteLandfillPercentage = 100 - targetWasteRecycledPct;
    }

    // 3. Calculate Projected Results
    const projectedResults = EmissionCalculator.calculate(modified);

    // 4. Compute Differentials
    const baselineTons = baselineResults.totalEmissionsTonsCO2e;
    const projectedTons = projectedResults.totalEmissionsTonsCO2e;
    const co2ReductionTons = Math.max(0, Math.round((baselineTons - projectedTons) * 1000) / 1000);
    const percentageReduction = baselineTons > 0
      ? Math.round(((baselineTons - projectedTons) / baselineTons) * 10000) / 100
      : 0;

    // 5. Compute Financial Differentials
    const baselineAnnualCost = baselineResults.baselineMetrics.annualOperationalCostEstimate;
    const projectedAnnualCost = projectedResults.baselineMetrics.annualOperationalCostEstimate;
    const estimatedAnnualSavings = Math.round((baselineAnnualCost - projectedAnnualCost) * 100) / 100;

    // Category-by-category comparison
    const categoryComparison = baselineResults.categories.map((baseCat) => {
      const projCat = projectedResults.categories.find((c) => c.category === baseCat.category) || {
        emissionsTonsCO2e: 0,
        percentage: 0,
      };
      const diffTons = Math.round((baseCat.emissionsTonsCO2e - projCat.emissionsTonsCO2e) * 1000) / 1000;
      return {
        category: baseCat.category,
        baselineTons: baseCat.emissionsTonsCO2e,
        projectedTons: projCat.emissionsTonsCO2e,
        reductionTons: diffTons,
        percentageReduction: baseCat.emissionsTonsCO2e > 0
          ? Math.round((diffTons / baseCat.emissionsTonsCO2e) * 10000) / 100
          : 0,
      };
    });

    return {
      simulationApplied: scenarioChanges,
      baseline: {
        totalEmissionsTonsCO2e: baselineTons,
        totalEmissionsKgCO2e: baselineResults.totalEmissionsKgCO2e,
        annualCostUSD: baselineAnnualCost,
        categories: baselineResults.categories,
      },
      projected: {
        totalEmissionsTonsCO2e: projectedTons,
        totalEmissionsKgCO2e: projectedResults.totalEmissionsKgCO2e,
        annualCostUSD: projectedAnnualCost,
        categories: projectedResults.categories,
      },
      impact: {
        co2ReductionTons,
        percentageReduction,
        estimatedAnnualSavingsUSD: estimatedAnnualSavings,
        favorableFinancialOutcome: estimatedAnnualSavings >= 0,
        categoryComparison,
      },
      disclaimer:
        'Financial estimates are indicative decision-support figures based on standard benchmark rates and do not represent guaranteed commercial quotes.',
    };
  }
}

export default SimulationService;
