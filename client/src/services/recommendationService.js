import { api } from './api';
import { mockApi } from '../mock/mockApi';

export const recommendationService = {
  async getRecommendations(factoryId) {
    return api.fetchWithFallback(`/recommendations/${factoryId}`, { method: 'GET' }, async () => {
      const fac = await mockApi.getFactoryById(factoryId);
      return { success: true, data: fac.data.recommendations };
    });
  }
};
