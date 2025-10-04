import { Document, Schema, model } from "mongoose";

export interface IRiskFactor extends Document{
    assetId:Schema.Types.ObjectId,
    name:string,
    description:string,
    _id:string,
}

const RiskFactorSchema = new Schema<IRiskFactor>({
    assetId:{
        type:Schema.Types.ObjectId,
        ref:'Asset',
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


const RiskFactor = model<IRiskFactor>("RiskFactor",RiskFactorSchema) ;
export default RiskFactor;

