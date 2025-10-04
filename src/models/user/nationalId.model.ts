import mongoose, { Schema, Document } from "mongoose";
import { encrypt, decrypt } from "../../utils/crypto";

export interface INationalId extends Document {
  userId: mongoose.Types.ObjectId | null;
  country: string;
  idType: string;
  idNumber: string;
  fullName: string;
  dob: string;
  photo: string;
  gender: string;
  address: string;
  createdAt: Date;
  updatedAt: Date;
  getDecryptedData(options: { isAdmin: boolean; isOwner: boolean }): Record<string, any>;
}

const NationalIdSchema = new Schema<INationalId>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      validate: {
        validator: (v: mongoose.Types.ObjectId) => mongoose.Types.ObjectId.isValid(v),
        message: "Invalid user ID format",
      },
    },
    country: { type: String, required: true },
    idType: { type: String, required: true },

    idNumber: {
      type: String,
      required: true,
      set: encrypt,
    },
    fullName: {
      type: String,
      required: true,
      set: encrypt,
    },
    dob: {
      type: String, // encrypted as string
      required: true,
      set: encrypt,
    },
    photo: {
      type: String,
      required: true,
      set: encrypt,
    },
    gender: {
      type: String,
      required: true,
      set: encrypt,
    },
    address: {
      type: String,
      required: true,
      set: encrypt,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Method for conditional decryption
NationalIdSchema.methods.getDecryptedData = function (options: { isAdmin: boolean; isOwner: boolean }) {
  const isAllowed = options.isAdmin || options.isOwner;
  return {
    _id: this._id,
    userId: this.userId,
    country: this.country,
    idType: this.idType,
    idNumber: isAllowed ? decrypt(this.idNumber) : null,
    fullName: isAllowed ? decrypt(this.fullName) : null,
    dob: isAllowed ? decrypt(this.dob) : null,
    photo: isAllowed ? decrypt(this.photo) : null,
    gender: isAllowed ? decrypt(this.gender) : null,
    address: isAllowed ? decrypt(this.address) : null,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

// Model definition with guard (for hot reload)
export const NationalId =
  mongoose.models.NationalId || mongoose.model<INationalId>("NationalId", NationalIdSchema);
