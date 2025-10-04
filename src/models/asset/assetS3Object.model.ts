import mongoose, { Schema } from 'mongoose';
import { IAssetS3ObjectDoc, IS3ObjectType } from '../../interfaces/asset/assetS3Object';
import { MimeTypes } from '../../interfaces/asset/mimeTypes';

/**
 * Mongoose schema for S3 assets.
 * Defines the structure and validation rules for storing S3 object metadata in MongoDB.
 * Includes indexes for optimizing common queries.
 */
const assetS3ObjectSchema = new Schema(
  {
    /**
     * ID of the parent asset this S3 object belongs to.
     * Indexed for faster lookups when querying by assetId.
     */
    refId: {
      type: String,
      required: true,
      index: true,
    },

    belongsTo: {
      type: String,
      required: true,
      enum: Object.values(IS3ObjectType),
    },

    /**
     * Original name of the uploaded file.
     */
    fileName: {
      type: String,
      required: true,
    },

    /**
     * Size of the file in bytes.
     */
    fileSize: {
      type: Number,
      required: true,
    },

    /**
     * MIME type of the file.
     * Must be one of the supported types defined in MimeTypes enum.
     */
    mimeType: {
      type: String,
      enum: Object.values(MimeTypes),
      required: true,
    },

    /**
     * S3 object key (path in the bucket).
     * Must be unique across all assets.
     */
    key: {
      type: String,
      required: true,
      unique: true,
    },

    /**
     * Name of the S3 bucket where the file is stored.
     */
    bucket: {
      type: String,
      required: true,
    },

    /**
     * Whether the file is publicly accessible.
     * Defaults to false for security.
     */
    isPublic: {
      type: Boolean,
      default: false,
    },

    /* Commented out for now
    /**
     * Reference to the user who uploaded the file.
     * Links to the User collection.
     */
    /*
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    */

    /**
     * Additional metadata stored with the file.
     * Flexible schema using Mixed type to allow any valid JSON.
     */
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true, // Automatically manage createdAt and updatedAt fields
  }
);

// Create compound index for faster queries by assetId and mimeType
assetS3ObjectSchema.index({ assetId: 1, mimeType: 1 });

/**
 * Mongoose model for S3 assets.
 * Provides an interface for interacting with the AssetS3Object collection.
 */
const AssetS3Object = mongoose.model<IAssetS3ObjectDoc>('AssetS3Object', assetS3ObjectSchema);

export default AssetS3Object; 