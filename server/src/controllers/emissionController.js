import { FactoryRepository, ProcessDataRepository, EmissionAnalysisRepository } from '../utils/repository.js';
import { EmissionCalculator } from '../services/emissions/emissionCalculator.js';
import { HotspotDetector } from '../services/emissions/hotspotDetector.js';
import { successResponse, errorResponse } from '../utils/responseFormatter.js';
import { HTTP_STATUS } from '../constants/index.js';

/**
 * Emission Controller
 * Primary Ownership: Member 2 (Backend & Emissions)
 */

export const analyzeEmissions = async (req, res, next) => {
  try {
    const { factoryId, processData } = req.body;

    // Use processData from body or direct payload
    const inputData = processData || req.body;

    let targetFactoryId = factoryId;
    let savedProcessDataId = null;

    // If factoryId is provided, verify it exists
    if (targetFactoryId) {
      const factory = await FactoryRepository.findById(targetFactoryId);
      if (!factory) {
        return errorResponse(
          res,
          `Factory with id '${targetFactoryId}' not found`,
          HTTP_STATUS.NOT_FOUND,
          'FACTORY_NOT_FOUND'
        );
      }

      // Persist the process data snapshot
      const savedProcessDoc = await ProcessDataRepository.create({
        factoryId: targetFactoryId,
        ...inputData,
      });
      savedProcessDataId = savedProcessDoc._id || savedProcessDoc.id;
    }

    // Deterministic Calculation
    const calculation = EmissionCalculator.calculate(inputData);

    // Deterministic Hotspot Detection
    const hotspots = HotspotDetector.detectHotspots(
      calculation.sources,
      calculation.totalEmissionsKgCO2e
    );

    let savedAnalysis = null;
    if (targetFactoryId) {
      savedAnalysis = await EmissionAnalysisRepository.create({
        factoryId: targetFactoryId,
        processDataId: savedProcessDataId,
        totalEmissionsKgCO2e: calculation.totalEmissionsKgCO2e,
        totalEmissionsTonsCO2e: calculation.totalEmissionsTonsCO2e,
        categories: calculation.categories,
        sources: calculation.sources,
        hotspots,
        baselineMetrics: calculation.baselineMetrics,
      });
    }

    const responsePayload = {
      factoryId: targetFactoryId || null,
      analysisId: savedAnalysis ? (savedAnalysis._id || savedAnalysis.id) : null,
      totalEmissionsTonsCO2e: calculation.totalEmissionsTonsCO2e,
      totalEmissionsKgCO2e: calculation.totalEmissionsKgCO2e,
      categories: calculation.categories,
      sources: calculation.sources,
      hotspots,
      baselineMetrics: calculation.baselineMetrics,
      calculatedAt: new Date().toISOString(),
    };

    return successResponse(
      res,
      responsePayload,
      'Emission analysis and hotspot detection completed successfully',
      HTTP_STATUS.OK
    );
  } catch (err) {
    next(err);
  }
};

export const getEmissionsByFactory = async (req, res, next) => {
  try {
    const { factoryId } = req.params;

    const factory = await FactoryRepository.findById(factoryId);
    if (!factory) {
      return errorResponse(
        res,
        `Factory with id '${factoryId}' not found`,
        HTTP_STATUS.NOT_FOUND,
        'FACTORY_NOT_FOUND'
      );
    }

    const analyses = await EmissionAnalysisRepository.findByFactoryId(factoryId);
    const latestAnalysis = analyses.length > 0 ? analyses[0] : null;

    if (!latestAnalysis) {
      return errorResponse(
        res,
        `No emission analysis found for factory '${factoryId}'. Please run /api/emissions/analyze first.`,
        HTTP_STATUS.NOT_FOUND,
        'NO_ANALYSIS_FOUND'
      );
    }

    return successResponse(
      res,
      {
        factory: {
          id: factory._id || factory.id,
          name: factory.name,
          industryType: factory.industryType,
        },
        latestAnalysis,
        historyCount: analyses.length,
      },
      'Factory emission analysis retrieved successfully'
    );
  } catch (err) {
    next(err);
  }
};
