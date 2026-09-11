import mongoose from 'mongoose';
import { INDUSTRY_TYPES } from '../constants/index.js';

const FactorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Factory name is required'],
      trim: true,
      maxlength: [120, 'Factory name cannot exceed 120 characters'],
    },
    industryType: {
      type: String,
      required: [true, 'Industry type is required'],
      enum: INDUSTRY_TYPES,
      default: 'Manufacturing',
    },
    location: {
      city: { type: String, default: '' },
      country: { type: String, default: '' },
      region: { type: String, default: '' },
    },
    contactPerson: {
      name: { type: String, default: '' },
      email: { type: String, default: '' },
    },
    operationalProfile: {
      operatingHoursPerYear: { type: Number, default: 4000, min: 0 },
      facilityAreaSqMeters: { type: Number, default: 0, min: 0 },
      employeeCount: { type: Number, default: 0, min: 0 },
    },
    isSyntheticDemo: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for linking to latest process data or emission analysis
FactorySchema.virtual('processData', {
  ref: 'FactoryProcessData',
  localField: '_id',
  foreignField: 'factoryId',
  justOne: false,
});

export const Factory = mongoose.model('Factory', FactorySchema);
export default Factory;
