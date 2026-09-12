import { api } from './api';

export function mapIndustryType(val = '') {
  const v = String(val).toLowerCase();
  if (v.includes('textile') || v.includes('fabric')) return 'Textile';
  if (v.includes('food') || v.includes('beverage')) return 'Food Processing';
  if (v.includes('metal') || v.includes('steel') || v.includes('metallurgy') || v.includes('engineering')) return 'Metal & Engineering';
  if (v.includes('chemical') || v.includes('polymer')) return 'Chemical';
  if (v.includes('paper') || v.includes('pack')) return 'Plastics & Packaging';
  return 'Manufacturing';
}

export function mapMaterialType(val = '') {
  const v = String(val || '').toLowerCase();
  if (v.includes('cotton') || v.includes('yarn')) return 'cotton';
  if (v.includes('poly') || v.includes('nylon')) return 'polyester';
  if (v.includes('steel') || v.includes('iron') || v.includes('billet')) return 'steel';
  if (v.includes('alumin')) return 'aluminum';
  if (v.includes('grain') || v.includes('wheat') || v.includes('flour') || v.includes('food')) return 'food_grain';
  if (v.includes('paper') || v.includes('cardboard')) return 'paper_cardboard';
  return 'general';
}

export function formatProcessData(op = {}) {
  const electricity = Number(op.electricityKw || 0);
  const renewPct = Math.min(100, Math.max(0, Number(op.renewablePct || 0)));
  const renewKwh = (electricity * renewPct) / 100;
  const gridKwh = Math.max(0, electricity - renewKwh);

  const rawMaterialKg = Number(op.rawMaterialQuantityTonnes || 0) * 1000;
  const recycledMaterialPercentage = Math.min(100, Math.max(0, Number(op.recycledMaterialPct || 0)));
  const virginMaterialPercentage = Math.max(0, 100 - recycledMaterialPercentage);

  const wasteGeneratedKg = Number(op.wasteGeneratedTonnes || 0) * 1000;
  const wasteRecycledPercentage = Math.min(100, Math.max(0, Number(op.wasteRecycledPct || 0)));
  const wasteLandfillPercentage = Math.max(0, 100 - wasteRecycledPercentage);

  const transportTkm = ((Number(op.rawMaterialQuantityTonnes || 1000)) * Number(op.transportDistanceKm || 0)) / 1000;

  return {
    energy: {
      gridElectricityKwh: gridKwh,
      renewableElectricityKwh: renewKwh,
      dieselLiters: Number(op.dieselLiters || 0),
      coalKg: Number(op.coalTonnes || 0) * 1000,
      naturalGasM3: Number(op.naturalGasM3 || 0),
    },
    materials: {
      materialType: mapMaterialType(op.rawMaterialType),
      rawMaterialKg,
      recycledMaterialPercentage,
      virginMaterialPercentage,
    },
    waste: {
      wasteGeneratedKg,
      wasteRecycledPercentage,
      wasteLandfillPercentage,
    },
    logistics: {
      transportTkm,
    }
  };
}

export const factoryService = {
  async getFactories() {
    const res = await api.get('/factories');
    // If backend database has no factories, seed the 3 standard demo factories once
    if (res.success && Array.isArray(res.data) && res.data.length === 0) {
      try {
        await api.post('/factories/seed');
        return await api.get('/factories');
      } catch (seedErr) {
        console.warn('Auto-seed check failed:', seedErr.message);
      }
    }
    return res;
  },

  async getFactoryById(id) {
    return api.get(`/factories/${id}`);
  },

  async createFactory(factoryData) {
    const payload = {
      name: factoryData.name?.trim(),
      industryType: mapIndustryType(factoryData.industry),
      location: typeof factoryData.location === 'string'
        ? { city: factoryData.location, country: 'India' }
        : (factoryData.location || { city: 'Industrial Zone', country: 'India' }),
      operationalProfile: {
        employeeCount: parseInt(factoryData.size) || 150,
        operatingHoursPerYear: 4500,
      },
      processData: factoryData.operationalData ? formatProcessData(factoryData.operationalData) : undefined
    };

    return api.post('/factories', payload);
  },

  async seedDemoFactories() {
    return api.post('/factories/seed');
  }
};
