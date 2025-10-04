import { IAdditionalTax } from "../../interfaces/asset/assetAdditionalTax.types";
import { Document, Schema, model } from "mongoose";

export interface IAdditionalTaxDocument extends IAdditionalTax, Document {}

const AdditionalTaxSchema = new Schema<IAdditionalTaxDocument>({
    assetId: {
        type: Schema.Types.ObjectId,
        ref: "Asset",
        required: true,
        trim: true,
    },
    name: { 
        type: String, 
        required: true, 
        trim: true 
    },
    value: { 
        type: Number, 
        required: true
    },
}, { timestamps: false });

const AdditionalTax = model<IAdditionalTaxDocument>("AdditionalTax", AdditionalTaxSchema);
export default AdditionalTax;