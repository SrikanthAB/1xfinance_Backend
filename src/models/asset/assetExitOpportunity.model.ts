import { Document, Schema, model } from "mongoose";
import { IExitOpportunity } from "../../interfaces/asset/exitOpportunity.types";

export interface IExitOpportunityDocument extends IExitOpportunity, Document {}

const ExitOpportunitySchema = new Schema<IExitOpportunityDocument>({
    assetId: {
        type: Schema.Types.ObjectId,
        ref: 'Asset',
        required: true,
        trim: true,
    },
    name: { 
        type: String, 
        required: true, 
        trim: true 
    },
    description: { 
        type: String, 
        required: true, 
        trim: true 
    },
}, { timestamps: false });

const ExitOpportunity = model<IExitOpportunityDocument>("ExitOpportunity", ExitOpportunitySchema);

export default ExitOpportunity;