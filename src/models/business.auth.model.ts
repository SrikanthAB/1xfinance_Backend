import mongoose, { Document, Model, Schema } from "mongoose";

export interface IBusinessMail extends Document {
 
  email: string;
}

const BusinessMailSchema = new Schema<IBusinessMail>(
  {
   
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
  },
  { timestamps: true }
);



export const BusinessMail: Model<IBusinessMail> =
  (mongoose.models.BusinessMail as Model<IBusinessMail>) ||
  mongoose.model<IBusinessMail>("BusinessMail", BusinessMailSchema);

export default BusinessMail;

