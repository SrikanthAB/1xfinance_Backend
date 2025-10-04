import {Document,Schema,model} from "mongoose";

export interface IAssetTermsAndConditions extends Document{
    assetId:Schema.Types.ObjectId,
    title:string,
    description:string,
    _id:string,
}

const AssetTermsAndConditionsSchema:Schema = new Schema({
    assetId: {
        type: Schema.Types.ObjectId,
        ref: 'Asset',
        required: true
      },
    title:{
        type:String,
        required:true,
        trim:true
    },
    description:{
        type:String,
        required:true,
        trim:true
    }, 
},{timestamps:true})

const AssetTermsAndConditions = model<IAssetTermsAndConditions>("AssetTermsAndConditions",AssetTermsAndConditionsSchema);
export default AssetTermsAndConditions; 