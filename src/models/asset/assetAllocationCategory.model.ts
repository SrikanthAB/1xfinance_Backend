import { Document, Schema, model, Model, CallbackError } from "mongoose";
import httpStatus from 'http-status';
import { IAllocationCategory, VestingType } from "../../interfaces/asset/assetAllocationCategory.types";
import ApiError from "../../utils/ApiError";
import { Types } from "mongoose";
import { ClientSession } from "mongoose";

export interface IAllocationCategoryDocument extends IAllocationCategory, Document {}

interface IAllocationTotals {
  percentage: number;
  tokens: number;
}

interface IAllocationValidationResult {
  totalPercentage: number;
  totalTokens: number;
  remainingPercentage: number;
  remainingTokens: number;
  isValid: boolean;
}

interface IAllocationStats {
  isValid: boolean;
  totalPercentage: number;
  totalTokens: number;
  remainingPercentage: number;
  remainingTokens: number;
}

interface IAllocationCategoryModel extends Model<IAllocationCategoryDocument> {
  getAssetAllocations(assetId: string): Promise<IAllocationCategoryDocument[]>;
  validateTotalAllocations(assetId: Types.ObjectId, session?: ClientSession | null): Promise<IAllocationValidationResult>;
}

const AllocationCategorySchema = new Schema<IAllocationCategoryDocument>(
  {
    assetId: {
      type: Schema.Types.ObjectId,
      ref: "Asset",
      required: true,
      index: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    percentage: {
      type: Number,
      min: 0,
      max: 100,
    },
    tokens: {
      type: Number,
      required: true,
      min: 0,
    },
    vestingType: {
      type: String,
      enum: Object.values(VestingType),
      required: true,
    },
    vestingStartDate: {
      type: Date,
      validate: {
        validator: function(startDate: Date) {
          // Only validate if vestingType requires dates
          if (this.vestingType === VestingType.NO_VESTING) return true;
          return startDate != null;
        },
        message: 'Vesting start date is required for linear and cliff vesting'
      }
    },
    vestingEndDate: {
      type: Date,
      validate: {
        validator: function(endDate: Date) {
          // Only validate if vestingType requires dates
          if (this.vestingType === VestingType.NO_VESTING) return true;
          if (!endDate) return false;
          if (!this.vestingStartDate) return false;
          return endDate > this.vestingStartDate;
        },
        message: 'Vesting end date must be after start date'
      }
    },
    cliffPeriod: {
      type: Number,
      min: 0,
      validate: {
        validator: function(period: number) {
          if (this.vestingType !== VestingType.CLIFF_VESTING) return true;
          if (!period) return false;
          if (!this.vestingStartDate || !this.vestingEndDate) return false;
          const totalDuration = Math.ceil((this.vestingEndDate.getTime() - this.vestingStartDate.getTime()) / (1000 * 60 * 60 * 24));
          return period < totalDuration;
        },
        message: 'Cliff period must be less than total vesting duration'
      }
    },
    description: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for better query performance
AllocationCategorySchema.index({ assetId: 1, category: 1 }, { unique: true });

// Pre-save middleware to calculate percentage based on tokens and validate allocations
AllocationCategorySchema.pre('save', async function(next) {
  try {
    const Asset = model('Asset');
    const asset = await Asset.findById(this.assetId);
    
    if (!asset) {
      throw new ApiError({
        statusCode: httpStatus.NOT_FOUND,
        message: 'Asset not found'
      });
    }

    if (!asset.tokenInformation?.tokenSupply) {
      throw new ApiError({
        statusCode: httpStatus.BAD_REQUEST,
        message: 'Asset token supply must be defined before creating allocation categories'
      });
    }

    // Get all other allocations for this asset
    const AllocationCategory = model('AllocationCategory');
    const otherAllocations = await AllocationCategory.find({
      assetId: this.assetId,
      _id: { $ne: this._id }
    });

    // Calculate total tokens of other allocations
    const totalOtherTokens = otherAllocations.reduce((sum: number, allocation: IAllocationCategoryDocument) => sum + allocation.tokens, 0);

    // Calculate exact percentage first
    const exactPercentage = (this.tokens / asset.tokenInformation.tokenSupply) * 100;
    
    // If this allocation would make total exceed 100%, adjust tokens down
    const totalTokens = totalOtherTokens + this.tokens;
    if (totalTokens > asset.tokenInformation.tokenSupply) {
      // Adjust tokens down to fit within remaining supply
      this.tokens = Math.max(1, asset.tokenInformation.tokenSupply - totalOtherTokens);
    }

    // If exactly 100%, reduce slightly to prevent floating point issues
    if (exactPercentage >= 100) {
      this.tokens = Math.floor((99.99999999 / 100) * asset.tokenInformation.tokenSupply);
    }

    // Set final percentage with controlled precision
    this.percentage = Number(((this.tokens / asset.tokenInformation.tokenSupply) * 100).toFixed(8));

    // Validate vesting dates if both are provided
    if (this.vestingStartDate && this.vestingEndDate && this.vestingEndDate <= this.vestingStartDate) {
      throw new ApiError({
        statusCode: httpStatus.BAD_REQUEST,
        message: 'Vesting end date must be after vesting start date'
      });
    }

    next();
  } catch (error: any) {
    const err = error instanceof ApiError ? error : new Error(error?.message || String(error));
    next(err as CallbackError);
  }
});

// Static method to get asset allocations
AllocationCategorySchema.statics.getAssetAllocations = async function(assetId: string) {
  const allocations = await this.find({ assetId }).sort({ percentage: -1 });
  if (!allocations.length) {
    throw new ApiError({
      statusCode: httpStatus.NOT_FOUND,
      message: 'No allocation categories found for this asset'
    });
  }
  return allocations;
};

// Static method to validate total allocations
AllocationCategorySchema.statics.validateTotalAllocations = async function(
  assetId: Types.ObjectId,
  session: ClientSession | null = null
): Promise<IAllocationValidationResult> {
  const Asset = model('Asset');
  const allocations = await this.find({ assetId }).sort({ tokens: -1 }).session(session);
  
  const asset = await Asset.findById(assetId).session(session);
  // if (!asset || !asset.tokenInformation?.tokenSupply) {
  //   // throw new ApiError({
  //   //   statusCode: httpStatus.BAD_REQUEST,
  //   //   message: 'Asset not found or token supply not defined'
  //   // });
    
  // }

  const totalSupply = asset.tokenInformation.tokenSupply;
  
  // Calculate total tokens - use exact values without rounding
  const totalTokens = allocations.reduce((sum: number, allocation: IAllocationCategoryDocument) => sum + allocation.tokens, 0);
  
  // Calculate exact remaining tokens first
  const remainingTokens = totalSupply - totalTokens;
  
  // Calculate percentages from exact token counts
  const totalPercentage = Number(((totalTokens / totalSupply) * 100).toFixed(8));
  const remainingPercentage = Number(((remainingTokens / totalSupply) * 100).toFixed(8));

  return {
    totalPercentage,
    totalTokens,
    remainingPercentage,
    remainingTokens,
    isValid: true
  };
};

// Add virtual field for vestingDuration
AllocationCategorySchema.virtual('vestingDuration').get(function() {
  if (this.vestingStartDate && this.vestingEndDate) {
    return Math.ceil((this.vestingEndDate.getTime() - this.vestingStartDate.getTime()) / (1000 * 60 * 60 * 24)); // Duration in days
  }
  return null;
});

const AllocationCategory = model<IAllocationCategoryDocument, IAllocationCategoryModel>(
  "AllocationCategory",
  AllocationCategorySchema
);

export default AllocationCategory; 