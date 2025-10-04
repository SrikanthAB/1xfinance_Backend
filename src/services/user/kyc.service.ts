import {
  DocumentModel,
  IDocument,
  SmileJobStatusResponse,
} from "../../models/user/document.model";
import config from "../../config/config";
import { generateSignature } from "../../utils/generateSignature";
import axios, { AxiosInstance } from "axios";
import logger from "../../config/logger";
import { Types } from "mongoose";
import { createHmac } from "crypto";
import KycJobModel from "../../models/user/kycdocument.model";
import UserService from "../user/user.service"; // Update this path if needed

type UserIdType = string | Types.ObjectId;

// Define interfaces for KYC status response
interface KYCVerificationDetails {
  idVerified: boolean;
  selfieVerified: boolean;
  documentVerified: boolean;
  adminApproved: boolean;
}

interface KYCStatusResponse {
  userId: string;
  hasKycDocument: boolean;
  kycDocument?: {
    _id: any;
    job_id?: string;
    ResultCode?: string;
    ResultText?: string;
    createdAt?: Date;
    updatedAt?: Date;
  };
  kycCompleted: boolean;
  verificationStatus:
    | "not_started"
    | "pending"
    | "approved"
    | "rejected"
    | "error";
  verificationDetails: KYCVerificationDetails;
  lastUpdated?: Date;
  error?: string;
}

interface KYCUploadResponse {
  success: boolean;
  message: string;
  documentId?: string;
  jobId?: string;
  imageData?: {
    selfie?: string;
    frontDocument?: string;
    backDocument?: string;
  };
}

// Interface for SmileID signature response
interface SmileIDSignatureResponse {
  success: boolean;
  timestamp: string;
  signature: string;
  partnerId: string;
  environment: string;
}

/**
 * Initializes and returns an Axios instance for SmileID API
 * @returns {AxiosInstance} Configured Axios instance for SmileID API
 */
