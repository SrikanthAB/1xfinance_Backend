import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { MimeTypes } from "../interfaces/asset/mimeTypes";
import { v4 as uuidv4 } from "uuid";
import config from "../config/config";
import { IS3ObjectType } from "../interfaces/asset/assetS3Object";

/**
 * @class S3Service
 * @description Service class for interacting with AWS S3.
 * Provides methods for generating pre-signed URLs for upload/download operations
 * and managing objects in S3 buckets. Uses AWS SDK v3 for improved performance
 * and modular architecture.
 */
class S3Service {
  private s3Client: S3Client;
  private bucket: string;
  private bucketUrl: string;

  /**
   * Initialize S3 client with AWS credentials and configuration
   * @throws {Error} If required AWS configuration is missing
   */
  constructor() {
    if (
      !config.aws.s3.awsRegion ||
      !config.aws.s3.awsAccessKeyId ||
      !config.aws.s3.awsSecretAccessKey
    ) {
      throw new Error("AWS configuration is missing");
    }

    this.s3Client = new S3Client({
      region: config.aws.s3.awsRegion,
      credentials: {
        accessKeyId: config.aws.s3.awsAccessKeyId,
        secretAccessKey: config.aws.s3.awsSecretAccessKey,
      },
      forcePathStyle: true, // Needed for some S3-compatible services
    });

    if (!config.aws.s3.bucketName) {
      throw new Error("S3 bucket name is missing");
    }
    this.bucket = config.aws.s3.bucketName;
    this.bucketUrl =
      process.env.AWS_BUCKET_URL ||
      `https://${this.bucket}.s3.${config.aws.s3.awsRegion}.amazonaws.com`;
  }

  /**
   * Get the permanent S3 URL for an object (only works for public objects)
   * @param {string} key - S3 object key
   * @returns {string} Permanent S3 URL
   */
  getPublicUrl(key: string): string {
    // Encode the key properly for URLs, preserving forward slashes
    const encodedKey = encodeURIComponent(key)
      .replace(/%2F/g, "/") // Preserve forward slashes
      .replace(/%20/g, "+"); // Replace spaces with plus signs as per S3 convention

    return `${this.bucketUrl}/${encodedKey}`;
  }

  /**
   * Generate a pre-signed URL for uploading a file to S3
   * @param {string} fileName - Original name of the file
   * @param {MimeTypes} mimeType - MIME type of the file
   * @param {string} assetId - ID of the parent asset
   * @param {Record<string, string>} [metadata={}] - Additional metadata to store with the object
   * @returns {Promise<Object>} Object containing:
   *   - url: Pre-signed URL for uploading
   *   - key: Generated S3 object key
   *   - expiresIn: URL expiration time in seconds
   */
  async getPresignedUploadUrl(
    fileName: string,
    mimeType: MimeTypes,
    refId: string,
    belongsTo: IS3ObjectType,
    metadata: Record<string, string> = {}
  ): Promise<{ url: string; key: string; expiresIn: number }> {
    const fileExtension = fileName.split(".").pop() || "";
    let key = "";
    if (belongsTo === IS3ObjectType.ASSET) {
      key = `assets/${refId}/${uuidv4()}.${fileExtension}`;
    } else if (belongsTo === IS3ObjectType.COMPANY) {
      key = `companies/${refId}/${uuidv4()}.${fileExtension}`;
    } else if (belongsTo === IS3ObjectType.USER) {
      key = `users/${refId}/${uuidv4()}.${fileExtension}`;
    } else {
      key = `others/${refId}/${uuidv4()}.${fileExtension}`;
    }

    // console.log("key", key);

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: mimeType,
      Metadata: {
        refId,
        belongsTo,
        ...metadata,
      },
    });

    const expiresIn = 3600; // 1 hour
    const url = await getSignedUrl(this.s3Client, command, { expiresIn });

    return { url, key, expiresIn };
  }

  /**
   * Generate a pre-signed URL for downloading a file from S3
   * @param {string} key - S3 object key
   * @returns {Promise<string>} Pre-signed download URL (expires in 1 hour)
   */
  async getPresignedDownloadUrl(key: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    // const expiresIn = 3600; // 1 hour
    return getSignedUrl(this.s3Client, command);
  }

  /**
   * Delete an object from S3
   * @param {string} key - S3 object key to delete
   * @returns {Promise<void>}
   */
  async deleteObject(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    await this.s3Client.send(command);
  }
}

export default new S3Service();
