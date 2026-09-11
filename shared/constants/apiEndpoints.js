/**
 * Shared API Endpoints Contract
 *
 * NOTE: This file is located in the shared/ layer.
 * Changes to these constants require agreement across all 3 developers.
 */
export const API_ENDPOINTS = {
  HEALTH: '/api/health',

  // Factories
  FACTORIES: '/api/factories',
  FACTORY_BY_ID: (id) => `/api/factories/${id}`,

  // Emissions
  EMISSIONS_ANALYZE: '/api/emissions/analyze',
  EMISSIONS_BY_FACTORY: (factoryId) => `/api/emissions/${factoryId}`,

  // Recommendations
  RECOMMENDATIONS_GENERATE: '/api/recommendations/generate',
  RECOMMENDATIONS_BY_FACTORY: (factoryId) => `/api/recommendations/${factoryId}`,

  // Simulation
  SIMULATION: '/api/simulation',

  // AI Assistant
  AI_CHAT: '/api/ai/chat',
};
