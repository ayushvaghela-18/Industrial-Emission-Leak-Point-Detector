import { api } from './api';
import { mockApi } from '../mock/mockApi';

export const simulationService = {
  async runSimulation(factoryId, parameters) {
    return api.fetchWithFallback(`/simulator/run`, {
      method: 'POST',
      body: JSON.stringify({ factoryId, parameters })
    }, () => mockApi.runSimulation(factoryId, parameters));
  }
};
