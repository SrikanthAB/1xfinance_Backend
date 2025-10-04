import mongoose, { Document, Model, Schema } from 'mongoose';
import crypto from 'crypto';
import { CONST_TOKENS } from '../config/constants/global';
import { customPlugin } from './plugins/customPlugin';

// Define the Token schema interface
export interface IToken extends Document {
  tokenHash: string;
  admin?: mongoose.Types.ObjectId;
  superAdmin?: mongoose.Types.ObjectId;
  employee?: mongoose.Types.ObjectId;
  role?: string;
  type: string;
  expires: Date;
  blacklisted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// Define the model interface
export interface ITokenModel extends Model<IToken> {}

// Token schema definition
const tokenSchema = new Schema<IToken>(
  {
    tokenHash: {
      type: String,
      required: true,
      index: true,
      private: true,
      select: false, 
    },
    superAdmin: {
      type: Schema.Types.ObjectId,
      ref: 'SuperAdmin',
    },
    admin: {
      type: Schema.Types.ObjectId,
      ref: 'Admin',
    },
    employee: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
    },
    role: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      enum: Object.values(CONST_TOKENS),
      required: true,
    },
    expires: {
      type: Date,
      required: true,
    },
    blacklisted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Hash token before saving if modified
tokenSchema.pre<IToken>('save', function (next) {
  if (this.isModified('tokenHash')) {
    this.tokenHash = crypto.createHash('sha256').update(this.tokenHash).digest('hex');
  }
  next();
});

tokenSchema.plugin((schema: Schema) => customPlugin({
  hideFields: ['tokenHash']
}));


// Create and export the Token model
const Token: ITokenModel = mongoose.model<IToken, ITokenModel>('Token', tokenSchema);

export default Token;
