import mongoose, { Schema, Document } from "mongoose";

export interface IKycJob extends Document {
  userId: mongoose.Types.ObjectId;
  jobId: string;
  createdAt: Date;
  updatedAt: Date;
}

const KycJobSchema = new Schema<IKycJob>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: () => "User", // ✅ avoids circular import issues
      required: true,
    },
    jobId: {
      type: String,
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

const KycJobModel = mongoose.model<IKycJob>("KycJob", KycJobSchema);
export default KycJobModel;
