// src/interfaces/wallet/wallet.interface.ts
export type TCurrency = "INR" | "USD" | "USDC";

export interface IWalletAccountCreate {
  ownerId: string;          // investor/user _id
  currency: TCurrency;
  label?: string;           // optional display name
}

export interface IWalletCredit {
  accountId?: string;       // if not provided, use (ownerId + currency)
  ownerId?: string;
  currency?: TCurrency;
  amount: number;           // positive, in major units
  reference: string;        // idempotency key, unique per (account, reference)
  meta?: Record<string, any>;
  session?: import("mongoose").ClientSession;
}

export interface IWalletDebit extends IWalletCredit {}

export interface IWalletTransfer {
  from: { accountId?: string; ownerId?: string; currency?: TCurrency };
  to: { accountId?: string; ownerId?: string; currency?: TCurrency };
  amount: number;
  reference: string;        // will be used on both legs with -DR/-CR postfixes
  meta?: Record<string, any>;
}
