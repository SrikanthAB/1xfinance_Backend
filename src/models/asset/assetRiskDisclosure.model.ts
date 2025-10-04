import { Document, Schema, model } from "mongoose";

export interface IRiskDisclosure extends Document{
    assetId:Schema.Types.ObjectId,
    name:string,
    description:string,
    _id:string
}

const RiskDisclosureSchema = new Schema<IRiskDisclosure>({
    assetId:{
        type:Schema.Types.ObjectId,
        ref:"Asset",
        required:true,
        trim:true,
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

const RiskDisclosure = model<IRiskDisclosure>("RiskDisclosure",RiskDisclosureSchema);
export default RiskDisclosure;