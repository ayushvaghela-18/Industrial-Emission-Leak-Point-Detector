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

    let targetFactory = null;
    let inputData = processData;
    let savedProcessDataId = null;

    // 1. If factoryId is provided, verify it exists
    if (factoryId) {
      targetFactory = await FactoryRepository.findById(factoryId);
      if (!targetFactory) {
        return errorResponse(
          res,
          `Factory with id '${factoryId}' not found`,
          HTTP_STATUS.NOT_FOUND,
          'FACTORY_NOT_FOUND'
        );
      }

      // If processData was provided in request, save new snapshot
      if (inputData && typeof inputData === 'object' && Object.keys(inputData).length > 0) {
        const savedProcessDoc = await ProcessDataRepository.create({
          factoryId,
          ...inputData,
        });
        savedProcessDataId = savedProcessDoc._id || savedProcessDoc.id;
      } else {
        // If processData not in body, load the latest recorded process data for this factory
        const latestProcess = await ProcessDataRepository.findLatestByFactoryId(factoryId);
        if (latestProcess) {
          inputData = latestProcess;
          savedProcessDataId = latestProcess._id || latestProcess.id;
        }
      }
    }

    // 2. If no processData under key, fallback to top-level req.body
    if (!inputData) {
      inputData = req.body;
    }

    // Check if inputData has any operational fields
    const hasOperationalData = inputData && (
      inputData.energy ||
      inputData.materials ||
      inputData.waste ||
      inputData.logistics ||
      inputData.production
    );

    if (!hasOperationalData && !factoryId) {
      return errorResponse(
        res,
        'No operational process data provided. Please provide energy, materials, waste, logistics, or production metrics.',
        HTTP_STATUS.BAD_REQUEST,
        'MISSING_PROCESS_DATA'
      );
    }

    // 3. Deterministic Calculation
    const calculation = EmissionCalculator.calculate(inputData);

    // 4. Deterministic Hotspot Detection
    const hotspots = HotspotDetector.detectHotspots(
      calculation.sources,
      calculation.totalEmissionsKgCO2e
    );

    // 5. Store Emission Analysis if associated with a factory
    let savedAnalysis = null;
    if (factoryId) {
      savedAnalysis = await EmissionAnalysisRepository.create({
        factoryId,
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
      factoryId: factoryId || null,
      factory: targetFactory
        ? {
            id: targetFactory._id || targetFactory.id,
            name: targetFactory.name,
            industryType: targetFactory.industryType,
          }
        : null,
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
          location: factory.location,
        },
        latestAnalysis,
        history: analyses,
        historyCount: analyses.length,
      },
      'Factory emission analysis retrieved successfully'
    );
  } catch (err) {
    next(err);
  }
};
