import { EMISSION_FACTORS, COST_BENCHMARKS } from '../../data/emissionFactors.js';
import { EMISSION_CATEGORIES, SCOPES, UNITS } from '../../constants/index.js';

/**
 * Deterministic Industrial Emission Calculation Engine
 * Primary Ownership: Member 2 (Backend & Emissions)
 *
 * Authoritative mathematical calculation of emissions across all operational scopes.
 * NO LLM or probabilistic reasoning is used in these numerical calculations.
 */
export class EmissionCalculator {
  /**
   * Calculates comprehensive emission footprint from normalized process inputs.
   * @param {Object} processData - FactoryProcessData object or raw payload
   * @returns {Object} Deterministic calculation results
   */
  static calculate(processData) {
    const energy = processData.energy || {};
    const materials = processData.materials || {};
    const waste = processData.waste || {};
    const logistics = processData.logistics || {};
    const production = processData.production || {};

    const sources = [];

    // 1. Grid Electricity (Scope 2)
    const gridKwh = Number(energy.gridElectricityKwh) || 0;
    const gridFactor = EMISSION_FACTORS.energy.gridElectricity.factor;
    const gridEmissionsKg = gridKwh * gridFactor;
    sources.push({
      source: 'Grid Electricity',
      category: EMISSION_CATEGORIES.ENERGY,
      scope: SCOPES.SCOPE_2,
      inputAmount: gridKwh,
      inputUnit: UNITS.ELECTRICITY,
      factorUsed: gridFactor,
      factorUnit: EMISSION_FACTORS.energy.gridElectricity.unit,
      emissionsKgCO2e: gridEmissionsKg,
      emissionsTonsCO2e: gridEmissionsKg / 1000,
    });

    // 2. Renewable Electricity (Scope 2)
    const renewKwh = Number(energy.renewableElectricityKwh) || 0;
    const renewFactor = EMISSION_FACTORS.energy.renewableElectricity.factor;
    const renewEmissionsKg = renewKwh * renewFactor;
    sources.push({
      source: 'Renewable Electricity (Lifecycle)',
      category: EMISSION_CATEGORIES.ENERGY,
      scope: SCOPES.SCOPE_2,
      inputAmount: renewKwh,
      inputUnit: UNITS.ELECTRICITY,
      factorUsed: renewFactor,
      factorUnit: EMISSION_FACTORS.energy.renewableElectricity.unit,
      emissionsKgCO2e: renewEmissionsKg,
      emissionsTonsCO2e: renewEmissionsKg / 1000,
    });

    // 3. Diesel Combustion (Scope 1)
    const dieselLiters = Number(energy.dieselLiters) || 0;
    const dieselFactor = EMISSION_FACTORS.energy.diesel.factor;
    const dieselEmissionsKg = dieselLiters * dieselFactor;
    sources.push({
      source: 'Diesel Fuel',
      category: EMISSION_CATEGORIES.ENERGY,
      scope: SCOPES.SCOPE_1,
      inputAmount: dieselLiters,
      inputUnit: UNITS.DIESEL,
      factorUsed: dieselFactor,
      factorUnit: EMISSION_FACTORS.energy.diesel.unit,
      emissionsKgCO2e: dieselEmissionsKg,
      emissionsTonsCO2e: dieselEmissionsKg / 1000,
    });

    // 4. Coal Combustion (Scope 1)
    const coalKg = Number(energy.coalKg) || 0;
    const coalFactor = EMISSION_FACTORS.energy.coal.factor;
    const coalEmissionsKg = coalKg * coalFactor;
    sources.push({
      source: 'Industrial Coal',
      category: EMISSION_CATEGORIES.ENERGY,
      scope: SCOPES.SCOPE_1,
      inputAmount: coalKg,
      inputUnit: UNITS.COAL,
      factorUsed: coalFactor,
      factorUnit: EMISSION_FACTORS.energy.coal.unit,
      emissionsKgCO2e: coalEmissionsKg,
      emissionsTonsCO2e: coalEmissionsKg / 1000,
    });

    // 5. Natural Gas (Scope 1)
    const natGasM3 = Number(energy.naturalGasM3) || 0;
    const natGasFactor = EMISSION_FACTORS.energy.naturalGas.factor;
    const natGasEmissionsKg = natGasM3 * natGasFactor;
    sources.push({
      source: 'Natural Gas',
      category: EMISSION_CATEGORIES.ENERGY,
      scope: SCOPES.SCOPE_1,
      inputAmount: natGasM3,
      inputUnit: UNITS.NATURAL_GAS,
      factorUsed: natGasFactor,
      factorUnit: EMISSION_FACTORS.energy.naturalGas.unit,
      emissionsKgCO2e: natGasEmissionsKg,
      emissionsTonsCO2e: natGasEmissionsKg / 1000,
    });

    // 6. Raw Materials (Scope 3)
    const rawKg = Number(materials.rawMaterialKg) || 0;
    const matTypeKey = (materials.materialType || 'general').toLowerCase();
    const materialFactorConfig = EMISSION_FACTORS.materials[matTypeKey] || EMISSION_FACTORS.materials.general;

    const virginPct = materials.virginMaterialPercentage !== undefined ? Number(materials.virginMaterialPercentage) : 100;
    const recycledPct = materials.recycledMaterialPercentage !== undefined ? Number(materials.recycledMaterialPercentage) : 0;

    const virginKg = rawKg * (virginPct / 100);
    const recycledKg = rawKg * (recycledPct / 100);

    const virginEmissionsKg = virginKg * materialFactorConfig.virgin;
    const recycledEmissionsKg = recycledKg * materialFactorConfig.recycled;

    sources.push({
      source: `Virgin Raw Materials (${materials.materialType || 'General'})`,
      category: EMISSION_CATEGORIES.MATERIALS,
      scope: SCOPES.SCOPE_3,
      inputAmount: virginKg,
      inputUnit: UNITS.RAW_MATERIAL,
      factorUsed: materialFactorConfig.virgin,
      factorUnit: materialFactorConfig.unit,
      emissionsKgCO2e: virginEmissionsKg,
      emissionsTonsCO2e: virginEmissionsKg / 1000,
    });

    if (recycledKg > 0) {
      sources.push({
        source: `Recycled Materials (${materials.materialType || 'General'})`,
        category: EMISSION_CATEGORIES.MATERIALS,
        scope: SCOPES.SCOPE_3,
        inputAmount: recycledKg,
        inputUnit: UNITS.RAW_MATERIAL,
        factorUsed: materialFactorConfig.recycled,
        factorUnit: materialFactorConfig.unit,
        emissionsKgCO2e: recycledEmissionsKg,
        emissionsTonsCO2e: recycledEmissionsKg / 1000,
      });
    }

    // 7. Waste Disposal (Scope 3)
    const wasteKg = Number(waste.wasteGeneratedKg) || 0;
    const landfillPct = waste.wasteLandfillPercentage !== undefined ? Number(waste.wasteLandfillPercentage) : 100;
    const wasteRecycledPct = waste.wasteRecycledPercentage !== undefined ? Number(waste.wasteRecycledPercentage) : 0;

    const landfillKg = wasteKg * (landfillPct / 100);
    const wasteRecycledKg = wasteKg * (wasteRecycledPct / 100);

    const landfillFactor = EMISSION_FACTORS.waste.landfill.factor;
    const wasteRecycledFactor = EMISSION_FACTORS.waste.recycled.factor;

    const landfillEmissionsKg = landfillKg * landfillFactor;
    const wasteRecycledEmissionsKg = wasteRecycledKg * wasteRecycledFactor;

    sources.push({
      source: 'Waste Landfill Degradation',
      category: EMISSION_CATEGORIES.WASTE,
      scope: SCOPES.SCOPE_3,
      inputAmount: landfillKg,
      inputUnit: UNITS.WASTE,
      factorUsed: landfillFactor,
      factorUnit: EMISSION_FACTORS.waste.landfill.unit,
      emissionsKgCO2e: landfillEmissionsKg,
      emissionsTonsCO2e: landfillEmissionsKg / 1000,
    });

    if (wasteRecycledKg > 0) {
      sources.push({
        source: 'Waste Recycling Processing',
        category: EMISSION_CATEGORIES.WASTE,
        scope: SCOPES.SCOPE_3,
        inputAmount: wasteRecycledKg,
        inputUnit: UNITS.WASTE,
        factorUsed: wasteRecycledFactor,
        factorUnit: EMISSION_FACTORS.waste.recycled.unit,
        emissionsKgCO2e: wasteRecycledEmissionsKg,
        emissionsTonsCO2e: wasteRecycledEmissionsKg / 1000,
      });
    }

    // 8. Logistics & Transport (Scope 3)
    const transportTkm = Number(logistics.transportTkm) || 0;
    const transportFactor = EMISSION_FACTORS.transport.roadFreight.factor;
    const transportEmissionsKg = transportTkm * transportFactor;
    sources.push({
      source: 'Road Freight Transportation',
      category: EMISSION_CATEGORIES.LOGISTICS,
      scope: SCOPES.SCOPE_3,
      inputAmount: transportTkm,
      inputUnit: UNITS.TRANSPORT,
      factorUsed: transportFactor,
      factorUnit: EMISSION_FACTORS.transport.roadFreight.unit,
      emissionsKgCO2e: transportEmissionsKg,
      emissionsTonsCO2e: transportEmissionsKg / 1000,
    });

    // Aggregate Total Emissions
    const totalEmissionsKg = sources.reduce((sum, s) => sum + s.emissionsKgCO2e, 0);
    const totalEmissionsTons = totalEmissionsKg / 1000;

    // Calculate Source Percentages
    const sourcesWithPercentages = sources.map((s) => {
      const percentage = totalEmissionsKg > 0 ? (s.emissionsKgCO2e / totalEmissionsKg) * 100 : 0;
      return {
        ...s,
        emissionsKgCO2e: Math.round(s.emissionsKgCO2e * 100) / 100,
        emissionsTonsCO2e: Math.round(s.emissionsTonsCO2e * 1000) / 1000,
        percentage: Math.round(percentage * 100) / 100,
      };
    });

    // Aggregate Categories
    const categoryMap = {};
    for (const s of sourcesWithPercentages) {
      if (!categoryMap[s.category]) {
        categoryMap[s.category] = {
          category: s.category,
          emissionsKgCO2e: 0,
          emissionsTonsCO2e: 0,
          percentage: 0,
        };
      }
      categoryMap[s.category].emissionsKgCO2e += s.emissionsKgCO2e;
      categoryMap[s.category].emissionsTonsCO2e += s.emissionsTonsCO2e;
    }

    const categories = Object.values(categoryMap).map((cat) => {
      const percentage = totalEmissionsKg > 0 ? (cat.emissionsKgCO2e / totalEmissionsKg) * 100 : 0;
      return {
        category: cat.category,
        emissionsKgCO2e: Math.round(cat.emissionsKgCO2e * 100) / 100,
        emissionsTonsCO2e: Math.round(cat.emissionsTonsCO2e * 1000) / 1000,
        percentage: Math.round(percentage * 100) / 100,
      };
    });

    // Baseline Product Emission Intensity
    const prodVolume = Number(production.productionVolumeUnits) || 0;
    const emissionIntensity = prodVolume > 0 ? totalEmissionsKg / prodVolume : 0;

    // Baseline Operational Cost Approximation
    const energyCost = (gridKwh * COST_BENCHMARKS.gridElectricityPerKwh) +
      (renewKwh * COST_BENCHMARKS.renewableElectricityPerKwh) +
      (dieselLiters * COST_BENCHMARKS.dieselPerLiter) +
      (coalKg * COST_BENCHMARKS.coalPerKg) +
      (natGasM3 * COST_BENCHMARKS.naturalGasPerM3);

    const materialCost = (virginKg * COST_BENCHMARKS.virginMaterialPerKg) +
      (recycledKg * COST_BENCHMARKS.recycledMaterialPerKg);

    const wasteCost = (landfillKg * COST_BENCHMARKS.wasteLandfillDisposalPerKg) +
      (wasteRecycledKg * COST_BENCHMARKS.wasteRecycledHandlingPerKg);

    const annualOperationalCostEstimate = Math.round((energyCost + materialCost + wasteCost) * 100) / 100;

    return {
      totalEmissionsKgCO2e: Math.round(totalEmissionsKg * 100) / 100,
      totalEmissionsTonsCO2e: Math.round(totalEmissionsTons * 1000) / 1000,
      categories,
      sources: sourcesWithPercentages,
      baselineMetrics: {
        emissionIntensityPerUnit: Math.round(emissionIntensity * 1000) / 1000,
        productionUnit: production.productionUnit || 'units',
        annualOperationalCostEstimate,
      },
    };
  }
}

export default EmissionCalculator;
