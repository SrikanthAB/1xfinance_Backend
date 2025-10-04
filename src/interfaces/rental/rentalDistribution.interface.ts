import { Document, Types } from 'mongoose';

export interface IRentalDistribution extends Document {
  rentalPeriodId: Types.ObjectId;
  investorId: Types.ObjectId;
  amountKES: number;
  status: 'PENDING' | 'PAID' | 'FAILED';
  paymentReference?: string;
  paymentDate?: Date;
  failureReason?: string;
  metadata?: Record<string, any>;
  createdBy: Types.ObjectId;
  updatedBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUpdateRentalDistribution extends Partial<Omit<IRentalDistribution, 'rentalPeriodId' | 'investorId' | 'createdBy' | 'createdAt' | 'updatedAt'>> {
  updatedBy: Types.ObjectId;
  updatedAt: Date;
}
