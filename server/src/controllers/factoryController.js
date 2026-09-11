import { FactoryRepository, ProcessDataRepository, EmissionAnalysisRepository } from '../utils/repository.js';
import { EmissionCalculator } from '../services/emissions/emissionCalculator.js';
import { HotspotDetector } from '../services/emissions/hotspotDetector.js';
import { successResponse, errorResponse } from '../utils/responseFormatter.js';
import { HTTP_STATUS } from '../constants/index.js';
import { seedDemoData } from '../data/seedDemoData.js';

/**
 * Factory Controller
 * Primary Ownership: Member 2 (Backend & Emissions)
 */

export const createFactory = async (req, res, next) => {
  try {
    const { name, industryType, location, contactPerson, operationalProfile, processData } = req.body;

    // 1. Create Factory Document
    const factory = await FactoryRepository.create({
      name: name.trim(),
      industryType: industryType || 'Manufacturing',
      location: location || {},
      contactPerson: contactPerson || {},
      operationalProfile: operationalProfile || {},
    });

    const factoryId = factory._id || factory.id;
    let initialAnalysis = null;

    // 2. If initial process data was included, save and calculate baseline
    if (processData) {
      const processDoc = await ProcessDataRepository.create({
        factoryId,
        ...processData,
      });
      const processDataId = processDoc._id || processDoc.id;

      const calculation = EmissionCalculator.calculate(processData);
      const hotspots = HotspotDetector.detectHotspots(
        calculation.sources,
        calculation.totalEmissionsKgCO2e
      );

      initialAnalysis = await EmissionAnalysisRepository.create({
        factoryId,
        processDataId,
        totalEmissionsKgCO2e: calculation.totalEmissionsKgCO2e,
        totalEmissionsTonsCO2e: calculation.totalEmissionsTonsCO2e,
        categories: calculation.categories,
        sources: calculation.sources,
        hotspots,
        baselineMetrics: calculation.baselineMetrics,
      });
    }

    return successResponse(
      res,
      {
        factory,
        initialAnalysis,
      },
      'Factory created successfully',
      HTTP_STATUS.CREATED
    );
  } catch (err) {
    next(err);
  }
};

export const getFactories = async (req, res, next) => {
  try {
    const factories = await FactoryRepository.find();
    return successResponse(res, factories, 'Factories retrieved successfully');
  } catch (err) {
    next(err);
  }
};

export const getFactoryById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const factory = await FactoryRepository.findById(id);

    if (!factory) {
      return errorResponse(res, `Factory with id '${id}' not found`, HTTP_STATUS.NOT_FOUND, 'FACTORY_NOT_FOUND');
    }

    const latestProcessData = await ProcessDataRepository.findLatestByFactoryId(id);
    const latestAnalysis = await EmissionAnalysisRepository.findLatestByFactoryId(id);

    return successResponse(
      res,
      {
        factory,
        latestProcessData,
        latestAnalysis,
      },
      'Factory details retrieved successfully'
    );
  } catch (err) {
    next(err);
  }
};

export const seedFactories = async (req, res, next) => {
  try {
    const results = await seedDemoData();
    return successResponse(res, results, 'Synthetic demo factories seeded successfully', HTTP_STATUS.CREATED);
  } catch (err) {
    next(err);
  }
};
