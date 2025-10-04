import { Document } from "mongoose";
import { IPrivilege } from "./global";

// Interface for Role
export interface IRole extends Document {
  _id: string;
  name: string; // e.g., 'Admin', 'User', 'Editor'
  privileges: IPrivilege[]; // Array of privileges for this role
  description?: string; // Optional description of the role
}