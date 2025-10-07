import mongoose, { Document, Schema } from 'mongoose';

export interface IGoldRate extends Document {
  ratePerGram24K: number;
  ratePerGram18K: number;
  ratePerGram22K: number;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

const GoldRateSchema = new Schema<IGoldRate>({
  ratePerGram24K: {
    type: Number,
    required: true
  },
  ratePerGram18K: {
    type: Number,
    required: true
  },
  ratePerGram22K: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    required: true,
    unique: true,
    index: true
  }
}, {
  timestamps: true
});

// Index for efficient querying by date
GoldRateSchema.index({ date: 1 });

// Pre-save middleware to ensure only one record per date
GoldRateSchema.pre('save', async function(next) {
  const existingRate = await GoldRate.findOne({ 
    date: { 
      $gte: new Date(this.date.getFullYear(), this.date.getMonth(), this.date.getDate()),
      $lt: new Date(this.date.getFullYear(), this.date.getMonth(), this.date.getDate() + 1)
    }
  });
  
  if (existingRate && (existingRate._id as any).toString() !== (this._id as any).toString()) {
    const error = new Error('Gold rate for this date already exists');
    return next(error);
  }
  
  next();
});

const GoldRate = mongoose.model<IGoldRate>('GoldRate', GoldRateSchema);

export default GoldRate;
