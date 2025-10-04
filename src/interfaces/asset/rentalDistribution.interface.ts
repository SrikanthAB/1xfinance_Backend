// src/interfaces/asset/rentalDistribution.interface.ts
export interface IExpenseItem {
  label: string;
  amount: number; // positive number
  code?: string;  // e.g. "PM_FEE", "RESERVE"
}

export type TRentalStatus = "draft" | "ready" | "distributed" | "cancelled";
export type TPaymentStatus = "pending" | "paid" | "failed" | "cancelled";

export interface IRentalDistributionCreateRequest {
  assetId: string;
  // "YYYY-MM"
  distributionMonth: string;
  grossRentalIncome: number;     // monthly rent collected (pre-fees)
  expenses: IExpenseItem[];      // positive amounts
  distributionNotes?: string;
}

export interface IRentalDistributionUpdateRequest extends Partial<IRentalDistributionCreateRequest> {
  status?: TRentalStatus;
}
