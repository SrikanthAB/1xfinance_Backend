import catchAsync from "../../utils/catchAsync";
import type { Response, NextFunction, RequestHandler } from "express";
// Import the extended Express types to ensure they're registered
import { Request } from "express";

import KycService from "../../services/user/kyc.service";
import UserService from "../../services/user/user.service";
import { IDocument } from "../../models/user/document.model";
import { IUser } from "../../interfaces/user/user.interface";
import { model, Types } from "mongoose";
import { v4 as uuidv4 } from "uuid";

import KycJobModel from "../../models/user/kycdocument.model";

// Define interfaces for KYC responses
interface KYCStatusResponse {
  userId: string;
  hasKycDocument: boolean;
  kycDocument?: IDocument;
  kycCompleted: boolean;
  verificationStatus:
    | "not_started"
    | "pending"
    | "approved"
    | "rejected"
    | "error";
  verificationDetails: {
    idVerified: boolean;
    selfieVerified: boolean;
    documentVerified: boolean;
    adminApproved: boolean;
  };
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

// The Request type is now extended via the centralized type definition in ../../types/express

import { randomUUID } from "crypto";
import { WebApi } from "smile-identity-core";
import logger from "../../config/logger";
import config from "../../config/config";
const SIDWebAPI = WebApi;

const KycController = {
  /**
   * Generate a KYC token for the authenticated user
   */
  // generateToken: catchAsync(
  //   async (req: Request, res: Response): Promise<void> => {
  //     if (!req.user?._id) {
  //       res.status(401).json({ message: "Unauthorized" });
  //       return;
  //     }

  //     try {
  //       const user = await UserService.getUserById(req.user._id);

  //       if (!user) {
  //         res.status(404).json({
  //           message: "User not found",
  //           status: "error",
  //         });
  //         return;
  //       }

  //       if (user.kycCompleted) {
  //         res.status(200).json({
  //           message: "KYC already completed",
  //           status: "success",
  //           data: {
  //             token: "KYC_ALREADY_COMPLETED",
  //           },
  //         });
  //       }

  //       // Generate a unique token for KYC
  //       const kycToken = `KYC_${Date.now()}_${randomUUID()}`;

  //       // In a real implementation, you would store this token in the database
  //       // with an expiration time and associate it with the user

  //       res.status(200).json({
  //         message: "KYC token bokka ra niku generated successfully",
  //         status: "success",
  //         data: {
  //           token: kycToken,
  //           expiresIn: "1h", // Token expiration time
  //         },
  //       });
  //     } catch (error) {
  //       logger.error("Error generating KYC token:", error);
  //       res.status(500).json({
  //         message: "Failed to generate KYC token",
  //         status: "error",
  //         error: error instanceof Error ? error.message : "Unknown error",
  //       });
  //     }
  //   }
  // ) as RequestHandler,

  generateToken: catchAsync(
    async (req: Request, res: Response): Promise<void> => {
      if (!req.user?._id) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      try {
        const user = await UserService.getUserById(req.user._id);

        if (!user) {
          res.status(404).json({
            message: "User not found",
            status: "error",
          });
          return;
        }
        const smile = new SIDWebAPI(
          config.smileId.partnerId,
          "https://api.ownmali.com/api/kyc/get-kyc-status",
          config.smileId.apiKey,
          1
        );
        const job = `job_${uuidv4()}`;
        if (!job) {
  throw new Error("Job ID generation failed");
}

        console.log("Generated jobId:", job);

        console.log(
          `KYC Job ID: ${job} - User ID: ${req.user._id}`)

        await KycJobModel.create({ userId: req.user._id, jobId: job });

        const tokenResponse = await smile.get_web_token({
          user_id: req.user._id.toString(),
          job_id: job,
          product: "doc_verification",
          callback_url: "https://api.ownmali.com/api/kyc/get-kyc-status",
        });

 
        if (user.kycCompleted) {
          res.status(200).json({
            message: "KYC already completed",
            status: "success",
            data: {
              token: "KYC_ALREADY_COMPLETED",
            },
          });
          return;
        }

        // Generate a unique token for KYC

        // In a real implementation, you would store this token in the database
        // with an expiration time and associate it with the user
        res.status(200).json({
          message: "KYC token generated successfully",
          status: "success",
          data: {
            token: tokenResponse.token,
            expiresIn: "1h", // Token expiration time
          },
        });
      } catch (error) {
        logger.error("Error generating KYC token:", error);
        res.status(500).json({
          message: "Failed to generate KYC token",
          status: "error",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }
  ) as RequestHandler,

  /**
   * Store KYC status from SmileID webhook
   */
  storeKycStatus: catchAsync(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const kycData: IDocument = req.body;

      if (!kycData.PartnerParams?.user_id) {
        res.status(400).json({
          message: "Invalid KYC data: Missing user_id in PartnerParams",
          status: "error",
        });
      }

      try {
        const storedKycData = await KycService.storeKycStatus(kycData);
        const userId = kycData.PartnerParams.user_id;

        // Ensure userId is a valid ObjectId before querying
        if (Types.ObjectId.isValid(userId)) {
          const user = await UserService.getUserById(
            new Types.ObjectId(userId)
          );

          if (!user) {
            logger.warn(`User not found for KYC update: ${userId}`);
          } else if (kycData.ResultCode === "0810" && user._id) {
            await UserService.updateUserById(user._id.toString(), {
              kycCompleted: true,
            });
          }
        }

        res.status(200).json({
          message: "KYC status stored successfully.",
          status: "success",
          data: storedKycData,
        });
      } catch (error) {
        logger.error("Error storing KYC status:", error);
        res.status(500).json({
          message: "Error storing KYC status",
          status: "error",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }
  ),

  /**
   * Get comprehensive KYC status for the authenticated user
   */
  getKycStatus: catchAsync(
    async (req: Request, res: Response): Promise<void> => {
      if (!req.user?._id) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      try {
        const kycStatus = await KycService.getKycStatus(req.user._id);

        res.status(200).json({
          message: "KYC status  successfully.",
          status: "success",
          data: kycStatus,
        });
      } catch (error) {
        res.status(500).json({
          message: "Error retrieving KYC status",
          status: "error",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }
  ) as RequestHandler,

  /**
   * Generate a signature for SmileID API requests
   */
  generateSignatureForSMILEID: catchAsync(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const result = await KycService.generateSignatureForSMILEID();
        console.log("result is here in controll part ", result);

        if (!result.success) {
          logger.error("Failed to generate SmileID signature");
          res.status(500).json({
            status: "error",
            message: "Failed to generate KYC signature",
          });
          return;
        }

        res.status(200).json({
          status: "success",
          data: {
            timestamp: result.timestamp,
            signature: result.signature,
            partnerId: result.partnerId,
            environment: result.environment,
          },
        });
      } catch (error) {
        logger.error("Error generating SMILE ID signature:", error);
        res.status(500).json({
          status: "error",
          message: "Failed to generate SMILE ID signature",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }
  ),

  // Confirming an incoming signature

  confirmSignature: catchAsync(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const { signature, timestamp } = req.body;
        if (!signature || !timestamp) {
          res.status(400).json({
            status: "error",
            message: "Signature and timestamp are required",
          });
          return;
        }
        const isValid = await KycService.confirmSignature(signature, timestamp);
        console.log("isValid is here:", isValid);
        if (isValid) {
          res.status(200).json({
            status: "success",
            message: "Signature confirmed successfully",
          });
        } else {
          res.status(400).json({
            status: "error",
            message: "Invalid signature or timestamp",
          });
        }
      } catch (error) {
        logger.error("Error confirming signature:", error);
        res.status(500).json({
          status: "error",
          message: "Failed to confirm signature",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }
  ) as RequestHandler,

  getKycDocument: catchAsync(
    async (req: Request, res: Response): Promise<void> => {
      try {
        const userId = req.params.userId || req.user?._id;

        if (!userId) {
          res.status(400).json({
            status: "error",
            message: "User ID is required",
          });
          return;
        }

        const kycDoc = await KycService.getKycDocument(userId);

        if (!kycDoc) {
          res.status(404).json({
            status: "success",
            message: "No KYC document found for this user",
            data: null,
          });
          return;
        }

        // Return the document with sensitive information filtered out
        const { signature, ...documentData } = kycDoc.toObject
          ? kycDoc.toObject()
          : kycDoc;

        res.status(200).json({
          status: "success",
          data: documentData,
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to fetch KYC document";
        res.status(500).json({
          status: "error",
          message: errorMessage,
        });
      }
    }
  ),

  /**
   * Re-enable KYC enrollment for a user
   * @route POST /kyc/re-enroll
   * @access Private
   */
  reEnrollKycUser: catchAsync(
    async (req: Request, res: Response): Promise<void> => {
      if (!req.user?._id) {
        res.status(401).json({
          message: "Unauthorized",
          status: "error",
        });
        return;
      }

      try {
        const data = req.body;
        console.log("data in comnytroll part ", data);
        const userId = req.user._id;
        console.log("Re-enrolling KYC for user:", userId);

        // Check if user exists
        const user = await UserService.getUserById(userId);
        if (!user) {
          res.status(404).json({
            message: "User not found",
            status: "error",
          });
          return;
        }

        // Call the service to re-enable KYC enrollment
        const result = await KycService.reEnrollKycUser(userId, data);
        console.log("result is here:", result);

        if (result.success) {
          res.status(200).json({
            message: result.message,
            status: "success",
          });
        } else {
          res.status(400).json({
            message: result.message,
            status: "error",
          });
        }
      } catch (error) {
        logger.error("Error in reEnrollKycUser:", error);
        res.status(500).json({
          message: "Internal server error while processing KYC re-enrollment",
          status: "error",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }
  ) as RequestHandler,
};

export default KycController;
