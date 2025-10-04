import { Types } from "mongoose";
import {AccountType, UserRoles} from "../../config/constants/enums";

export enum Gender {
  Male = 'male',
  Female = 'female',
  Other = 'other',
  PreferNotToSay = 'prefer-not-to-say'
}

export enum Relationship{
  Father = 'father',
  Mother = 'mother',
  Son = 'son',
  Daughter = 'daughter',
  Brother = 'brother',
  Sister = 'sister',
  Uncle = 'uncle',
  Aunt = 'aunt',
  Grandfather = 'grandfather',
  Grandmother = 'grandmother',
  Guardian = 'guardian',
  Spouse = 'spouse',
  Friend = 'friend',
  Other = 'other'
}

interface IAddress {
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
} 

export interface IUser {
  _id?: string | Types.ObjectId;
  id?: string;
  fullName: string; 
  kycCompleted: boolean;
  created_at: Date;
  updated_at: Date;
  email?: string;
  mobileNumber?: string;
  country?: string;
  avatar?: string;
  countryCode?: string;
  isEmailVerified?: boolean;
  isMobileNumVerified?: boolean;
  type: AccountType;
  isActive: boolean;
  isDeleted: boolean;
  isProfileCompleted: boolean;
  accountType: AccountType;
  walletAddress?: string; // For blockchain wallet address
  gender?: Gender;
  dob?: Date;
  address?: IAddress;
  password?: string;
  transactions?: Types.ObjectId[];
}

export interface InvestorList {
  fullName: string | null;
  email: string | false; 
  type: string; // Should be constrained to AccountType enum elsewhere
  createdAt: Date;

  tokensBooked: number;
  totalOrderValue: number;
  ownership: number;

  status: 'active' | 'pending';
}

export interface INominee{
  fullName: string;
  email: string;
  mobileNumber: string;
  relationship: Relationship;
  dob: Date;
  gender: Gender;
  aadharNumber: Number;
  address: IAddress;
  isAadharVerified: boolean;
  bankAccountNumber: string;
  ifscCode: string;
  bankName: string;
  bankBranch: string;
  isBankVerified: boolean;
  distributionPercentage: number;
} 
