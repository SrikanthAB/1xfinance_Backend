import mongoose, { Schema, Model } from "mongoose";
import { IPrivilege } from "../interfaces/global";

// Define Privilege Schema
const PrivilegeSchema: Schema = new Schema(
  {
    resource: { type: String, required: true }, // Resource 'spv'
    actions: { type: [String], required: true }, // Actions like 'create', 'read', 'update', 'delete'
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt timestamps
  }
);

// Privilege model
// spv-1
const Privilege: Model<IPrivilege> = mongoose.model<IPrivilege>("Privilege", PrivilegeSchema);

export default Privilege;



