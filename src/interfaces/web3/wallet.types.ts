import { Types } from "mongoose";

export interface IWallet{
    investorId:Types.ObjectId;
    address: string;
    balance: number;
    status: boolean;
    createdAt: Date;
    updatedAt: Date;
}