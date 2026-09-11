import mongoose from 'mongoose';

const SimulationResultSchema = new mongoose.Schema(
  {
    factoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Factory',
      required: [true, 'Factory ID is required'],
      index: true,
    },
    scenarioName: {
      type: String,
      default: 'Custom What-If Scenario',
    },
    changesApplied: {
      renewableEnergyPercentage: { type: Number, default: null },
      recycledMaterialPercentage: { type: Number, default: null },
      fuelReductionPercentage: { type: Number, default: null },
      wasteRecyclingPercentage: { type: Number, default: null },
      energyEfficiencyPercentage: { type: Number, default: null },
    },
    results: {
      currentEmissionsTonsCO2e: { type: Number, required: true },
      projectedEmissionsTonsCO2e: { type: Number, required: true },
      co2ReductionTons: { type: Number, required: true },
      percentageReduction: { type: Number, required: true },
      financialImpact: {
        baselineAnnualCostUSD: { type: Number, default: 0 },
        projectedAnnualCostUSD: { type: Number, default: 0 },
        estimatedAnnualSavingsUSD: { type: Number, default: 0 },
      },
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export const SimulationResult = mongoose.model('SimulationResult', SimulationResultSchema);
export default SimulationResult;
