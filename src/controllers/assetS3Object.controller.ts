import { Request, Response } from 'express';
import httpStatus from 'http-status';
import assetS3ObjectService from '../services/assetS3Object.service';
import catchAsync from '../utils/catchAsync';
import ApiError from '../utils/ApiError';
import { MimeTypes } from '../interfaces/asset/mimeTypes';

/**
 * @description Retrieve a list of S3 assets with optional filtering
 * @param {Request} req - Express request object
 * @param {Object} req.query - Query parameters for filtering
 * @param {string} [req.query.assetId] - Filter by parent asset ID
 * @param {string} [req.query.mimeType] - Filter by MIME type
 * @param {boolean} [req.query.isPublic] - Filter by public access setting
 * @param {string} [req.query.startDate] - Filter by start date
 * @param {string} [req.query.endDate] - Filter by end date
 * @param {number} [req.query.limit] - Maximum number of results
 * @param {number} [req.query.skip] - Number of results to skip
 * @param {Response} res - Express response object
 * @returns {Promise<void>} Array of matching S3 assets
 */
export const getAssetS3Objects = catchAsync(async (req: Request, res: Response) => {
  const { assetId, mimeType, isPublic, startDate, endDate, limit, skip } = req.query;
  
  const filter: any = {};
  if (assetId) filter.assetId = assetId as string;
  if (mimeType) filter.mimeType = mimeType as MimeTypes;
  if (isPublic !== undefined) filter.isPublic = isPublic === 'true';
  if (startDate) filter.startDate = new Date(startDate as string);
  if (endDate) filter.endDate = new Date(endDate as string);
  if (limit) filter.limit = parseInt(limit as string);
  if (skip) filter.skip = parseInt(skip as string);
  
  /* Commented out for now
  // Add uploadedBy filter if needed based on your auth requirements
  // filter.uploadedBy = req.user.id;
  */
  
  const assets = await assetS3ObjectService.query(filter);
  res.status(httpStatus.OK).send(assets);
});

/**
 * @description Get a specific S3 asset by its ID
 * @param {Request} req - Express request object
 * @param {string} req.params.id - ID of the S3 asset
 * @param {Response} res - Express response object
 * @throws {ApiError} When asset is not found
 * @returns {Promise<void>} The requested S3 asset
 */
export const getAssetS3ObjectById = catchAsync(async (req: Request, res: Response) => {
  const asset = await assetS3ObjectService.getOneById(req.params.id);
  if (!asset) {
    throw new ApiError({
      statusCode: httpStatus.NOT_FOUND,
      message: 'Asset not found'
    });
  }
  res.status(httpStatus.OK).send(asset);
});

/**
 * @description Get all S3 assets associated with a specific asset ID
 * @param {Request} req - Express request object
 * @param {string} req.params.assetId - ID of the parent asset
 * @param {Response} res - Express response object
 * @returns {Promise<void>} Array of associated S3 assets
 */
export const getAssetS3ObjectsByAssetId = catchAsync(async (req: Request, res: Response) => {
  const assets = await assetS3ObjectService.getAllByAssetId(req.params.assetId);
  res.status(httpStatus.OK).send(assets);
});

/**
 * @description Generate a pre-signed URL for downloading an S3 asset
 * @param {Request} req - Express request object
 * @param {string} req.params.id - ID of the S3 asset
 * @param {Response} res - Express response object
 * @returns {Promise<void>} Object containing the pre-signed download URL
 */
export const getS3ObjectUrl = catchAsync(async (req: Request, res: Response) => {
  const downloadUrl = await assetS3ObjectService.getPresignedDownloadUrl(req.params.id);
  res.status(httpStatus.OK).send({ downloadUrl });
});

