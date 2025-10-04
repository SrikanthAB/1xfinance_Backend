import {Document,Schema,model} from "mongoose";

export interface IFaq extends Document{
    assetId:Schema.Types.ObjectId,
    question:string,
    answer:string,
    _id:string,
}

const FaqSchema:Schema = new Schema({
    assetId: {
        type: Schema.Types.ObjectId,
        ref: 'Asset',
        required: true
      },
    question:{
        type:String,
        required:true,
        trim:true
    },
    answer:{
        type:String,
        required:true,
        trim:true
    }, 
},{timestamps:true})

const Faq = model<IFaq>("Faq",FaqSchema);
export default Faq;