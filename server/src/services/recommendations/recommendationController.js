/**
 * EcoForge AI — Recommendation Controller
 * 
 * Express request handlers for generating and querying circular recommendations.
 * Primary Ownership: Member 3 (Circular Recommendation & AI Copilot)
 */

import { generateRecommendations } from './recommendationEngine.js';

// In-memory cache for hackathon prototype storage by factoryId
const recommendationCache = new Map();

/**
 * POST /api/recommendations/generate
 * Generate circular recommendations based on emission analysis payload.
 */
export async function generateRecommendationsHandler(req, res) {
  try {
    const {
      factoryId,
      factoryProfile = {},
      totalEmissionsTons = 0,
      categoryBreakdown = {},
      topHotspots = [],
      operationalData = {},
      analysisContext = {},
    } = req.body || {};

    // Merge analysisContext if provided in nested format
    const effectiveTotal = totalEmissionsTons || analysisContext.totalEmissionsTons || 0;
    const effectiveBreakdown = categoryBreakdown || analysisContext.categoryBreakdown || {};
    const effectiveHotspots = (topHotspots && topHotspots.length > 0)
      ? topHotspots
      : (analysisContext.topHotspots || []);
    const effectiveProfile = { ...factoryProfile, ...(analysisContext.factoryProfile || {}) };
    const effectiveOps = { ...operationalData, ...(analysisContext.operationalData || {}) };

    const recommendations = generateRecommendations({
      factoryProfile: effectiveProfile,
      totalEmissionsTons: effectiveTotal,
      categoryBreakdown: effectiveBreakdown,
      topHotspots: effectiveHotspots,
      operationalData: effectiveOps,
    });

    const targetFactoryId = factoryId || effectiveProfile.id || 'default_factory';

    // Store in-memory for hackathon retrieval
    recommendationCache.set(targetFactoryId, {
      factoryId: targetFactoryId,
      generatedAt: new Date().toISOString(),
      recommendations,
    });

    return res.status(200).json({
      success: true,
      factoryId: targetFactoryId,
      count: recommendations.length,
      recommendations,
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
 * GET /api/recommendations/:factoryId
 * Retrieve stored circular recommendations for a specific factory.
 */
export async function getRecommendationsByFactoryHandler(req, res) {
  try {
    const { factoryId } = req.params;
    const data = recommendationCache.get(factoryId);

    if (!data) {
      // Fallback: Generate generic baseline recommendations if factory not found in cache
      const defaultRecs = generateRecommendations({
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
      });
    }

    return res.status(200).json({
      success: true,
      ...data,
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
