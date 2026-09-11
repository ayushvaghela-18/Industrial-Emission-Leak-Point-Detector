/**
 * EcoForge AI — AI Copilot Controller
 * 
 * Express request handler for the AI Sustainability Copilot chat interface.
 * Primary Ownership: Member 3 (Circular Recommendation & AI Copilot)
 */

import { askCopilot } from './aiCopilotService.js';

/**
 * POST /api/ai/chat
 * Endpoint for asking conversational grounded questions to the AI Copilot.
 */
export async function aiChatHandler(req, res) {
  try {
    const {
      userQuestion,
      factoryContext = {},
      analysisContext = {},
      recommendationContext = [],
      simulationResults = null,
      factoryProfile = {},
      operationalData = {},
      totalEmissionsTons,
      categoryBreakdown,
      topHotspots,
      recommendations,
    } = req.body || {};

    // Merge nested context payloads gracefully
    const effectiveProfile = {
      ...factoryProfile,
      ...(factoryContext.factoryProfile || analysisContext.factoryProfile || {}),
    };
    const effectiveOps = {
      ...operationalData,
      ...(factoryContext.operationalData || analysisContext.operationalData || {}),
    };
    const effectiveTotal =
      totalEmissionsTons ??
      analysisContext.totalEmissionsTons ??
      factoryContext.totalEmissionsTons ??
      0;
    const effectiveBreakdown =
      categoryBreakdown ||
      analysisContext.categoryBreakdown ||
      factoryContext.categoryBreakdown ||
      {};
    const effectiveHotspots =
      topHotspots || analysisContext.topHotspots || factoryContext.topHotspots || [];
    const effectiveRecs =
      recommendations ||
      recommendationContext ||
      analysisContext.recommendations ||
      [];

    const copilotResult = await askCopilot({
      userQuestion,
      factoryProfile: effectiveProfile,
      operationalData: effectiveOps,
      totalEmissionsTons: effectiveTotal,
      categoryBreakdown: effectiveBreakdown,
      topHotspots: effectiveHotspots,
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
