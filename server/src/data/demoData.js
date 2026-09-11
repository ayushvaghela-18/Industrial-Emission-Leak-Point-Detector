/**
 * Synthetic Demo Factories Dataset for Hackathon Presentation
 * Primary Ownership: Member 2 (Backend & Emissions)
 *
 * Clearly tagged with isSyntheticDemo: true.
 * Designed to demonstrate diverse emission leak point profiles across sectors.
 */

export const DEMO_FACTORIES = [
  {
    name: 'Apex Textile Mills',
    industryType: 'Textile',
    location: {
      city: 'Surat',
      country: 'India',
      region: 'Gujarat Industrial Belt',
    },
    contactPerson: {
      name: 'Rajesh Patel',
      email: 'r.patel@apextextiles-demo.com',
    },
    operationalProfile: {
      operatingHoursPerYear: 5500,
      facilityAreaSqMeters: 18000,
      employeeCount: 320,
    },
    isSyntheticDemo: true,
    processData: {
      reportingPeriod: '2024-2025 Annual Operational Baseline',
      energy: {
        gridElectricityKwh: 1250000, // Heavy spinning & weaving power
        renewableElectricityKwh: 50000,
        dieselLiters: 18000,
        coalKg: 420000,              // Coal-fired dyeing boilers (Massive Scope 1 leak point!)
        naturalGasM3: 0,
      },
      materials: {
        materialType: 'cotton',
        rawMaterialKg: 350000,
        virginMaterialPercentage: 85,
        recycledMaterialPercentage: 15,
      },
      production: {
        productionVolumeUnits: 850000,
        productionUnit: 'meters fabric',
      },
      waste: {
        wasteGeneratedKg: 48000,
        wasteType: 'textile_yarn_scrap',
        wasteLandfillPercentage: 80,
        wasteRecycledPercentage: 20,
        wasteDisposalMethod: 'municipal_landfill',
      },
      logistics: {
        transportTkm: 65000,
        vehicleType: 'roadFreight',
      },
    },
  },

  {
    name: 'GreenHarvest Food Processors',
    industryType: 'Food Processing',
    location: {
      city: 'Nashik',
      country: 'India',
      region: 'Agro Processing Zone',
    },
    contactPerson: {
      name: 'Sunita Deshmukh',
      email: 's.deshmukh@greenharvest-demo.com',
    },
    operationalProfile: {
      operatingHoursPerYear: 4800,
      facilityAreaSqMeters: 12000,
      employeeCount: 140,
    },
    isSyntheticDemo: true,
    processData: {
      reportingPeriod: '2024-2025 Annual Operational Baseline',
      energy: {
        gridElectricityKwh: 880000,  // Continuous cold storage and freezing chillers
        renewableElectricityKwh: 120000, // Rooftop solar setup
        dieselLiters: 12000,
        coalKg: 0,
        naturalGasM3: 165000,         // Steam boiler for blanching and pasteurization
      },
      materials: {
        materialType: 'food_grain',
        rawMaterialKg: 520000,
        virginMaterialPercentage: 95,
        recycledMaterialPercentage: 5,
      },
      production: {
        productionVolumeUnits: 450000,
        productionUnit: 'packaged cases',
      },
      waste: {
        wasteGeneratedKg: 62000,
        wasteType: 'organic_pomace_peels',
        wasteLandfillPercentage: 70,
        wasteRecycledPercentage: 30,
        wasteDisposalMethod: 'landfill_compost_mix',
      },
      logistics: {
        transportTkm: 82000,
        vehicleType: 'refrigerated_truck',
      },
    },
  },

  {
    name: 'Vulcan Precision Engineering',
    industryType: 'Metal & Engineering',
    location: {
      city: 'Pune',
      country: 'India',
      region: 'Automotive Industrial Cluster',
    },
    contactPerson: {
      name: 'Amitabh Sen',
      email: 'a.sen@vulcaneng-demo.com',
    },
    operationalProfile: {
      operatingHoursPerYear: 6000,
      facilityAreaSqMeters: 24000,
      employeeCount: 210,
    },
    isSyntheticDemo: true,
    processData: {
      reportingPeriod: '2024-2025 Annual Operational Baseline',
      energy: {
        gridElectricityKwh: 1650000, // CNC machining centers, induction heat-treat
        renewableElectricityKwh: 0,
        dieselLiters: 45000,         // Backup generators during grid outages
        coalKg: 0,
        naturalGasM3: 40000,
      },
      materials: {
        materialType: 'steel',
        rawMaterialKg: 780000,       // Heavy virgin steel billets (Scope 3 massive leak point!)
        virginMaterialPercentage: 90,
        recycledMaterialPercentage: 10,
      },
      production: {
        productionVolumeUnits: 120000,
        productionUnit: 'precision components',
      },
      waste: {
        wasteGeneratedKg: 85000,
        wasteType: 'metal_turnings_swarf',
        wasteLandfillPercentage: 35,
        wasteRecycledPercentage: 65,
        wasteDisposalMethod: 'scrap_merchant_recycler',
      },
      logistics: {
        transportTkm: 110000,
        vehicleType: 'heavy_flatbed_truck',
      },
    },
  },
];
