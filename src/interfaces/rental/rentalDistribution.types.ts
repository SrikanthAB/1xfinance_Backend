import { Document, Types } from 'mongoose';

export enum RentalDistributionStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

export interface IRentalPeriod {
  assetId: Types.ObjectId;
  month: number;
  year: number;
  grossYieldKES: number;
  netYieldKES: number;
  status: RentalDistributionStatus;
  distributedAt?: Date;
  distributionNotes?: string;
  createdBy: Types.ObjectId;
  updatedBy: Types.ObjectId;
}

export interface IRentalDistribution {
  rentalPeriodId: Types.ObjectId;
  investorId: Types.ObjectId;
  amountKES: number;
  status: 'PENDING' | 'PAID' | 'FAILED';
  bankRef?: string;
  paymentDate?: Date;
  paymentNotes?: string;
  createdBy: Types.ObjectId;
  updatedBy: Types.ObjectId;
}

export interface IRentalPeriodDocument extends IRentalPeriod, Document {}
export interface IRentalDistributionDocument extends IRentalDistribution, Document {}

export interface RentalDistributionSummary {
  totalDistributed: number;
  totalPending: number;
  totalFailed: number;
  distributions: IRentalDistribution[];
}

export interface DistributeRentalRequest {
  assetId: string;
  month: number;
  year: number;
  userId: string;
}

export interface DistributeToInvestorRequest {
  rentalPeriodId: string;
  investorId: string;
  amountKES: number;
  userId: string;
}