const initializeSmileID = (): AxiosInstance => {
  if (!config.smileId) {
    throw new Error("SmileID configuration is missing");
  }

  // Ensure required config values are present
  if (!config.smileId.apiKey || !config.smileId.partnerId) {
    throw new Error(
      "Missing required SmileID configuration (apiKey or partnerId)"
    );
  }

  const instance = axios.create({
    baseURL:
      config.smileId.apiUrl ||
      (config.smileId.environment === "production"
        ? "https://api.smileidentity.com/v1"
        : "https://testapi.smileidentity.com/v1"),
    timeout: 30000, // 30 seconds timeout
  });

  // Add request interceptor to include auth headers in every request
  instance.interceptors.request.use(
    (config) => {
      // Add authentication headers
      config.headers = config.headers || {};
      config.headers["Content-Type"] = "application/json";
      config.headers["api-key"] = "d557625d-3b91-43a7-8218-af6dfdf7ddd3";
      config.headers["partner-id"] = "2442";
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  return instance;
};

const KycService = {
  /**
   * Store KYC status for a user
   * @param data KYC document data
   * @returns Created KYC document
   */
  async storeKycStatus(data: IDocument): Promise<IDocument> {
    try {
      logger.info(
        `Storing KYC status for user ${data.PartnerParams?.user_id}`,
        {
          jobId: data.PartnerParams?.job_id,
          resultCode: data.ResultCode,
          resultText: data.ResultText,
        }
      );

      const res = await DocumentModel.create(data);
      logger.info(
        `Successfully stored KYC status for user ${data.PartnerParams?.user_id}`,
        {
          documentId: res._id,
          jobId: res.PartnerParams?.job_id,
        }
      );

      return res;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      const errorStack = error instanceof Error ? error.stack : undefined;

      logger.error(
        `Error storing KYC status for user ${data.PartnerParams?.user_id}`,
        {
          error: errorMessage,
          stack: errorStack,
          jobId: data.PartnerParams?.job_id,
        }
      );
      throw new Error(`Failed to store KYC status: ${errorMessage}`);
    }
  },

  /**
   * Get KYC document by user ID
   * @param userId User ID to search for
   * @returns KYC document or null if not found
   */
  // async getKycDocument(userId: UserIdType): Promise<IDocument | null> {
  //   try {
  //     logger.debug(`Fetching KYC document for user ${userId}`);
  //     const latestDocument = await DocumentModel.findOne({ 'PartnerParams.user_id': userId.toString() } as any)
  //       .sort({ timestamp: -1 })
  //       .lean()
  //       .exec() as IDocument | null;
  //       console.log("latestDocument is here:", latestDocument);

  //     if (!latestDocument) {
  //       logger.warn(`No KYC document found for user ${userId}`);
  //       return null;
  //     }

  //     const jobId = (latestDocument as any).job_id || (latestDocument.PartnerParams?.job_id as string);
  //     if (!jobId) {
  //       logger.warn(`No job_id found in KYC document for user ${userId}`);
  //       return null;
  //     }

  //     return latestDocument;
  //   } catch (error: unknown) {
  //     if (error instanceof Error) {
  //       logger.error('Error in getKycDocument:', error);
  //       logger.error(`Error details: ${error.message || 'No error message'}`);
  //       if (error.stack) {
  //         logger.error(`Stack trace: ${error.stack}`);
  //       }
  //       throw new Error(`Failed to fetch KYC document: ${error.message}`);
  //     } else {
  //       const errorMessage = String(error);
  //       logger.error(`Unknown error in getKycDocument: ${errorMessage}`);
  //       throw new Error('Failed to fetch KYC document: An unknown error occurred');
  //     }
  //   }
  // },

  async fetchFromSmileIdByUserId(userId: string): Promise<SmileJobStatusResponse | null> {
    // 🔍 Get the latest job_id stored for this user
    const document = await KycJobModel.findOne({ userId })
      .sort({ createdAt: -1 })
      .lean();

    const jobId = document?.jobId;
    console.log("Fetched jobId:", jobId);

    if (!jobId) {
      logger.warn(
        `No job_id available for SmileID fallback for user ${userId}`
      );
      return null;
    }

    const timestamp = new Date().toISOString();
    const signature = generateSignature(timestamp);

    try {
      const response = await axios.post(
        "https://api.smileidentity.com/v1/job_status",
        {
          job_id: jobId,
          user_id: userId,
          signature: signature,
          partner_id: process.env.SMILE_ID_PARTNER_ID,
          timestamp: timestamp,
        }
      );

      if (response.data) {
        return response.data as SmileJobStatusResponse;
      }

      return null;
    } catch (error) {
      logger.error("SmileID API request failed:", error);
      return null;
    }
  },

  async getKycDocument(userId: UserIdType): Promise<SmileJobStatusResponse | null> {
    try {
      // 🧠 Fallback: Try calling Smile ID API if nothing is in DB
      const smileResponse = await this.fetchFromSmileIdByUserId(
        userId.toString()
      );

      if (!smileResponse) {
        return null;
      }

      await DocumentModel.create(smileResponse);

      return smileResponse;
    } catch (error: unknown) {
      if (error instanceof Error) {
        logger.error("Error in getKycDocument:", error);
        logger.error(`Error details: ${error.message}`);
        if (error.stack) {
          logger.error(`Stack trace: ${error.stack}`);
        }
        throw new Error(`Failed to fetch KYC document: ${error.message}`);
      } else {
        const errorMessage = String(error);
        logger.error(`Unknown error in getKycDocument: ${errorMessage}`);
        throw new Error(
          "Failed to fetch KYC document: An unknown error occurred"
        );
      }
    }
  },

  /**
   * Get comprehensive KYC status for a user
   * @param userId User ID to check
   * @returns Object containing KYC status and related information
   */
  async getKycStatus(userId: UserIdType): Promise<SmileJobStatusResponse | null> {
    try {
      const userIdStr =
        userId instanceof Types.ObjectId ? userId.toString() : userId;
      logger.info(`Fetching KYC status for user ${userIdStr}`);

      // Get the most recent KYC document
      const kycDoc = await this.getKycDocument(userId);
      if (!kycDoc) {
        return null;
      }
      if (kycDoc.job_success === true) {
        await UserService.updateUserById(userIdStr, {
          kycCompleted: true,
        });
      }

      return kycDoc;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      const errorStack = error instanceof Error ? error.stack : undefined;

      logger.error(`Error getting KYC status for user ${userId}`, {
        error: errorMessage,
        stack: errorStack,
      });

      return null;
    }
  },

  // Keep the old getUserId method for backward compatibility
  async getUserId(userId: string): Promise<IDocument | null> {
    return this.getKycDocument(userId);
  },

  /**
   * Generate a signature for SmileID API requests
   * @returns Object containing signature and related data
   */
  async getUserById(userId: UserIdType): Promise<any> {
    try {
      const User = (await import("../../models/user/user.model")).default;
      return await User.findById(userId).lean();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      const errorStack = error instanceof Error ? error.stack : undefined;

      logger.error(`Error fetching user ${userId}:`, {
        error: errorMessage,
        stack: errorStack,
      });
      return null;
    }
  },

  async generateSignatureForSMILEID(): Promise<SmileIDSignatureResponse> {
    try {
      logger.debug("Generating signature for SmileID API");
      // Generate ISO timestamp (e.g., 2025-07-29T12:16:20.000+05:30 for IST)
      const date = new Date();
      const timestamp = date.toISOString();

      // Generate the signature using the utility function
      const signature = generateSignature(timestamp);

      const smileConfig = config.smileId || {};
      const environment = smileConfig.environment || "unknown";
      const partnerId = smileConfig.partnerId || "";

      logger.debug("Successfully generated SmileID signature", {
        timestamp,
        environment,
      });

      return {
        success: true,
        timestamp,
        signature,
        partnerId,
        environment,
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      const errorStack = error instanceof Error ? error.stack : undefined;

      logger.error("Error generating SmileID signature", {
        error: errorMessage,
        stack: errorStack,
      });
      throw new Error(`Failed to generate SmileID signature: ${errorMessage}`);
    }
  },

  // Confirming an incoming signature
  async confirmSignature(
    receivedSignature: string,
    receivedTimestamp: string
  ): Promise<boolean> {
    try {
      logger.debug("Confirming signature for SmileID API", {
        receivedSignature,
        receivedTimestamp,
      });

      if (!config.smileId?.apiKey || !config.smileId?.partnerId) {
        logger.error("Missing API key or partner ID in configuration");
        return false;
      }

      const hmac = createHmac("sha256", config.smileId.apiKey);
      hmac.update(receivedTimestamp, "utf8");
      hmac.update(config.smileId.partnerId, "utf8");
      hmac.update("sid_request", "utf8");

      const generatedSignature = Buffer.from(hmac.digest()).toString("base64");

      const isValid = generatedSignature === receivedSignature;
      logger.debug("Signature validation result", {
        isValid,
        generatedSignature,
        receivedSignature,
      });

      return isValid;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      logger.error("Error confirming SmileID signature", {
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });
      return false;
    }
  },

  /**
   * Re-enables KYC enrollment for a user in Smile ID
   * @param userId User ID to re-enable KYC for
   * @returns Object indicating success/failure and a message
   */
  async reEnrollKycUser(
    userId: UserIdType,
    data: any
  ): Promise<{ success: boolean; message: string }> {
    try {
      logger.info(`Initiating KYC re-enrollment for user ${userId}`);
      console.log("data is here:", data);

      // Use the correct production URL with manual headers
      const urlPath = "https://prod.smileidentity.com/api/v2/partner/enrollee";
      const response = await axios.post(urlPath, data, {
        headers: {
          "Content-Type": "application/json",
          "api-key": config.smileId.apiKey,
          "partner-id": config.smileId.partnerId,
        },
      });
      console.log(config.smileId.apiKey, " config.smileId.apiKey");
      console.log("Response from SmileID re-enrollment:", response.data);

      logger.info(`Successfully re-enabled KYC enrollment for user ${userId}`, {
        response: response.data,
      });

      return {
        success: true,
        message: "User re-enabled for KYC enrollment successfully",
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      const responseData = (error as any)?.response?.data;

      logger.error(
        `Error re-enabling KYC enrollment for user ${userId}: ${errorMessage}`,
        {
          error: error instanceof Error ? error.stack : error,
          response: responseData,
        }
      );

      return {
        success: false,
        message:
          responseData?.message ||
          `Failed to re-enable KYC enrollment: ${errorMessage}`,
      };
    }
  },
};
export default KycService;
