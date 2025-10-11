import mongoose, { Document, Model, Schema } from "mongoose";

export interface ILoanApplication extends Document {
  userId: string;
  loanType: "gold" | "land" | "mutual_funds" | "stocks" | "vehicles";
  
  // Asset Details
  goldWeightGrams?: number;
  goldPurityK?: "18K" | "22K" | "24K";
  itemDescription?: string;
  
  // Land/Property Details
  propertyType?: "residential" | "commercial" | "agricultural";
  landArea?: string;
  saleValuePerSqFt?: string;
  landLocation?: string;
  
  // Vehicle Details
  vehicleType?: "car" | "bike" | "commercial";
  vehicleMake?: string;
  vehicleModel?: string;
  vehicleYear?: number;
  vehicleValue?: number;
  
  // Mutual Fund/Stock Details
  portfolioValue?: number;
  portfolioType?: "mutual_funds" | "stocks";
  
  // Valuation Results
  marketValue: number;
  maxLoanAmount: number;
  ltvRatio: number;
  ratePerGram?: number; // For gold loans
  
  // Loan Terms
  requestedLoanAmount: number;
  loanTermMonths: number;
  selectedLender: string;
  interestRate: number;
  
  // Branch Details
  selectedBranchId?: string;
  selectedBranchName?: string;
  selectedBranchAddress?: string;
  selectedBranchPhone?: string;
  selectedBranchDistance?: number;
  
  // Application Status
  status: "draft" | "submitted" | "under_review" | "approved" | "rejected" | "disbursed";
  
  // Timestamps
  submittedAt?: Date;
  approvedAt?: Date;
  disbursedAt?: Date;
  
  // Additional Fields
  remarks?: string;
  rejectionReason?: string;
}

const LoanApplicationSchema = new Schema<ILoanApplication>(
  {
    userId: { type: String, required: true, index: true },
    loanType: { 
      type: String, 
      enum: ["gold", "land", "mutual_funds", "stocks", "vehicles"], 
      required: true 
    },
    
    // Asset Details
    goldWeightGrams: { type: Number, required: false, min: 0 },
    goldPurityK: { type: String, enum: ["18K", "22K", "24K"], required: false },
    itemDescription: { type: String, required: false, trim: true },
    
    propertyType: { type: String, enum: ["residential", "commercial", "agricultural"], required: false },
    landArea: { type: String, required: false, trim: true },
    saleValuePerSqFt: { type: String, required: false, trim: true },
    landLocation: { type: String, required: false, trim: true },
    
    vehicleType: { type: String, enum: ["car", "bike", "commercial"], required: false },
    vehicleMake: { type: String, required: false, trim: true },
    vehicleModel: { type: String, required: false, trim: true },
    vehicleYear: { type: Number, required: false, min: 1900, max: new Date().getFullYear() + 1 },
    vehicleValue: { type: Number, required: false, min: 0 },
    
    portfolioValue: { type: Number, required: false, min: 0 },
    portfolioType: { type: String, enum: ["mutual_funds", "stocks"], required: false },
    
    // Valuation Results
    marketValue: { type: Number, required: true, min: 0 },
    maxLoanAmount: { type: Number, required: true, min: 0 },
    ltvRatio: { type: Number, required: true, min: 0, max: 100 },
    ratePerGram: { type: Number, required: false, min: 0 },
    
    // Loan Terms
    requestedLoanAmount: { type: Number, required: true, min: 0 },
    loanTermMonths: { type: Number, required: true, min: 1, max: 60 },
    selectedLender: { type: String, required: true, trim: true },
    interestRate: { type: Number, required: true, min: 0, max: 50 },
    
    // Branch Details
    selectedBranchId: { type: String, required: false, trim: true },
    selectedBranchName: { type: String, required: false, trim: true },
    selectedBranchAddress: { type: String, required: false, trim: true },
    selectedBranchPhone: { type: String, required: false, trim: true },
    selectedBranchDistance: { type: Number, required: false, min: 0 },
    
    // Application Status
    status: { 
      type: String, 
      enum: ["draft", "submitted", "under_review", "approved", "rejected", "disbursed"], 
      default: "draft" 
    },
    
    // Timestamps
    submittedAt: { type: Date, required: false },
    approvedAt: { type: Date, required: false },
    disbursedAt: { type: Date, required: false },
    
    // Additional Fields
    remarks: { type: String, required: false, trim: true },
    rejectionReason: { type: String, required: false, trim: true },
  },
  { timestamps: true }
);

export const LoanApplication: Model<ILoanApplication> =
  (mongoose.models.LoanApplication as Model<ILoanApplication>) ||
  mongoose.model<ILoanApplication>("LoanApplication", LoanApplicationSchema);

export default LoanApplication;