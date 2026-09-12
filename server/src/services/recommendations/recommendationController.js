/**
 * EcoForge AI — Recommendation Controller
 * 
 * Express request handlers for generating and querying circular recommendations.
 * Primary Ownership: Member 3 (Circular Recommendation & AI Copilot)
 */

import { generateRecommendations, generateRankedRecommendations, normalizeAnalysisInput } from './recommendationEngine.js';
import { EmissionAnalysisRepository, FactoryRepository, ProcessDataRepository } from '../../utils/repository.js';
import { checkMLServiceHealth, getMLServiceMetrics } from '../ml/mlServiceClient.js';

// In-memory cache for fast lookup during hackathon prototype execution
const recommendationCache = new Map();

/**
 * POST /api/recommendations/generate
 * Generate circular recommendations based on emission analysis payload or factory ID.
 */
export async function generateRecommendationsHandler(req, res) {
  try {
    const rawBody = req.body || {};
    const payload = rawBody.data || rawBody;

    let targetFactoryId = payload.factoryId || payload.factoryProfile?.id || null;
    let analysisData = payload;

    // If factoryId is provided but emission data is sparse, attempt read-only DB hydration
    if (targetFactoryId && (!payload.categories || !payload.topHotspots)) {
      try {
        const factoryDoc = await FactoryRepository.findById(targetFactoryId);
        const latestAnalysisDoc = await EmissionAnalysisRepository.findLatestByFactoryId
          ? await EmissionAnalysisRepository.findLatestByFactoryId(targetFactoryId)
          : (await EmissionAnalysisRepository.findByFactoryId(targetFactoryId))?.[0];

        if (latestAnalysisDoc) {
          analysisData = {
            ...latestAnalysisDoc,
            factory: factoryDoc || latestAnalysisDoc.factory || payload.factoryProfile,
            operationalData: payload.operationalData || payload.processData,
          };
        }
      } catch (dbErr) {
        console.warn(`Could not hydrate factory analysis from DB for ${targetFactoryId}:`, dbErr.message);
      }
    }

    const { recommendations, mlInsights } = await generateRankedRecommendations(analysisData);
    const finalFactoryId = targetFactoryId || 'default_factory';

    // Store in-memory cache
    recommendationCache.set(finalFactoryId, {
      factoryId: finalFactoryId,
      generatedAt: new Date().toISOString(),
      recommendations,
      mlInsights,
    });

    return res.status(200).json({
      success: true,
      factoryId: finalFactoryId,
      count: recommendations.length,
      recommendations,
      mlInsights,
    });
  } catch (error) {
    console.error('Error generating recommendations:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate circular recommendations',
      error: error.message,
    });
  }
}

/**
 * GET /api/recommendations/ml-status
 * Health & evaluation metrics of the integrated Python ML Service.
 */
export async function getMLStatusHandler(req, res) {
  try {
    const health = await checkMLServiceHealth();
    const metricsResult = await getMLServiceMetrics();

    return res.status(200).json({
      success: true,
      service: 'Python FastAPI ML Recommendation Service',
      health,
      metrics: metricsResult.success ? metricsResult.metrics : null,
    });
  } catch (err) {
    return res.status(200).json({
      success: false,
      service: 'Python FastAPI ML Recommendation Service',
      health: { available: false, error: err.message },
      metrics: null,
    });
  }
}

/**
 * GET /api/recommendations/:factoryId
 * Retrieve stored circular recommendations for a specific factory.
 */
export async function getRecommendationsByFactoryHandler(req, res) {
  try {
    const { factoryId } = req.params;

    // 1. Check in-memory cache first
    const cachedData = recommendationCache.get(factoryId);
    if (cachedData) {
      return res.status(200).json({
        success: true,
        ...cachedData,
      });
    }

    // 2. Query Member 2's DB Repositories in READ-ONLY mode
    try {
      const factoryDoc = await FactoryRepository.findById(factoryId);
      const analyses = await EmissionAnalysisRepository.findByFactoryId(factoryId);
      const latestAnalysisDoc = analyses.length > 0 ? analyses[0] : null;
      const latestProcessDoc = await ProcessDataRepository.findLatestByFactoryId(factoryId);

      if (latestAnalysisDoc) {
        const { recommendations, mlInsights } = await generateRankedRecommendations({
          ...latestAnalysisDoc,
          factory: factoryDoc || latestAnalysisDoc.factory,
          operationalData: latestProcessDoc || latestAnalysisDoc.operationalData,
        });

        const resultPayload = {
          factoryId,
          generatedAt: new Date().toISOString(),
          recommendations,
          mlInsights,
        };

        recommendationCache.set(factoryId, resultPayload);

        return res.status(200).json({
          success: true,
          ...resultPayload,
        });
      }
    } catch (dbErr) {
      console.warn(`DB lookup failed for factory ${factoryId}:`, dbErr.message);
    }

    // 3. Fallback: Return baseline recommendations if no prior analysis recorded
    const { recommendations: defaultRecs, mlInsights } = await generateRankedRecommendations({
      factoryProfile: { name: 'Sample Industrial Facility', industry: 'manufacturing' },
      totalEmissionsTons: 250,
      categoryBreakdown: { electricity: 100, diesel: 75, raw_materials: 50, transport: 25 },
      topHotspots: [
        { key: 'electricity', name: 'Grid Electricity', emissionsTons: 100, percentage: 40 },
        { key: 'diesel', name: 'Diesel Generator', emissionsTons: 75, percentage: 30 },
      ],
    });

    return res.status(200).json({
      success: true,
      factoryId,
      isFallback: true,
      count: defaultRecs.length,
      recommendations: defaultRecs,
      mlInsights,
    });
  } catch (error) {
    console.error('Error fetching recommendations by factory:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve recommendations',
      error: error.message,
    });
  }
}
