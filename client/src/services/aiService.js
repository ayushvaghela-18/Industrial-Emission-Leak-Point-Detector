import { api } from './api';

export const aiService = {
  async askCopilot(question, contextData = {}) {
    const payload = {
      userQuestion: question,
      factoryId: contextData.factoryId,
      factoryContext: {
        factoryName: contextData.factoryName,
        totalEmissions: contextData.totalEmissions,
        topHotspot: contextData.topHotspot,
      }
    };

    const res = await api.post('/ai/chat', payload);

    if (res.success) {
      return {
        success: true,
        data: {
          answer: res.answer || res.data?.answer || 'Analysis completed.',
          supportingMetrics: res.supportingMetrics || res.data?.supportingMetrics,
          referencedRecommendations: res.referencedRecommendations || res.data?.referencedRecommendations,
        }
      };
    }

    return res;
  }
};
