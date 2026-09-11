import { EmissionCalculator } from './emissionCalculator.js';

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

    const renewableEnergyPct = scenarioChanges.renewableEnergyPercentage !== undefined
      ? Number(scenarioChanges.renewableEnergyPercentage)
      : (scenarioChanges.renewableEnergy !== undefined ? Number(scenarioChanges.renewableEnergy) : undefined);

    const recycledMaterialPct = scenarioChanges.recycledMaterialPercentage !== undefined
      ? Number(scenarioChanges.recycledMaterialPercentage)
      : (scenarioChanges.recycledMaterial !== undefined ? Number(scenarioChanges.recycledMaterial) : undefined);

    const fuelReductionPct = scenarioChanges.fuelReductionPercentage !== undefined
      ? Number(scenarioChanges.fuelReductionPercentage)
      : (scenarioChanges.fuelReduction !== undefined ? Number(scenarioChanges.fuelReduction) : undefined);

    const wasteRecyclingPct = scenarioChanges.wasteRecyclingPercentage !== undefined
      ? Number(scenarioChanges.wasteRecyclingPercentage)
      : (scenarioChanges.wasteRecycling !== undefined ? Number(scenarioChanges.wasteRecycling) : undefined);

    const energyEfficiencyPct = scenarioChanges.energyEfficiencyPercentage !== undefined
      ? Number(scenarioChanges.energyEfficiencyPercentage)
      : (scenarioChanges.energyEfficiency !== undefined ? Number(scenarioChanges.energyEfficiency) : undefined);

    const processEfficiencyPct = scenarioChanges.processEfficiencyPercentage !== undefined
      ? Number(scenarioChanges.processEfficiencyPercentage)
      : (scenarioChanges.processEfficiency !== undefined ? Number(scenarioChanges.processEfficiency) : undefined);

    // A. Apply Energy Efficiency (reduces power demand)
    if (energyEfficiencyPct !== undefined && energyEfficiencyPct > 0) {
      const effFactor = (100 - Math.min(100, Math.max(0, energyEfficiencyPct))) / 100;
      modified.energy.gridElectricityKwh = (modified.energy.gridElectricityKwh || 0) * effFactor;
      modified.energy.renewableElectricityKwh = (modified.energy.renewableElectricityKwh || 0) * effFactor;
    }

    // B. Apply Process Efficiency (optimizes material yield and reduces waste generation)
    if (processEfficiencyPct !== undefined && processEfficiencyPct > 0) {
      const procFactor = (100 - Math.min(100, Math.max(0, processEfficiencyPct))) / 100;
      modified.materials.rawMaterialKg = (modified.materials.rawMaterialKg || 0) * procFactor;
      modified.waste.wasteGeneratedKg = (modified.waste.wasteGeneratedKg || 0) * procFactor;
    }

    // C. Apply Renewable Energy Shift (substitutes fossil grid power with zero-carbon/renewable)
    if (renewableEnergyPct !== undefined) {
      const targetRenewablePct = Math.min(100, Math.max(0, renewableEnergyPct));
      const totalElectricityKwh = (modified.energy.gridElectricityKwh || 0) + (modified.energy.renewableElectricityKwh || 0);

      modified.energy.renewableElectricityKwh = totalElectricityKwh * (targetRenewablePct / 100);
      modified.energy.gridElectricityKwh = totalElectricityKwh * ((100 - targetRenewablePct) / 100);
    }

    // D. Apply Fossil Fuel Reductions (Boiler optimization / Electrification / Heat Recovery)
    if (fuelReductionPct !== undefined && fuelReductionPct > 0) {
      const fuelFactor = (100 - Math.min(100, Math.max(0, fuelReductionPct))) / 100;
      modified.energy.dieselLiters = (modified.energy.dieselLiters || 0) * fuelFactor;
      modified.energy.coalKg = (modified.energy.coalKg || 0) * fuelFactor;
      modified.energy.naturalGasM3 = (modified.energy.naturalGasM3 || 0) * fuelFactor;
    }

    // E. Apply Recycled Material Content Increase
    if (recycledMaterialPct !== undefined) {
      const targetRecycledPct = Math.min(100, Math.max(0, recycledMaterialPct));
      modified.materials.recycledMaterialPercentage = targetRecycledPct;
      modified.materials.virginMaterialPercentage = 100 - targetRecycledPct;
    }

    // F. Apply Waste Landfill Diversion to Recycling
    if (wasteRecyclingPct !== undefined) {
      const targetWasteRecycledPct = Math.min(100, Math.max(0, wasteRecyclingPct));
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
