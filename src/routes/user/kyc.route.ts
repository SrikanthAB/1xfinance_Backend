import { Router } from "express";
import authenticateUser from "../../middleware/auth.middleware";
import KycController from "../../controllers/user/kyc.controller";
import { upload } from "../../config/multer"; // Assuming you have a multer config for file uploads

export class KycRoutes {
  router: Router;
  public kycController = KycController;

  constructor() {
    this.router = Router();
    this.routes();
  }
  routes() {
    // Generate KYC token for the authenticated user
    this.router.post(
      "/generate-token",
      authenticateUser,
      this.kycController.generateToken
    );

    // Webhook endpoint for SmileID to post KYC status updates
    this.router.post(
      "/store-kyc-status",
      this.kycController.storeKycStatus
    );

    // Get KYC status for the authenticated user
    this.router.get(
      "/get-kyc-status",
      authenticateUser,
      this.kycController.getKycStatus
    );




    // Generate signature for SmileID API requests
    this.router.post(
      "/signature",
      authenticateUser,
      this.kycController.generateSignatureForSMILEID
    );

    this.router.get(
      "/document/:userId",
      this.kycController.getKycDocument
   );

   this.router.get(
      "/document",
      this.kycController.getKycDocument
   );

    // Confirming an incoming signature
    this.router.post(
      "/confirm-signature",
      authenticateUser,
      this.kycController.confirmSignature
    );
 

    // Re-enable KYC enrollment for a user
    this.router.post(
      "/re-enroll",
      authenticateUser,
      this.kycController.reEnrollKycUser
    );
  }
}
