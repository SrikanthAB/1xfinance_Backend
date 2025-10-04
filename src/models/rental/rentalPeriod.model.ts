import { Schema, model } from 'mongoose';
import { RentalDistributionStatus } from '../../interfaces/rental/rentalDistribution.types';

const rentalPeriodSchema = new Schema({
  assetId: {
    type: Schema.Types.ObjectId,
    ref: 'Asset',
    required: true,
    index: true
  },
  month: {
    type: Number,
    required: true,
    min: 1,
    max: 12
  },
  year: {
    type: Number,
    required: true,
    min: 2000,
    max: 2100
  },
  grossYieldKES: {
    type: Number,
    required: true,
    min: 0
  },
  netYieldKES: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: Object.values(RentalDistributionStatus),
    default: RentalDistributionStatus.PENDING,
    index: true
  },
  distributedAt: {
    type: Date,
    default: null
  },
  distributionNotes: {
    type: String,
    default: ''
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound index to ensure one rental period per asset per month/year
rentalPeriodSchema.index(
  { assetId: 1, month: 1, year: 1 },
  { unique: true, name: 'asset_month_year_unique' }
);

// Virtual for distributions
rentalPeriodSchema.virtual('distributions', {
  ref: 'RentalDistribution',
  localField: '_id',
  foreignField: 'rentalPeriodId'
});

export const RentalPeriod = model('RentalPeriod', rentalPeriodSchema);
export default RentalPeriod;
