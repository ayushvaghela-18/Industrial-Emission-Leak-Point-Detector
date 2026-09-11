import mongoose from 'mongoose';

const FactoryProcessDataSchema = new mongoose.Schema(
  {
    factoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Factory',
      required: [true, 'Factory ID is required'],
      index: true,
    },
    reportingPeriod: {
      type: String,
      default: 'Annual Baseline',
    },
    // 1. Energy & Fuel Consumption
    energy: {
      gridElectricityKwh: {
        type: Number,
        default: 0,
        min: [0, 'Grid electricity cannot be negative'],
      },
      renewableElectricityKwh: {
        type: Number,
        default: 0,
        min: [0, 'Renewable electricity cannot be negative'],
      },
      dieselLiters: {
        type: Number,
        default: 0,
        min: [0, 'Diesel consumption cannot be negative'],
      },
      coalKg: {
        type: Number,
        default: 0,
        min: [0, 'Coal consumption cannot be negative'],
      },
      naturalGasM3: {
        type: Number,
        default: 0,
        min: [0, 'Natural gas consumption cannot be negative'],
      },
    },

    // 2. Raw Materials
    materials: {
      materialType: {
        type: String,
        default: 'general',
      },
      rawMaterialKg: {
        type: Number,
        default: 0,
        min: [0, 'Raw material quantity cannot be negative'],
      },
      virginMaterialPercentage: {
        type: Number,
        default: 100,
        min: [0, 'Percentage must be at least 0'],
        max: [100, 'Percentage cannot exceed 100'],
      },
      recycledMaterialPercentage: {
        type: Number,
        default: 0,
        min: [0, 'Percentage must be at least 0'],
        max: [100, 'Percentage cannot exceed 100'],
      },
    },

    // 3. Production Output
    production: {
      productionVolumeUnits: {
        type: Number,
        default: 0,
        min: [0, 'Production volume cannot be negative'],
      },
      productionUnit: {
        type: String,
        default: 'units',
      },
    },

    // 4. Waste & Disposal
    waste: {
      wasteGeneratedKg: {
        type: Number,
        default: 0,
        min: [0, 'Waste quantity cannot be negative'],
      },
      wasteType: {
        type: String,
        default: 'industrial_solid',
      },
      wasteLandfillPercentage: {
        type: Number,
        default: 100,
        min: [0, 'Landfill percentage must be at least 0'],
        max: [100, 'Landfill percentage cannot exceed 100'],
      },
      wasteRecycledPercentage: {
        type: Number,
        default: 0,
        min: [0, 'Recycled percentage must be at least 0'],
        max: [100, 'Recycled percentage cannot exceed 100'],
      },
      wasteDisposalMethod: {
        type: String,
        default: 'landfill',
      },
    },

    // 5. Logistics & Transport
    logistics: {
      transportTkm: {
        type: Number,
        default: 0,
        min: [0, 'Transport ton-km cannot be negative'],
      },
      vehicleType: {
        type: String,
        default: 'roadFreight',
      },
    },
  },
  {
    timestamps: true,
  }
);

export const FactoryProcessData = mongoose.model('FactoryProcessData', FactoryProcessDataSchema);
export default FactoryProcessData;
