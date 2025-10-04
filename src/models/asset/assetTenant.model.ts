import { Document, Schema, model } from "mongoose";
import { IAssetTenant, TenantStatus, TenantType } from "../../interfaces/asset/assetTenant.types";

export interface IAssetTenantDocument extends IAssetTenant, Document {}

const AssetTenantSchema = new Schema({
  assetId: {
    type: Schema.Types.ObjectId,
    ref: 'Asset',
    required: true
  },
  name: {
    type: String,
    trim: true,
    required: true
  },
  rentPerSft: {
    type: Number,
    required: true
  },
  sftsAllocated: {
    type: Number,
    required: true
  },
  annualRentEscalation: {
    type: Number,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: Object.values(TenantStatus),
    default: TenantStatus.ACTIVE
  },
  type: {
    type: String,
    enum: Object.values(TenantType),
    default: TenantType.CORPORATE,
    required: true
  },
  lockInPeriod: {
    type: Number,
    required: true
  },
  leasePeriod: {
    type: Number,
    required: true
  },
  securityDeposit: {
    type: Number,
    required: true
  },
  interestOnSecurityDeposit: {
    type: Number,
    required: true
  },
  agreement: {
    type: String,
    trim: true,
    default: null
  },
  logo: {
    type: String,
    trim: true,
    default: null
  }
}, { timestamps: true });

const AssetTenant = model<IAssetTenantDocument>('AssetTenant', AssetTenantSchema);
export default AssetTenant; 