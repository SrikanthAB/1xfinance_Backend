import { model, Schema, Document, Types } from "mongoose";
import { customPlugin } from "../plugins/customPlugin";
import config from "../../config/config"; 
import bcrypt from "bcryptjs";
import { ITransaction } from "../order/transaction.model";
import {
  COUNTRY_CODE_REGEX,
  EMAIL_REGEX,
  MOBILE_NUMBER_REGEX,
} from "../../utils/regex";
import { AccountType } from "../../config/constants/enums";
import { IUser, Gender } from "../../interfaces/user/user.interface";
import { comparePassword, hashPassword } from "../../utils/bycrypt";

// Omit _id and id from IUser since they're already in Document
type OmitMongoId<T> = Omit<T, '_id' | 'id'>;

export interface IUserDocument extends OmitMongoId<IUser>, Document {
  // Explicitly define the _id field to match Mongoose's Document
  _id: Types.ObjectId;
  // Add the id getter that Mongoose provides
  id: string;
  // Add custom methods
  comparePassword(candidatePassword: string): Promise<boolean>;
}


const userSchema = new Schema<IUserDocument>(
  {
    fullName: {
      type: String,
      trim: true,
      default: null,
    },  
    kycCompleted: {
      type: Boolean,
      default: false,
    },
    email: {
      type: String,
      required: false,
      default: null,
      trim: true,
      validate: {
        validator: function (value: string | null) {
          return value === null || EMAIL_REGEX.test(value);
        },
        message: "Invalid email format",
      },
    },
    countryCode: {
      type: String,
      match: COUNTRY_CODE_REGEX,
      trim: true,
      default: config.defaultCountryCode,
    },
    mobileNumber: {
      type: String,
      sparse: true,
      unique: true, // Add this
      match: MOBILE_NUMBER_REGEX,
      trim: true,
      required:true,
    },
    password: {
      type: String,
      required: false,
      select: false,
      minlength: 8,
      maxlength: 128,
    },
    walletAddress: {
      type: String,
      required: false,
      trim: true,
      default: null,
      index: true,
      sparse: true,
      validate: {
        validator: function(value: string | null) {
          return value === null || /^0x[a-fA-F0-9]{40}$/.test(value);
        },
        message: 'Invalid wallet address format'
      }
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isMobileNumVerified: {
      type: Boolean,
      default: false,
    },
    country: {
      type: String,
      trim: true,
      default: "+254",
    },
    gender: {
      type: String,
      enum: Object.values(Gender),
      default: null,
    },
    dob: {
      type: Date,
      default: null,
    },
    type: {
      type: String,
      enum: Object.values(AccountType),
      default: null,
    },
    avatar: {
      type: String,
      default:
        "https://ryzer-v2.s3.ap-south-1.amazonaws.com/users/681c506bd81904bc923c7757/094fd3a1-3729-4f71-ad9f-86a74b1066be.png",
    },
    address: {
      type: {
        street: {
          type: String,
          trim: true,
          default: null,
        },
        city: {
          type: String,
          trim: true,
          default: null,
        },
        state: {
          type: String,
          trim: true,
          default: null,
        },
        country: {
          type: String,
          trim: true,
          default: null,
        },
        postalCode: {
          type: String,
          trim: true,
          default: null,
        },
      },
      default: null,
    },
    transactions: [{
      type: Schema.Types.ObjectId,
      ref: 'Transaction'
    }],
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" }, // Timestamps are handled automatically in UTC
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);


// Plugin to hide sensitive fields
userSchema.plugin(() =>
  customPlugin({
    hideFields: ["password", "kyc_completed"],
  })
);

// Pre-save hook to handle password hashing
userSchema.pre<IUserDocument>("save", async function (next) {
  if (this.isModified("password") && typeof this.password === "string") {
    this.password = await hashPassword(this.password);
  }
  next();
});

userSchema.methods.comparePassword = function (candidatePassword: string) {
  console.log("candidate password is here:", candidatePassword);
  console.log("compare password is here:", this.password);
  return bcrypt.compare(candidatePassword, this.password);
}


const User = model<IUserDocument>("User", userSchema);
export default User;
