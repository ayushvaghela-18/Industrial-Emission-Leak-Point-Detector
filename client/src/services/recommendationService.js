import { api } from './api';

export function normalizeRecommendation(r = {}) {
  const reductionTonnes = r.estimatedCO2Reduction ?? r.co2ReductionTonnes ?? 0;
  const reductionPct = r.reductionPercentage ?? r.co2ReductionPct ?? 0;
  const savings = r.estimatedAnnualSaving ?? r.annualSavingsUSD ?? Math.round(reductionTonnes * 65);
  const cost = r.estimatedImplementationCost ?? r.implementationCostUSD ?? Math.round(savings * (r.paybackPeriod || 1.5));
  const payback = r.paybackPeriod ?? r.paybackPeriodYears ?? 1.5;

  return {
    id: r.id || `rec-${Math.random().toString(36).substring(2, 9)}`,
    title: r.title || 'Circular Operational Mitigation',
    category: r.category || 'Process Optimization',
    targetHotspot: r.targetHotspot,
    description: r.description || r.whyRecommended || '',
    currentSituation: r.currentSituation || 'Continuous consumption without circular recovery.',
    proposedIntervention: r.proposedAction || r.proposedIntervention || r.description,
    whyRecommended: r.whyRecommended || r.description,
    co2ReductionTonnes: reductionTonnes,
    co2ReductionPct: reductionPct,
    annualSavingsUSD: savings,
    implementationCostUSD: cost,
    paybackPeriodYears: payback,
    feasibility: r.feasibility || 'High',
    feasibilityScore: r.feasibilityScore || (r.feasibility === 'High' ? 90 : 75),
    priority: r.priority || 'Medium',
    raw: r
  };
}

export const recommendationService = {
  async getRecommendations(factoryId) {
    let res = await api.get(`/recommendations/${factoryId}`);
    
    // If not yet generated, trigger backend generation
    if (res.success && (!res.recommendations || res.recommendations.length === 0)) {
      res = await api.post('/recommendations/generate', { factoryId });
    }

    if (res.success && Array.isArray(res.recommendations)) {
      const normalized = res.recommendations.map(normalizeRecommendation);
      return { success: true, data: normalized };
    }

    return { success: true, data: [] };
  },

  async generateRecommendations(payload) {
    const res = await api.post('/recommendations/generate', payload);
    if (res.success && Array.isArray(res.recommendations)) {
      return { success: true, data: res.recommendations.map(normalizeRecommendation) };
    }
    return res;
  }
};
