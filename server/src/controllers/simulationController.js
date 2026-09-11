import { FactoryRepository, ProcessDataRepository, SimulationRepository } from '../utils/repository.js';
import { SimulationService } from '../services/emissions/simulationService.js';
import { successResponse, errorResponse } from '../utils/responseFormatter.js';
import { HTTP_STATUS } from '../constants/index.js';

/**
 * Simulation Controller
 * Primary Ownership: Member 2 (Backend & Emissions)
 */

export const runSimulation = async (req, res, next) => {
  try {
    const { factoryId, processData, scenarioChanges, scenarioName } = req.body;

    let baselineData = processData;

    // If factoryId is supplied, retrieve the factory's active baseline process data
    if (factoryId) {
      const factory = await FactoryRepository.findById(factoryId);
      if (!factory) {
        return errorResponse(
          res,
          `Factory with id '${factoryId}' not found`,
          HTTP_STATUS.NOT_FOUND,
          'FACTORY_NOT_FOUND'
        );
      }

      const latestProcess = await ProcessDataRepository.findLatestByFactoryId(factoryId);
      if (latestProcess) {
        baselineData = latestProcess;
      }
    }

    if (!baselineData) {
      return errorResponse(
        res,
        'No baseline operational data found. Provide processData in request body or ensure the factory has recorded process data.',
        HTTP_STATUS.BAD_REQUEST,
        'MISSING_BASELINE_DATA'
      );
    }

    // Run deterministic simulation
    const simulationResult = SimulationService.simulate(baselineData, scenarioChanges || {});

    // Optionally save simulation record
    let savedSimulationId = null;
    if (factoryId) {
      const savedDoc = await SimulationRepository.create({
        factoryId,
        scenarioName: scenarioName || 'Custom What-If Scenario',
        changesApplied: scenarioChanges,
        results: {
          currentEmissionsTonsCO2e: simulationResult.baseline.totalEmissionsTonsCO2e,
          projectedEmissionsTonsCO2e: simulationResult.projected.totalEmissionsTonsCO2e,
          co2ReductionTons: simulationResult.impact.co2ReductionTons,
          percentageReduction: simulationResult.impact.percentageReduction,
          financialImpact: {
            baselineAnnualCostUSD: simulationResult.baseline.annualCostUSD,
            projectedAnnualCostUSD: simulationResult.projected.annualCostUSD,
            estimatedAnnualSavingsUSD: simulationResult.impact.estimatedAnnualSavingsUSD,
          },
        },
      });
      savedSimulationId = savedDoc._id || savedDoc.id;
    }

    return successResponse(
      res,
      {
        simulationId: savedSimulationId,
        factoryId: factoryId || null,
        ...simulationResult,
      },
      'What-if scenario simulation executed successfully',
      HTTP_STATUS.OK
    );
  } catch (err) {
    next(err);
  }
};
