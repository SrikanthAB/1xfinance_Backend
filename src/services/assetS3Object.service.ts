import AssetS3Object from "../models/asset/assetS3Object.model";
import {
  IAssetS3Object,
  AssetS3ObjectQueryParams,
  IS3ObjectType,
} from "../interfaces/asset/assetS3Object";
import { MimeTypes } from "../interfaces/asset/mimeTypes";
import s3Service from "./s3.service";
import ApiError from "../utils/ApiError";
import httpStatus from "http-status";
import config from "../config/config";
import Asset from "../models/asset/asset.model";
import { Company } from "../models/company/company.model";
import User from "../models/user/user.model";

/**
 * @class AssetS3ObjectService
 * @description Service class for managing S3 assets in the application.
 * Handles CRUD operations for S3 objects, including file uploads, downloads,
 * and metadata management. Integrates with AWS S3 for storage operations.
 */
class AssetS3ObjectService {
  /**
   * Create a new AssetS3Object record in the database
   * @param {Partial<IAssetS3Object>} objectData - The asset data to create
   * @returns {Promise<IAssetS3Object>} The created asset record
   */
  async create(objectData: Partial<IAssetS3Object>): Promise<IAssetS3Object> {
    return AssetS3Object.create(objectData);
  }

  /**
   * Retrieve an AssetS3Object by its ID
   * @param {string} id - The ID of the asset to retrieve
   * @returns {Promise<IAssetS3Object | null>} The found asset or null if not found
   */
  async getOneById(id: string): Promise<IAssetS3Object | null> {
    const assetS3Object = await AssetS3Object.findById(id);
    if (!assetS3Object) {
      throw new ApiError({
        statusCode: httpStatus.NOT_FOUND,
        message: "Asset S3 Object not found, Make sure the id is correct",
      });
    }
    return assetS3Object;
  }

  /**
   * Get all AssetS3Objects associated with a specific asset ID
   * @param {string} assetId - The ID of the parent asset
   * @returns {Promise<IAssetS3Object[]>} Array of associated assets
   */
  async getAllByAssetId(assetId: string): Promise<IAssetS3Object[]> {
    const asset = await Asset.findById(assetId);
    if (!asset) {
      throw new ApiError({
        statusCode: httpStatus.BAD_REQUEST,
        message: "Asset not found, Make sure the asset id is correct",
      });
    }
    const assetS3Objects = await AssetS3Object.find({ assetId });
    if (assetS3Objects.length === 0) {
      throw new ApiError({
        statusCode: httpStatus.NOT_FOUND,
        message: "No assets found for the given asset ID",
      });
    }
    return assetS3Objects;
  }

  /**
   * Query AssetS3Objects with filtering and pagination
   * @param {AssetS3ObjectQueryParams} filter - Query parameters for filtering assets
   * @param {string} [filter.assetId] - Filter by parent asset ID
   * @param {MimeTypes} [filter.mimeType] - Filter by MIME type
   * @param {boolean} [filter.isPublic] - Filter by public access setting
   * @param {Date} [filter.startDate] - Filter by creation date range start
   * @param {Date} [filter.endDate] - Filter by creation date range end
   * @param {number} [filter.limit=10] - Maximum number of results to return
   * @param {number} [filter.skip=0] - Number of results to skip
   * @returns {Promise<IAssetS3Object[]>} Array of matching assets
   */
  async query(filter: AssetS3ObjectQueryParams): Promise<IAssetS3Object[]> {
    const {
      assetId,
      mimeType,
      isPublic,
      /* Commented out for now
      uploadedBy,
      */
      startDate,
      endDate,
      limit = 10,
      skip = 0,
    } = filter;

    const query: Record<string, any> = {};

    if (assetId) {
      const asset = await Asset.findById(assetId);
      query.assetId = assetId;
    }

    if (mimeType) query.mimeType = mimeType;
    if (isPublic !== undefined) query.isPublic = isPublic;
    /* Commented out for now
    if (uploadedBy) query.uploadedBy = new Types.ObjectId(uploadedBy);
    */

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = startDate;
      if (endDate) query.createdAt.$lte = endDate;
    }

