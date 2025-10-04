import {model,Document,Schema} from 'mongoose';
import { INominee,Gender,Relationship } from '../../interfaces/user/user.interface';

export interface INomineeDocument extends INominee, Document {}

const NomineeSchema = new Schema<INomineeDocument>(
  {
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    mobileNumber: {
      type: String,
      required: true,
    },
    relationship: {
      type: String,
      enum: Object.values(Relationship),
      required: true,
    },
    dob: {
      type: Date,
      required: true,
    },
    gender: {
      type: String,
      enum: Object.values(Gender),
      required: true,
    },
    aadharNumber: {
      type: Number,
      required: true,
    },
    isAadharVerified: {
      type: Boolean,
      default: false,
    },
    bankAccountNumber: {
      type: String,
      required: true,
    },
    ifscCode: {
      type: String,
      required: true,
    },
    bankName: {
      type: String,
      required: true,
    },
    bankBranch: {
      type: String,
      required: true,
    },
    isBankVerified: {
      type: Boolean,
      default: false,
    },
    distributionPercentage: {
      type: Number,
      min: 0,
      max: 100,
      default:100
    },
    address: {
      type: {
        street: {
          type: String,
        },
        city: {
          type: String,
        },
        state: {
          type: String,
        },
        country: {
          type: String,
        },
        postalCode: {
          type: String,
        },
      },
      default:null,
    },
      
  },
  { timestamps: true }
);


const NomineeModel = model<INomineeDocument>('Nominee',NomineeSchema)

export default NomineeModel;