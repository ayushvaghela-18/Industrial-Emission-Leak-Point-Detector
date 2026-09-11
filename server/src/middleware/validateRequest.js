import { HTTP_STATUS, INDUSTRY_TYPES } from '../constants/index.js';
import { errorResponse } from '../utils/responseFormatter.js';

/**
 * Validation Middlewares for EcoForge AI Backend
 * Primary Ownership: Member 2 (Backend & Emissions)
 */

export const validateFactoryInput = (req, res, next) => {
  const { name, industryType } = req.body;

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return errorResponse(
      res,
      'Factory name is required and must be a non-empty string.',
      HTTP_STATUS.BAD_REQUEST,
      'INVALID_FACTORY_NAME'
    );
  }

  if (industryType && !INDUSTRY_TYPES.includes(industryType)) {
    return errorResponse(
      res,
      `Invalid industry type. Must be one of: ${INDUSTRY_TYPES.join(', ')}`,
      HTTP_STATUS.BAD_REQUEST,
      'INVALID_INDUSTRY_TYPE'
    );
  }

  next();
};

/**
 * Validates operational process data payload (either top-level or under processData key).
 */
export const validateProcessDataInput = (req, res, next) => {
  const target = req.body.processData || req.body;
  const { energy, materials, waste, logistics, production } = target;

  const errors = [];

  // Helper to validate non-negative numeric field
  const checkNonNegative = (val, path) => {
    if (val !== undefined && val !== null) {
      const num = Number(val);
      if (isNaN(num) || num < 0) {
        errors.push(`${path} must be a non-negative number.`);
      }
    }
  };

  // Helper to check 0-100 percentage
  const checkPercentage = (val, path) => {
    if (val !== undefined && val !== null) {
      const num = Number(val);
      if (isNaN(num) || num < 0 || num > 100) {
        errors.push(`${path} must be a valid percentage between 0 and 100.`);
      }
    }
  };

  // 1. Energy
  if (energy) {
    checkNonNegative(energy.gridElectricityKwh, 'energy.gridElectricityKwh');
    checkNonNegative(energy.renewableElectricityKwh, 'energy.renewableElectricityKwh');
    checkNonNegative(energy.dieselLiters, 'energy.dieselLiters');
    checkNonNegative(energy.coalKg, 'energy.coalKg');
    checkNonNegative(energy.naturalGasM3, 'energy.naturalGasM3');
  }

  // 2. Materials
  if (materials) {
    checkNonNegative(materials.rawMaterialKg, 'materials.rawMaterialKg');
    checkPercentage(materials.virginMaterialPercentage, 'materials.virginMaterialPercentage');
    checkPercentage(materials.recycledMaterialPercentage, 'materials.recycledMaterialPercentage');

    const vPct = Number(materials.virginMaterialPercentage || 0);
    const rPct = Number(materials.recycledMaterialPercentage || 0);
    if (vPct + rPct > 100.01) {
      errors.push('Sum of virginMaterialPercentage and recycledMaterialPercentage cannot exceed 100%.');
    }
  }

  // 3. Waste
  if (waste) {
    checkNonNegative(waste.wasteGeneratedKg, 'waste.wasteGeneratedKg');
    checkPercentage(waste.wasteLandfillPercentage, 'waste.wasteLandfillPercentage');
    checkPercentage(waste.wasteRecycledPercentage, 'waste.wasteRecycledPercentage');

    const lPct = Number(waste.wasteLandfillPercentage || 0);
    const wPct = Number(waste.wasteRecycledPercentage || 0);
    if (lPct + wPct > 100.01) {
      errors.push('Sum of wasteLandfillPercentage and wasteRecycledPercentage cannot exceed 100%.');
    }
  }

  // 4. Logistics
  if (logistics) {
    checkNonNegative(logistics.transportTkm, 'logistics.transportTkm');
  }

  // 5. Production
  if (production) {
    checkNonNegative(production.productionVolumeUnits, 'production.productionVolumeUnits');
  }

  if (errors.length > 0) {
    return errorResponse(
      res,
      'Process data validation failed.',
      HTTP_STATUS.UNPROCESSABLE_ENTITY,
      'VALIDATION_FAILED',
      errors
    );
  }

  next();
};

/**
 * Validates What-If simulation inputs including changes and optional processData.
 */
export const validateSimulationInput = (req, res, next) => {
  const { scenarioChanges, processData } = req.body;

  if (!scenarioChanges || typeof scenarioChanges !== 'object') {
    return errorResponse(
      res,
      'scenarioChanges object is required.',
      HTTP_STATUS.BAD_REQUEST,
      'MISSING_SCENARIO_CHANGES'
    );
  }

  const errors = [];

  // Validate all percentage fields in scenarioChanges
  for (const [key, val] of Object.entries(scenarioChanges)) {
    if (val !== undefined && val !== null) {
      const num = Number(val);
      if (isNaN(num) || num < 0 || num > 100) {
        errors.push(`${key} must be a valid percentage between 0 and 100.`);
      }
    }
  }

  // If processData was provided directly, validate it as well
  if (processData && typeof processData === 'object') {
    const { energy, materials, waste, logistics, production } = processData;

    const checkNonNeg = (val, path) => {
      if (val !== undefined && val !== null) {
        const num = Number(val);
        if (isNaN(num) || num < 0) {
          errors.push(`${path} must be a non-negative number.`);
        }
      }
    };

    if (energy) {
      checkNonNeg(energy.gridElectricityKwh, 'processData.energy.gridElectricityKwh');
      checkNonNeg(energy.renewableElectricityKwh, 'processData.energy.renewableElectricityKwh');
      checkNonNeg(energy.dieselLiters, 'processData.energy.dieselLiters');
      checkNonNeg(energy.coalKg, 'processData.energy.coalKg');
      checkNonNeg(energy.naturalGasM3, 'processData.energy.naturalGasM3');
    }

    if (materials) {
      checkNonNeg(materials.rawMaterialKg, 'processData.materials.rawMaterialKg');
    }

    if (waste) {
      checkNonNeg(waste.wasteGeneratedKg, 'processData.waste.wasteGeneratedKg');
    }

    if (logistics) {
      checkNonNeg(logistics.transportTkm, 'processData.logistics.transportTkm');
    }

    if (production) {
      checkNonNeg(production.productionVolumeUnits, 'processData.production.productionVolumeUnits');
    }
  }

  if (errors.length > 0) {
    return errorResponse(
      res,
      'Simulation parameter validation failed.',
      HTTP_STATUS.BAD_REQUEST,
      'INVALID_SIMULATION_PARAMETERS',
      errors
    );
  }

  next();
};
