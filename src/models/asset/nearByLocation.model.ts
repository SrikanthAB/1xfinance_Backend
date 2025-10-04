import { Document, Schema, model } from 'mongoose';
import { LocationType } from '../../config/constants/enums';
import { required } from 'joi';

export interface INearByLocation extends Document {
    assetId: Schema.Types.ObjectId;
    locationType: LocationType;
    name: string;
    address: string;
    distanceInKm: number;
    isActive: boolean;
    latitude: string;
    longitude: string;
    _id: string;
}

const NearByLocationSchema: Schema<INearByLocation> = new Schema(
    {
        assetId: {
            type: Schema.Types.ObjectId,
            ref: 'Property',
            required: true
        },
        locationType: {
            type: String,
            enum: Object.values(LocationType),
            required: true
        },
        latitude: {
            type: String,
            required: true
        },
        longitude: {
            type: String,
            required: true
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        address: {
            type: String,
            required: true,
            trim: true,
        },
        distanceInKm: {
            type: Number,
            required: true,
            min: [0, 'Distance must be a non-negative number'],
        },
        isActive: {
            type: Boolean,
            required: true,
            default: true
        }
    }
);

const NearByLocation = model<INearByLocation>('NearByLocation', NearByLocationSchema);
export default NearByLocation;