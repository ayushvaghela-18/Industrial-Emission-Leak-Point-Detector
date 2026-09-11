import { api } from './api';
import { mockApi } from '../mock/mockApi';

export const factoryService = {
  async getFactories() {
    return api.fetchWithFallback('/factories', { method: 'GET' }, () => mockApi.getFactories());
  },

  async getFactoryById(id) {
    return api.fetchWithFallback(`/factories/${id}`, { method: 'GET' }, () => mockApi.getFactoryById(id));
  },

  async createFactory(factoryData) {
    return api.fetchWithFallback('/factories', {
      method: 'POST',
      body: JSON.stringify(factoryData)
    }, () => mockApi.createFactory(factoryData));
  }
};
