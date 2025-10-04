import { z } from 'zod';
import { MimeTypes } from '../interfaces/asset/mimeTypes';
import { IS3ObjectType } from '../interfaces/asset/assetS3Object';

const createSingleUploadUrl = {
  body: z.object({
    fileName: z.string(),
    fileSize: z.number().positive(),
    mimeType: z.enum(Object.values(MimeTypes) as [string, ...string[]], {
      errorMap: () => ({ message: `Invalid mimeType value, must be one of: ${Object.values(MimeTypes).join(', ')}` })
    }),
    refId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Ref Id should be a valid MongoDB ObjectId(Asset, Company, User or Others)'),
    belongsTo: z.enum(Object.values(IS3ObjectType) as [string, ...string[]], {
      errorMap: () => ({ message: `Invalid belongsTo value, must be one of: ${Object.values(IS3ObjectType).join(', ')}` })
    }),
    isPublic: z.boolean().default(false).optional(),
    metadata: z.record(z.any()).optional(),
  }),
};


const createMultipleUploadUrls = {
  body: z.object({
    files: z.array(
      z.object({
        fileName: z.string(),
        fileSize: z.number().positive(),
        mimeType: z.enum(Object.values(MimeTypes) as [string, ...string[]], {
          errorMap: () => ({ message: `Invalid mimeType value, must be one of: ${Object.values(MimeTypes).join(', ')}` })
        }),
        metadata: z.record(z.any()).optional(),
        refId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Ref Id should be a valid MongoDB ObjectId(Asset, Company, User or Others)'),
        belongsTo: z.enum(Object.values(IS3ObjectType) as [string, ...string[]], {
          errorMap: () => ({ message: `Invalid belongsTo value, must be one of: ${Object.values(IS3ObjectType).join(', ')}` })
        }),
        isPublic: z.boolean().default(false).optional(),
      })
    )
  }),
};


const updateAssetS3Object = {
  params: z.object({
    id: z.string(),
    refId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Asset Id should be a valid MongoDB ObjectId'),
    belongsTo: z.enum(Object.values(IS3ObjectType) as [string, ...string[]], {
      errorMap: () => ({ message: `Invalid belongsTo value, must be one of: ${Object.values(IS3ObjectType).join(', ')}` })
    }),
  }),
  body: z.object({
    fileName: z.string(),
    fileSize: z.number().positive(),
    mimeType: z.enum(Object.values(MimeTypes) as [string, ...string[]], {
      errorMap: () => ({ message: `Invalid mimeType value, must be one of: ${Object.values(MimeTypes).join(', ')}` })
    }),
    isPublic: z.boolean().default(false).optional(),
    metadata: z.record(z.any()).optional(),
  }),
};


const updateMultipleAssetS3Objects = {
  params: z.object({
    refId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Asset Id should be a valid MongoDB ObjectId'),
    belongsTo: z.enum(Object.values(IS3ObjectType) as [string, ...string[]], {
      errorMap: () => ({ message: `Invalid belongsTo value, must be one of: ${Object.values(IS3ObjectType).join(', ')}` })
    }),
  }),
  body: z.object({
    files: z.array(
      z.object({
        fileName: z.string(),
        fileSize: z.number().positive(),
        mimeType: z.enum(Object.values(MimeTypes) as [string, ...string[]], {
          errorMap: () => ({ message: `Invalid mimeType value, must be one of: ${Object.values(MimeTypes).join(', ')}` })
        }),
        isPublic: z.boolean().default(false).optional(),
        metadata: z.record(z.any()).optional(),
      })
    ).optional(),
    deleteIds: z.array(z.string()).optional(),
    deleteAll: z.boolean().default(false).optional(),
    assetId: z.string(),
  }),
};


const getAssetS3Objects = {
  query: z.object({
    refId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Asset Id should be a valid MongoDB ObjectId').optional(),
    belongsTo: z.enum(Object.values(IS3ObjectType) as [string, ...string[]], {
      errorMap: () => ({ message: `Invalid belongsTo value, must be one of: ${Object.values(IS3ObjectType).join(', ')}` })
    }).optional(),
    mimeType: z.enum(Object.values(MimeTypes) as [string, ...string[]], {
      errorMap: () => ({ message: `Invalid mimeType value, must be one of: ${Object.values(MimeTypes).join(', ')}` })
    }).optional(),
    isPublic: z.boolean().optional(),
    startDate: z.string().transform(val => new Date(val)).optional(),
    endDate: z.string().transform(val => new Date(val)).optional(),
    limit: z.string().transform(val => parseInt(val)).pipe(z.number().int().min(1).max(100)).optional(),
    skip: z.string().transform(val => parseInt(val)).pipe(z.number().int().min(0)).optional(),
  }),
};


const getAssetS3ObjectById = {
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid MongoDB ObjectId format'),
  }),
};

const deleteAssetS3Object = {
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid MongoDB ObjectId format'),
  }),
};


const getS3ObjectUrl = {
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid MongoDB ObjectId format'),
  }),
};


const getPermanents3Url = {
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid MongoDB ObjectId format'),
  }),
};

export default {
  createSingleUploadUrl,
  createMultipleUploadUrls,
  updateAssetS3Object,
  updateMultipleAssetS3Objects,
  getAssetS3Objects,
  getAssetS3ObjectById,
  deleteAssetS3Object,
  getS3ObjectUrl,
  getPermanents3Url,
}; 