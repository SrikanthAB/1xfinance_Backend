import { model, Schema, Document,Types } from 'mongoose';
import { IWallet } from '../../interfaces/web3/wallet.types';

export interface IWalletDocument extends IWallet, Document {}

const walletSchema = new Schema<IWalletDocument>({
    investorId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    address: {
        type: String,
        required: true,
        unique: true,
    },
    balance: {
        type: Number,
        default: 0,
    },
    status: {
        type: Boolean,
        default: true,
    },
}, { timestamps: true }); 


const WalletModel = model<IWalletDocument>('Wallet', walletSchema);
export default WalletModel;        