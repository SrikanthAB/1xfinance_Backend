import mongoose, { Schema, Document } from 'mongoose';
import { toJSON } from '../plugins/ToJSON';

export interface IPortfolioAsset {
  assetId: mongoose.Types.ObjectId;
  investedAmount: number;
  tokens: number;
  tokenPrice: number;
  investedDate: Date;
  rentalDistributions: {
    month: Date;
    rentalIncome: number;
    paid?: boolean;                // ← mark true when money actually received
    receivedAmount?: number;       // ← actual received (can differ from scheduled)
    paidAt?: Date | string;        // ← when it hit the account
    paymentTxnId?: string;  
  }[];
  latestValue: number;
  moic: number; // Multiple on Invested Capital
  tokenSupply?: number; // Total token supply from the asset
}

export interface IPortfolio extends Document {
  userId: mongoose.Types.ObjectId;
  totalValue: number;
  holdings: number;
  cashFlows: number;
  totalInvestment: number;
  assets: IPortfolioAsset[];
  createdAt: Date;
  updatedAt: Date;
  holdingsPercentage: number;
}

const portfolioSchema = new Schema<IPortfolio>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    totalValue: {
      type: Number,
      required: true,
      default: 0,
    },
    holdings: {
      type: Number,
      required: true,
      default: 0,
    },
    holdingsPercentage: {
      type: Number,
      required: true,
      default: 0,
    },
    cashFlows: {
      type: Number,
      required: true,
      default: 0,
    },
    totalInvestment: {
      type: Number,
      required: true,
      default: 0,
    },
    assets: [
      {
        assetId: {
          type: Schema.Types.ObjectId,
          ref: 'Asset',
          required: true,
        },
        investedAmount: {
          type: Number,
          required: true,
        },
        tokens: {
          type: Number,
          required: true,
        },
        tokenPrice: {
          type: Number,
          required: true,
        },
        investedDate: {
          type: Date,
          required: true,
        },
        rentalDistributions: [
          {
            month: {
              type: Date,
              required: true,
            },
            rentalIncome: {
              type: Number,
              required: true,
            },
          },
        ],
        latestValue: {
          type: Number,
          required: true,
        },
        moic: {
          type: Number,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
portfolioSchema.plugin(toJSON);

export const Portfolio = mongoose.model<IPortfolio>('Portfolio', portfolioSchema);