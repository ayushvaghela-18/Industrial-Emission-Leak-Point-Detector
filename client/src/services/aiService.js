import { api } from './api';
import { mockApi } from '../mock/mockApi';

export const aiService = {
  async askCopilot(question, contextData) {
    return api.fetchWithFallback(`/ai/copilot`, {
      method: 'POST',
      body: JSON.stringify({ question, contextData })
    }, () => mockApi.askCopilot(question, contextData));
  }
};
