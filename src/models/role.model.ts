import mongoose, { Schema, Model } from "mongoose";
import { IRole } from "../interfaces/role";

// Define Role Schema
const RoleSchema: Schema = new Schema(
  {
    name: { type: String, required: true, unique: true }, // Role name like 'Admin', 'Editor'
    privileges: [{ type: Schema.Types.ObjectId, ref: "Privilege" }], // Reference to Privilege documents
    description: { type: String },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt timestamps
  }
);

// Role model
const Role: Model<IRole> = mongoose.model<IRole>("Role", RoleSchema);

export default Role;
