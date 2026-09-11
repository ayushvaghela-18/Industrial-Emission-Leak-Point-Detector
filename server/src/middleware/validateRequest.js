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

export const validateProcessDataInput = (req, res, next) => {
  const { energy, materials, waste, logistics, production } = req.body;

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

export const validateSimulationInput = (req, res, next) => {
  const { scenarioChanges } = req.body;
  if (!scenarioChanges || typeof scenarioChanges !== 'object') {
    return errorResponse(
      res,
      'scenarioChanges object is required.',
      HTTP_STATUS.BAD_REQUEST,
      'MISSING_SCENARIO_CHANGES'
    );
  }

  const errors = [];
  const checkPct = (val, name) => {
    if (val !== undefined && val !== null) {
      const num = Number(val);
      if (isNaN(num) || num < 0 || num > 100) {
        errors.push(`${name} must be between 0 and 100.`);
      }
    }
  };

  checkPct(scenarioChanges.renewableEnergyPercentage, 'renewableEnergyPercentage');
  checkPct(scenarioChanges.recycledMaterialPercentage, 'recycledMaterialPercentage');
  checkPct(scenarioChanges.fuelReductionPercentage, 'fuelReductionPercentage');
  checkPct(scenarioChanges.wasteRecyclingPercentage, 'wasteRecyclingPercentage');
  checkPct(scenarioChanges.energyEfficiencyPercentage, 'energyEfficiencyPercentage');

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
