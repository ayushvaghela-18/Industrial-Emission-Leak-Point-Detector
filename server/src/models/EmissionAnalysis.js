import mongoose from 'mongoose';
import { HOTSPOT_SEVERITY } from '../constants/index.js';

const CategoryBreakdownSchema = new mongoose.Schema(
  {
    category: { type: String, required: true },
    emissionsKgCO2e: { type: Number, required: true },
    emissionsTonsCO2e: { type: Number, required: true },
    percentage: { type: Number, required: true },
  },
  { _id: false }
);

const SourceBreakdownSchema = new mongoose.Schema(
  {
    source: { type: String, required: true },
    category: { type: String, required: true },
    emissionsKgCO2e: { type: Number, required: true },
    emissionsTonsCO2e: { type: Number, required: true },
    percentage: { type: Number, required: true },
    inputAmount: { type: Number, required: true },
    inputUnit: { type: String, required: true },
    factorUsed: { type: Number, required: true },
    factorUnit: { type: String, required: true },
  },
  { _id: false }
);

const HotspotSchema = new mongoose.Schema(
  {
    rank: { type: Number, required: true },
    source: { type: String, required: true },
    category: { type: String, required: true },
    emissionsKgCO2e: { type: Number, required: true },
    emissionsTonsCO2e: { type: Number, required: true },
    percentage: { type: Number, required: true },
    severity: {
      type: String,
      enum: Object.values(HOTSPOT_SEVERITY),
      required: true,
    },
    explanation: { type: String, required: true },
    reductionPotentialEstimate: {
      potentialTonsReduction: { type: Number, default: 0 },
      primaryInterventionType: { type: String, default: '' },
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { _id: false }
);

const EmissionAnalysisSchema = new mongoose.Schema(
  {
    factoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Factory',
      required: [true, 'Factory ID is required'],
      index: true,
    },
    processDataId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FactoryProcessData',
      index: true,
    },
    totalEmissionsKgCO2e: {
      type: Number,
      required: true,
    },
    totalEmissionsTonsCO2e: {
      type: Number,
      required: true,
    },
    categories: [CategoryBreakdownSchema],
    sources: [SourceBreakdownSchema],
    hotspots: [HotspotSchema],
    baselineMetrics: {
      emissionIntensityPerUnit: { type: Number, default: 0 },
      productionUnit: { type: String, default: 'units' },
      annualOperationalCostEstimate: { type: Number, default: 0 },
    },
    calculatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export const EmissionAnalysis = mongoose.model('EmissionAnalysis', EmissionAnalysisSchema);
export default EmissionAnalysis;
