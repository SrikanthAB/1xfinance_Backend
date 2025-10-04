
import { Schema, model, Document } from 'mongoose';
import mapAadhaarFieldsPlugin from '../../utils/mapAadhaarFields';

// Aadhaar Interface
export interface IAadhaar extends Document {
  userId: Schema.Types.ObjectId;
  refId: string | null;
  status: 'VALID' | 'INVALID';
  message: string;
  careOf: string | null;
  address: string;
  dob: string;
  email?: string;
  gender: 'M' | 'F' | 'O';
  name: string;
  splitAddress: ISplitAddress;
  yearOfBirth: string | null;
  mobileHash: string | null;
  photoLink: string | null;
  shareCode: string | null;
  xmlFile: string | null;
}


// Split Address Interface
export interface ISplitAddress {
  country: string | null;
  dist: string | null;
  house: string | null;
  landmark?: string | null;
  pincode: string | null;
  po: string | null;
  state: string | null;
  street: string | null;
  subdist: string | null;
  vtc: string | null;
  locality: string | null;
}


// Aadhaar Schema
const AadhaarSchema = new Schema<IAadhaar>(
  {
    userId:{
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    refId: {
      type: String,
      default:null,
    },
    status: {
      type: String,
      enum: ['VALID', 'INVALID'],
      default:'VALID',
    },
    message: {
      type: String,
      default:null
    },
    careOf: {
      type: String,
      default:null
    },
    address: {
      type: String,
      default:null
    },
    dob: {
      type: String,
      default:null,
    },
    email: {
      type: String,
      default: '',
    },
    gender: {
      type: String,
      default:null,
    },
    name: {
      type: String,
      default:null,
    },
    yearOfBirth: {
      type: String,
      default:null
    },
    mobileHash: {
      type: String,
      default:null
    },
    photoLink: {
      type: String,
      default:null
    },
    shareCode: {
      type: String,
      default:null
    },
    xmlFile: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: false },
    versionKey: false,
  }
);

// Export Aadhaar Model
const Aadhaar = model<IAadhaar>('Aadhaar', AadhaarSchema);

export default Aadhaar;