/**
 * @description Generate a pre-signed URL for uploading a single file
 * @param {Request} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.fileName - Name of the file
 * @param {number} req.body.fileSize - Size of the file in bytes
 * @param {string} req.body.mimeType - MIME type of the file
 * @param {string} req.body.assetId - ID of the parent asset
 * @param {boolean} [req.body.isPublic] - Whether the file should be publicly accessible
 * @param {Object} [req.body.metadata] - Additional metadata for the file
 * @param {Response} res - Express response object
 * @throws {ApiError} When MIME type is not supported
 * @returns {Promise<void>} Object containing upload details and pre-signed URL
 */
export const createSingleUploadUrl = catchAsync(async (req: Request, res: Response) => {
  const { fileName, fileSize, mimeType, refId, belongsTo, isPublic, metadata } = req.body;
  
  // Validate MIME type
  if (!Object.values(MimeTypes).includes(mimeType)) {
    throw new ApiError({
      statusCode: httpStatus.BAD_REQUEST,
      message: `Unsupported MIME type: ${mimeType}`
    });
  }
  
  const result = await assetS3ObjectService.prepareUpload(
    fileName,
    fileSize,
    mimeType,
    refId,
    belongsTo,
    /* Commented out for now
    req.user.id,
    */
    isPublic,
    metadata
  );
  
  res.status(httpStatus.CREATED).send(result);
});

/**
 * @description Generate pre-signed URLs for uploading multiple files
 * @param {Request} req - Express request object
 * @param {Object} req.body - Request body
 * @param {Object[]} req.body.files - Array of file information
 * @param {string} req.body.assetId - ID of the parent asset
 * @param {boolean} [req.body.isPublic] - Whether the files should be publicly accessible
 * @param {Response} res - Express response object
 * @throws {ApiError} When files array is empty or MIME type is not supported
 * @returns {Promise<void>} Array of objects containing upload details and pre-signed URLs
 */
export const createMultipleUploadUrls = catchAsync(async (req: Request, res: Response) => {
  const { files } = req.body;
  
  if (!Array.isArray(files) || files.length === 0) {
    throw new ApiError({
      statusCode: httpStatus.BAD_REQUEST,
      message: 'Files array is required'
    });
  }
  
  const results = [];
  
  for (const file of files) {
    const { fileName, fileSize, mimeType, refId, belongsTo, isPublic, metadata } = file;
    
    // Validate MIME type
    if (!Object.values(MimeTypes).includes(mimeType)) {
      throw new ApiError({
        statusCode: httpStatus.BAD_REQUEST,
        message: `Unsupported MIME type: ${mimeType}`
      });
    }
    
    const result = await assetS3ObjectService.prepareUpload(
      fileName,
      fileSize,
      mimeType,
      refId,
      belongsTo,
      /* Commented out for now
      req.user.id,
      */
      isPublic,
      metadata
    );
    
    results.push(result);
  }
  
  res.status(httpStatus.CREATED).send(results);
});

/**
 * @description Update a specific S3 asset by replacing it with a new file
 * @param {Request} req - Express request object
 * @param {Object} req.body - Request body with new file information
 * @param {string} req.params.id - ID of the S3 asset to update
 * @param {string} req.params.assetId - ID of the parent asset
 * @param {Response} res - Express response object
 * @throws {ApiError} When asset is not found or MIME type is not supported
 * @returns {Promise<void>} Object containing new upload details and pre-signed URL
 */
export const updateAssetS3Object = catchAsync(async (req: Request, res: Response) => {
  const { fileName, fileSize, mimeType, isPublic, metadata } = req.body;
  const assetId = req.params.assetId;
  
  // Find current object
  const asset = await assetS3ObjectService.getOneById(req.params.id);
  if (!asset) {
    throw new ApiError({
      statusCode: httpStatus.NOT_FOUND,
      message: 'Asset not found'
    });
  }
  
  // Validate MIME type
  if (!Object.values(MimeTypes).includes(mimeType)) {
    throw new ApiError({
      statusCode: httpStatus.BAD_REQUEST,
      message: `Unsupported MIME type: ${mimeType}`
    });
  }
  
  // Delete the existing object
  await assetS3ObjectService.delete(req.params.id);
  
  // Create a new upload URL
  const result = await assetS3ObjectService.prepareUpload(
    fileName,
    fileSize,
    mimeType,
    assetId,
    /* Commented out for now
    req.user.id,
    */
    isPublic,
    metadata
  );
  
  res.status(httpStatus.OK).send(result);
});