    return AssetS3Object.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
  }

  /**
   * Delete an AssetS3Object by its ID
   * Removes both the database record and the corresponding S3 object
   * @param {string} id - The ID of the asset to delete
   * @throws {ApiError} When asset is not found
   * @returns {Promise<void>}
   */
  async delete(id: string): Promise<void> {
    const assetS3Object = await AssetS3Object.findById(id);
    if (!assetS3Object) {
      throw new ApiError({
        statusCode: httpStatus.NOT_FOUND,
        message: "Asset S3 Object not found, Make sure the id is correct",
      });
    }

    await s3Service.deleteObject(assetS3Object.key);
    await AssetS3Object.findByIdAndDelete(id);
  }

  /**
   * Delete all AssetS3Objects associated with an asset ID
   * Removes both database records and corresponding S3 objects
   * @param {string} assetId - The ID of the parent asset
   * @returns {Promise<number>} Number of assets deleted
   */
  async deleteByAssetId(assetId: string): Promise<number> {
    const asset = await Asset.findById(assetId);
    if (!asset) {
      throw new ApiError({
        statusCode: httpStatus.BAD_REQUEST,
        message: "Asset not found, Make sure the asset id is correct",
      });
    }
    const assets = await AssetS3Object.find({ assetId });

    if (assets.length === 0) {
      throw new ApiError({
        statusCode: httpStatus.NOT_FOUND,
        message: "No assets found for the given asset ID",
      });
    }

    for (const asset of assets) {
      await s3Service.deleteObject(asset.key);
    }

    const result = await AssetS3Object.deleteMany({ assetId });
    return result.deletedCount || 0;
  }

  /**
   * Generate a pre-signed URL for downloading an S3 asset
   * @param {string} id - The ID of the asset to download
   * @throws {ApiError} When asset is not found
   * @returns {Promise<string>} Pre-signed download URL
   */
  async getPresignedDownloadUrl(id: string): Promise<string> {
    const assetS3Object = await AssetS3Object.findById(id);
    if (!assetS3Object) {
      throw new ApiError({
        statusCode: httpStatus.NOT_FOUND,
        message: "Asset S3 Object not found, Make sure the id is correct",
      });
    }

    const asset = await Asset.findById(assetS3Object.refId);
    if (!asset) {
      throw new ApiError({
        statusCode: httpStatus.BAD_REQUEST,
        message:
          "Asset associated with the S3 object not found, Make sure the asset is present in the database",
      });
    }
    return s3Service.getPresignedDownloadUrl(assetS3Object.key);
  }

  /**
   * Generate a pre-signed upload URL and prepare the database record
   * @param {string} fileName - Name of the file to upload
   * @param {number} fileSize - Size of the file in bytes
   * @param {MimeTypes} mimeType - MIME type of the file
   * @param {string} assetId - ID of the parent asset
   * @param {boolean} [isPublic=false] - Whether the file should be publicly accessible
   * @param {Record<string, any>} [metadata={}] - Additional metadata for the file
   * @returns {Promise<Object>} Object containing:
   *   - uploadUrl: Pre-signed URL for uploading
   *   - assetS3Object: Created asset record
   *   - expiresIn: URL expiration time in seconds
   */
  async prepareUpload(
    fileName: string,
    fileSize: number,
    mimeType: MimeTypes,
    refId: string,
    belongsTo: IS3ObjectType,
    /* Commented out for now
    userId: string,
    */
    isPublic: boolean = false,
    metadata: Record<string, any> = {}
  ): Promise<{
    uploadUrl: string;
    savedS3Object: IAssetS3Object;
    expiresIn: number;
  }> {
    if (belongsTo === IS3ObjectType.ASSET) {
      const asset = await Asset.findById(refId);

      if (!asset) {
        throw new ApiError({
          statusCode: httpStatus.BAD_REQUEST,
          message: "Asset not found, Make sure the asset id is correct",
        });
      }
    } else if (belongsTo === IS3ObjectType.COMPANY) {
      const company = await Company.findById(refId);
      if (!company) {
        throw new ApiError({
          statusCode: httpStatus.BAD_REQUEST,
          message: "Company not found, Make sure the company id is correct",
        });
      }
    } else if (belongsTo === IS3ObjectType.USER) {
      const user = await User.findById(refId);
      if (!user) {
        throw new ApiError({
          statusCode: httpStatus.BAD_REQUEST,
          message: "User not found, Make sure the user id is correct",
        });
      }
    } else {
      throw new ApiError({
        statusCode: httpStatus.BAD_REQUEST,
        message: `Invalid belongsTo value, must be one of: ${Object.values(IS3ObjectType).join(', ')}`,
      });
    }

    // Generate presigned URL
    const {
      url,
      key: s3ObjectKey,
      expiresIn,
    } = await s3Service.getPresignedUploadUrl(
      fileName,
      mimeType,
      refId,
      belongsTo,
      metadata
    );

    // Create asset record
    const savedS3Object = await this.create({
      refId,
      belongsTo,
      fileName,
      fileSize,
      mimeType,
      key: s3ObjectKey,
      bucket: config.aws.s3.bucketName || "",
      isPublic,
      /* Commented out for now
      uploadedBy: new Types.ObjectId(userId),
      */
      metadata,
    });

    return {
      uploadUrl: url,
      savedS3Object,
      expiresIn,
    };
  }

  /**
   * Get the permanent S3 URL for an asset
   * @param {string} id - The ID of the asset
   * @throws {ApiError} When asset is not found
   * @returns {Promise<string>} Permanent S3 URL
   */
  async getPermanentUrl(id: string): Promise<string> {
    const assetS3Object = await AssetS3Object.findById(id);
    if (!assetS3Object) {
      throw new ApiError({
        statusCode: httpStatus.NOT_FOUND,
        message: "Asset S3 Object not found, Make sure the id is correct",
      });
    }

    if (assetS3Object.belongsTo === IS3ObjectType.ASSET) {
      const asset = await Asset.findById(assetS3Object.refId);

      if (!asset) {
        throw new ApiError({
          statusCode: httpStatus.BAD_REQUEST,
          message: "Asset not found, Make sure the asset id is correct",
        });
      }
    } else if (assetS3Object.belongsTo === IS3ObjectType.COMPANY) {
      const company = await Company.findById(assetS3Object.refId);
      if (!company) {
        throw new ApiError({
          statusCode: httpStatus.BAD_REQUEST,
          message: "Company not found, Make sure the company id is correct",
        });
      }
    }

    return s3Service.getPublicUrl(assetS3Object.key);
  }
}

export default new AssetS3ObjectService();
