import mongoose, { Schema } from 'mongoose';

const rentalDistributionSchema = new Schema({
  rentalPeriodId: {
    type: Schema.Types.ObjectId,
    ref: 'RentalPeriod',
    required: true,
    index: true
  },
  investorId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  amountKES: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['PENDING', 'PAID', 'FAILED'],
    default: 'PENDING',
    index: true
  },
  bankRef: {
    type: String,
    default: null
  },
  paymentDate: {
    type: Date,
    default: null
  },
  paymentNotes: {
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

// Compound index for faster lookups
rentalDistributionSchema.index({ rentalPeriodId: 1, investorId: 1 }, { unique: true });

// Virtual for rental period
rentalDistributionSchema.virtual('rentalPeriod', {
  ref: 'RentalPeriod',
  localField: 'rentalPeriodId',
  foreignField: '_id',
  justOne: true
});

// Virtual for investor
rentalDistributionSchema.virtual('investor', {
  ref: 'User',
  localField: 'investorId',
  foreignField: '_id',
  justOne: true
});

export const RentalInvestorDistribution =
  mongoose.models.RentalInvestorDistribution ||
  mongoose.model('RentalInvestorDistribution', rentalDistributionSchema);

export default RentalInvestorDistribution;