/**
 * @description Update multiple S3 assets associated with an asset ID
 * @param {Request} req - Express request object
 * @param {Object} req.body - Request body
 * @param {Object[]} [req.body.files] - Array of new file information
 * @param {string[]} [req.body.deleteIds] - Array of S3 asset IDs to delete
 * @param {boolean} [req.body.deleteAll] - Whether to delete all existing assets
 * @param {string} req.body.assetId - ID of the parent asset
 * @param {Response} res - Express response object
 * @throws {ApiError} When MIME type is not supported
 * @returns {Promise<void>} Array of objects containing new upload details and pre-signed URLs
 */
export const updateMultipleAssetS3Objects = catchAsync(async (req: Request, res: Response) => {
  const { files, assetId, deleteAll } = req.body;
  
  // Check if we should delete all existing objects
  if (deleteAll) {
    await assetS3ObjectService.deleteByAssetId(assetId);
  } else if (req.body.deleteIds && Array.isArray(req.body.deleteIds)) {
    // Delete specific objects
    for (const id of req.body.deleteIds) {
      await assetS3ObjectService.delete(id);
    }
  }
  
  // Create new upload URLs if files provided
  const results = [];
  
  if (files && Array.isArray(files) && files.length > 0) {
    for (const file of files) {
      const { fileName, fileSize, mimeType, isPublic, metadata } = file;
      
      // Validate MIME type
      if (!Object.values(MimeTypes).includes(mimeType)) {
        throw new ApiError({
          statusCode: httpStatus.BAD_REQUEST,
          message: `Unsupported MIME type: ${mimeType}`
        });
      }
      
      const result = await assetS3ObjectService.prepareUpload(
        fileName,
        fileSize,
        mimeType,
        assetId,
        /* Commented out for now
        req.user.id,
        */
        isPublic,
        metadata
      );
      
      results.push(result);
    }
  }
  
  res.status(httpStatus.OK).send(results);
});

/**
 * @description Delete a specific S3 asset
 * @param {Request} req - Express request object
 * @param {string} req.params.id - ID of the S3 asset to delete
 * @param {Response} res - Express response object
 * @returns {Promise<void>} Empty response with 204 status
 */
export const deleteAssetS3Object = catchAsync(async (req: Request, res: Response) => {
  await assetS3ObjectService.delete(req.params.id);
  res.status(httpStatus.NO_CONTENT).send();
});

/**
 * @description Delete all S3 assets associated with an asset ID
 * @param {Request} req - Express request object
 * @param {string} req.params.assetId - ID of the parent asset
 * @param {Response} res - Express response object
 * @returns {Promise<void>} Object containing the number of deleted assets
 */
export const deleteAssetS3ObjectsByAssetId = catchAsync(async (req: Request, res: Response) => {
  const count = await assetS3ObjectService.deleteByAssetId(req.params.assetId);
  res.status(httpStatus.OK).send({ deletedCount: count });
});

/**
 * @description Get permanent S3 URL for an asset
 * @param {Request} req - Express request object
 * @param {string} req.params.id - ID of the S3 asset
 * @param {Response} res - Express response object
 * @returns {Promise<void>} Object containing the permanent S3 URL
 */
export const getPermanentS3Url = catchAsync(async (req: Request, res: Response) => {
  const s3Url = await assetS3ObjectService.getPermanentUrl(req.params.id);
  res.status(httpStatus.OK).send({ s3Url });
}); 