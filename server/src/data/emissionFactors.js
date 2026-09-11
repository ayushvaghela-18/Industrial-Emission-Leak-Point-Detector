/**
 * Centralized Emission Factors & Financial Baseline Benchmarks
 * Primary Ownership: Member 2 (Backend & Emissions)
 *
 * All factors are deterministic, documented, and expressed in kg CO₂e per physical unit.
 */

export const EMISSION_FACTORS = {
  // Energy & Fuels
  energy: {
    gridElectricity: {
      factor: 0.82,
      unit: 'kg CO₂e / kWh',
      description: 'Standard national/regional grid electricity mix average',
    },
    renewableElectricity: {
      factor: 0.015,
      unit: 'kg CO₂e / kWh',
      description: 'Lifecycle emissions for distributed solar PV and wind',
    },
    diesel: {
      factor: 2.68,
      unit: 'kg CO₂e / Liter',
      description: 'Industrial diesel combustion in stationary boilers/generators',
    },
    coal: {
      factor: 2.42,
      unit: 'kg CO₂e / kg',
      description: 'Industrial bituminous/sub-bituminous coal combustion',
    },
    naturalGas: {
      factor: 2.03,
      unit: 'kg CO₂e / m³',
      description: 'Pipeline natural gas combustion in industrial furnaces/boilers',
    },
  },

  // Raw Materials (kg CO₂e / kg)
  materials: {
    cotton: {
      virgin: 5.50,
      recycled: 1.20,
      unit: 'kg CO₂e / kg',
      industry: 'Textile',
    },
    polyester: {
      virgin: 3.40,
      recycled: 0.90,
      unit: 'kg CO₂e / kg',
      industry: 'Textile / Packaging',
    },
    steel: {
      virgin: 2.30,
      recycled: 0.65,
      unit: 'kg CO₂e / kg',
      industry: 'Metal & Engineering',
    },
    aluminum: {
      virgin: 8.20,
      recycled: 0.95,
      unit: 'kg CO₂e / kg',
      industry: 'Metal & Engineering',
    },
    food_grain: {
      virgin: 1.80,
      recycled: 0.35,
      unit: 'kg CO₂e / kg',
      industry: 'Food Processing',
    },
    paper_cardboard: {
      virgin: 1.10,
      recycled: 0.45,
      unit: 'kg CO₂e / kg',
      industry: 'Packaging',
    },
    general: {
      virgin: 2.50,
      recycled: 0.75,
      unit: 'kg CO₂e / kg',
      industry: 'Manufacturing General',
    },
  },

  // Waste Treatment & Disposal (kg CO₂e / kg)
  waste: {
    landfill: {
      factor: 0.58,
      unit: 'kg CO₂e / kg',
      description: 'Municipal/industrial landfill fugitive methane and degradation',
    },
    recycled: {
      factor: 0.08,
      unit: 'kg CO₂e / kg',
      description: 'Mechanical recycling processing footprint',
    },
    incineration: {
      factor: 0.92,
      unit: 'kg CO₂e / kg',
      description: 'Controlled industrial incineration without heat recovery',
    },
    compost: {
      factor: 0.12,
      unit: 'kg CO₂e / kg',
      description: 'Aerobic industrial composting of organic waste',
    },
  },

  // Transport & Logistics
  transport: {
    roadFreight: {
      factor: 0.105,
      unit: 'kg CO₂e / tkm',
      description: 'Heavy duty diesel freight truck per metric ton-kilometer',
    },
  },
};

/**
 * Benchmark Financial Cost Rates for What-If Estimation
 * Unit currency: USD ($)
 * Note: These are configurable approximations for simulation decision-support.
 */
export const COST_BENCHMARKS = {
  gridElectricityPerKwh: 0.14,
  renewableElectricityPerKwh: 0.08,
  dieselPerLiter: 1.25,
  coalPerKg: 0.18,
  naturalGasPerM3: 0.65,
  virginMaterialPerKg: 2.20,
  recycledMaterialPerKg: 1.45,
  wasteLandfillDisposalPerKg: 0.10,
  wasteRecycledHandlingPerKg: 0.03,
};
