import { Schema, model, Document, Types } from 'mongoose';

export enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

export interface ITransaction extends Document {
  // Core transaction data
  token: string;          // Token contract address
  symbol: string;         // Token symbol (e.g., "SILICON")
  from: string;           // Sender's wallet address
  to: string;             // Recipient's wallet address
  amount: string;         // Amount in wei (as string to handle large numbers)
  txHash: string;         // Transaction hash
  
  // Status and tracking
  status: TransactionStatus;
  
  // Additional metadata
  userId: Types.ObjectId;     // Reference to the user making the transaction
  propertyId: Types.ObjectId; // Reference to the property involved
  nonce?: number;         // Transaction nonce
  orderId : Types.ObjectId;   // Reference to the related Order
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  
//


  // Methods
  getExplorerUrl(): string;
  isConfirmed(): boolean;
  toJSON(): Omit<this & { _id: any }, 'id' | '_id' | '__v'> & { 
    id: string; 
    explorerUrl: string; 
    isConfirmed: boolean; 
  };
}

const transactionSchema = new Schema<ITransaction>(
  {
    // Core transaction data
    token: { 
      type: String, 
      required: [true, 'Token address is required'],
      match: [/^0x[a-fA-F0-9]{40}$/, 'Please provide a valid token address']
    },
    symbol: { 
      type: String, 
      required: [true, 'Token symbol is required'],
      uppercase: true
    },
    from: { 
      type: String, 
      required: [true, 'Sender address is required'],
      match: [/^0x[a-fA-F0-9]{40}$/, 'Please provide a valid sender address']
    },
    to: { 
      type: String, 
      required: [true, 'Recipient address is required'],
      match: [/^0x[a-fA-F0-9]{40}$/, 'Please provide a valid recipient address']
    },
    amount: { 
      type: String, 
      required: [true, 'Amount is required'],
      validate: {
        validator: (v: string) => /^\d+$/.test(v),
        message: 'Amount must be a positive integer in wei'
      }
    },
    txHash: { 
      type: String, 
      required: [true, 'Transaction hash is required'],
      unique: true,
      match: [/^0x([A-Fa-f0-9]{64})$/, 'Please provide a valid transaction hash']
    },
    
    // Status and tracking
    status: {
      type: String,
      enum: Object.values(TransactionStatus),
      default: TransactionStatus.PENDING,
    },
    
    // Additional metadata
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required']
    },
    propertyId: {
      type: Schema.Types.ObjectId,
      ref: 'Property',
      required: [true, 'Property ID is required']
    },
    orderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: [true, 'Order ID is required'],
      unique: true
    },
    nonce: {
      type: Number,
      min: [0, 'Nonce must be positive']
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform: function(doc: any, ret: any) {
        const transformed = {
          ...ret,
          id: ret._id.toString(),
          explorerUrl: doc.getExplorerUrl(),
          isConfirmed: doc.isConfirmed()
        };
        delete transformed._id;
        delete transformed.__v;
        return transformed;
      }
    }
  }
);

// Method to get the explorer URL for the transaction
transactionSchema.methods.getExplorerUrl = function (): string {
  // Using Polygon Amoy testnet explorer
  return `https://amoy.polygonscan.com/tx/${this.txHash}`;
};

// Method to check if transaction is confirmed
transactionSchema.methods.isConfirmed = function (this: ITransaction): boolean {
  return this.status === TransactionStatus.COMPLETED;
};

// Indexes for better query performance
transactionSchema.index({ txHash: 1 }, { unique: true });
transactionSchema.index({ from: 1, status: 1 });
transactionSchema.index({ to: 1, status: 1 });
transactionSchema.index({ userId: 1, status: 1 });
transactionSchema.index({ propertyId: 1, status: 1 });
transactionSchema.index({ orderId: 1, status: 1 });
transactionSchema.index({ orderId: 1 }, { unique: true });
transactionSchema.index({ createdAt: -1 }); // For sorting by most recent

const Transaction = model<ITransaction>("Transaction", transactionSchema);

// Example usage with your provided data
/*
const exampleTransaction = new Transaction({
  token: "0x8e543DCe080FeDf89BF3eb9E579Bb196B4e37365", // Token contract address
  symbol: "SILICON",                                 // Token symbol
  from: "0xFDa522b8c863ed7Abf681d0c86Cc0c5DCb95d4E6", // Sender's address
  to: "0x39A90e2f749418C01FDBce7C02b5B996Bd8c0563",   // Recipient's address
  amount: "2000000000000000000",                      // 2 tokens (with 18 decimals)
  txHash: "0x5e6f54c01b445a15c4413e2f92124cdafd41c0fdf23658ce6db5703f70bd86c6",
  status: TransactionStatus.COMPLETED,
  userId: new Types.ObjectId('507f1f77bcf86cd799439011'), // Example user ID
  propertyId: new Types.ObjectId('507f1f77bcf86cd799439012'), // Example property ID
  blockNumber: 1234567,                              // Block number on Polygon Amoy
  gasUsed: "21000",                                  // Gas used for the transaction
  gasPrice: "1000000000",                            // 1 Gwei in wei
  nonce: 1                                           // Transaction nonce
});

// Save to database
// await exampleTransaction.save();

// Get the explorer URL
const explorerUrl = exampleTransaction.getExplorerUrl();
console.log("Transaction URL:", explorerUrl);
console.log("Is confirmed:", exampleTransaction.isConfirmed());

// Query example
const transactions = await Transaction.find({ 
  userId: '507f1f77bcf86cd799439011',
  status: TransactionStatus.COMPLETED
}).sort({ createdAt: -1 }); // Most recent first
*/

export default Transaction;
