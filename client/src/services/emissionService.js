import { api } from './api';
import { mockApi } from '../mock/mockApi';

export const emissionService = {
  async calculateEmissions(factoryId, operationalData) {
    return api.fetchWithFallback(`/emissions/calculate`, {
      method: 'POST',
      body: JSON.stringify({ factoryId, ...operationalData })
    }, () => mockApi.calculateEmissions(factoryId, operationalData));
  },

  async getBreakdown(factoryId) {
    return api.fetchWithFallback(`/emissions/breakdown/${factoryId}`, { method: 'GET' }, async () => {
      const fac = await mockApi.getFactoryById(factoryId);
      return { success: true, data: fac.data.breakdown };
    });
  },

  async getHotspots(factoryId) {
    return api.fetchWithFallback(`/emissions/hotspots/${factoryId}`, { method: 'GET' }, async () => {
      const fac = await mockApi.getFactoryById(factoryId);
      return { success: true, data: fac.data.hotspots };
    });
  }
};
