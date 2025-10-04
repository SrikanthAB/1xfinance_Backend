import { Document, Schema, model } from "mongoose";
import { AssetDocument, EAssetDocumentType, EAssetDocumentFormat } from "../../interfaces/asset/assetDocument.types";

export interface IAssetDocumentDocument extends AssetDocument, Document {}

// Asset Document Schema
const AssetDocumentSchema = new Schema({
  assetId: {
    type: Schema.Types.ObjectId,
    ref: 'Asset',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: Object.values(EAssetDocumentType),
    required: true
  },
  format: {
    type: String,
    default:null
  },
  document: {
    name: {
       type:String,
       default:null
    },
    url:{
      type:String,
      default:null
    }
  },
  isProtected: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

const AssetDocument = model<IAssetDocumentDocument>('AssetDocument', AssetDocumentSchema);
export default AssetDocument; 