import { api } from './api';
import { formatProcessData } from './factoryService';

export const emissionService = {
  async calculateEmissions(factoryId, operationalData) {
    const processData = formatProcessData(operationalData);
    return api.post('/emissions/analyze', {
      factoryId,
      processData,
    });
  },

  async getEmissionsByFactory(factoryId) {
    return api.get(`/emissions/${factoryId}`);
  },

  async getBreakdown(factoryId) {
    const res = await api.get(`/emissions/${factoryId}`);
    if (res.success && res.data?.latestAnalysis) {
      return { success: true, data: res.data.latestAnalysis.categories || [] };
    }
    return res;
  },

  async getHotspots(factoryId) {
    const res = await api.get(`/emissions/${factoryId}`);
    if (res.success && res.data?.latestAnalysis) {
      return { success: true, data: res.data.latestAnalysis.hotspots || [] };
    }
    return res;
  }
};
