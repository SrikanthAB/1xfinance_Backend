import mongoose, { Document, Schema } from 'mongoose';

// Define an interface representing an asset amenity document in MongoDB.
export interface IAssetAmenity extends Document {
  assetId: mongoose.Types.ObjectId;
  name: string;
  description: string;
  image: string;
  status: boolean;
  createdAt: Date;
}

// Define the schema corresponding to the document interface.
const AssetAmenitySchema: Schema = new Schema<IAssetAmenity>(
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
const AssetAmenity = mongoose.model<IAssetAmenity>('Amenity', AssetAmenitySchema);
export default AssetAmenity;

// model service controller middleware (optional) validation route 