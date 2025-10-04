import mongoose, { Document, Schema } from 'mongoose';

// Define an interface representing an asset feature document in MongoDB.
export interface IAssetFeature extends Document {
    assetId: mongoose.Types.ObjectId;
    name: string;
    description: string;
    image: string;
    status: boolean;
    createdAt: Date;
}

// Define the schema corresponding to the document interface.
const AssetFeatureSchema: Schema = new Schema<IAssetFeature>(
    {
        assetId: {
            type: Schema.Types.ObjectId,
            ref: 'Asset',
            required: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
        image: {
            type: String,
            required: true,
        },
        status: {
            type: Boolean,
            default: true,
        }
    },
    { timestamps: true }
);

// Export the model using the interface for type checking.
const AssetFeature = mongoose.model<IAssetFeature>('Feature', AssetFeatureSchema);
export default AssetFeature; 