/**
 * EcoForge AI — AI Copilot Controller
 * 
 * Express request handler for the AI Sustainability Copilot chat interface.
 * Primary Ownership: Member 3 (Circular Recommendation & AI Copilot)
 */

import { askCopilot } from './aiCopilotService.js';
import { generateRecommendations } from '../recommendations/recommendationEngine.js';
import { EmissionAnalysisRepository, FactoryRepository } from '../../utils/repository.js';

/**
 * POST /api/ai/chat
 * Endpoint for asking conversational grounded questions to the AI Copilot.
 */
export async function aiChatHandler(req, res) {
  try {
    const rawBody = req.body || {};
    const payload = rawBody.data || rawBody;

    const userQuestion = (
      payload.userQuestion ||
      payload.question ||
      payload.message ||
      payload.query ||
      payload.prompt ||
      rawBody.userQuestion ||
      rawBody.question ||
      rawBody.message ||
      ''
    ).trim();

    const {
      factoryId,
      factoryContext = {},
      analysisContext = {},
      recommendationContext = [],
      simulationResults = null,
      factoryProfile = {},
      operationalData = {},
      totalEmissionsTons,
      categoryBreakdown,
      topHotspots,
      recommendations: inputRecommendations,
    } = payload;

    let targetFactoryId = factoryId || factoryContext.factoryId || analysisContext.factoryId || factoryProfile.id || null;
    let effectiveAnalysis = { ...analysisContext };
    let effectiveFactory = { ...factoryProfile, ...(factoryContext.factoryProfile || analysisContext.factoryProfile || {}) };

    // DB Hydration: If factoryId is supplied but analysisContext is not fully provided, read from DB
    if (targetFactoryId && (!effectiveAnalysis.totalEmissionsTonsCO2e && !effectiveAnalysis.totalEmissionsTons && !totalEmissionsTons)) {
      try {
        const factoryDoc = await FactoryRepository.findById(targetFactoryId);
        const latestAnalysisDoc = await EmissionAnalysisRepository.findLatestByFactoryId
          ? await EmissionAnalysisRepository.findLatestByFactoryId(targetFactoryId)
          : (await EmissionAnalysisRepository.findByFactoryId(targetFactoryId))?.[0];

        if (latestAnalysisDoc) {
          effectiveAnalysis = latestAnalysisDoc;
          if (factoryDoc) effectiveFactory = factoryDoc;
        }
      } catch (dbErr) {
        console.warn(`Could not hydrate AI copilot analysis from DB for ${targetFactoryId}:`, dbErr.message);
      }
    }

    // Auto-generate recommendations if not explicitly passed
    let effectiveRecs = inputRecommendations || recommendationContext || analysisContext.recommendations || [];
    if (!effectiveRecs || effectiveRecs.length === 0) {
      effectiveRecs = generateRecommendations({
        ...effectiveAnalysis,
        factoryProfile: effectiveFactory,
        totalEmissionsTons,
        categoryBreakdown,
        topHotspots,
      });
    }

    const copilotResult = await askCopilot({
      userQuestion,
      analysisContext: effectiveAnalysis,
      factoryProfile: effectiveFactory,
      operationalData: { ...operationalData, ...(factoryContext.operationalData || analysisContext.operationalData || {}) },
      totalEmissionsTons: totalEmissionsTons ?? effectiveAnalysis.totalEmissionsTonsCO2e ?? effectiveAnalysis.totalEmissionsTons ?? 0,
      categoryBreakdown: categoryBreakdown || effectiveAnalysis.categories || effectiveAnalysis.categoryBreakdown || {},
      topHotspots: topHotspots || effectiveAnalysis.hotspots || effectiveAnalysis.topHotspots || [],
      recommendations: effectiveRecs,
      simulationResults,
    });

    return res.status(200).json(copilotResult);
  } catch (error) {
    console.error('Error in AI Copilot chat handler:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to process AI Copilot request',
      error: error.message,
    });
  }
}
