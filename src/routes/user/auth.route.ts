import { Router, Request, Response } from "express";
import { requireDbReady } from "../../db/connection";
import AuthController from "../../controllers/auth.controller";
import { requireAuth } from "../../utils/authUser";

export class UserRoutes {
  public router: Router;

  constructor() {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // Health for auth namespace
    this.router.get("/health", (_req: Request, res: Response) => {
      res.status(200).json({ success: true, message: "Auth routes healthy" });
    });

    // Example login endpoint (placeholder)
    this.router.post("/login", requireDbReady, AuthController.login.bind(AuthController));

    // Example register endpoint (placeholder)
    this.router.post("/register", requireDbReady, AuthController.register.bind(AuthController));

    // Get user by id (includes KYC fields; Aadhaar masked)

    // Update user by id (stores Aadhaar last 4 only)
    this.router.put("/update", requireDbReady, requireAuth, AuthController.updateUser.bind(AuthController));

    // Current authenticated user (derived from token)
    this.router.get("/user", requireDbReady, requireAuth, AuthController.me.bind(AuthController));

    // Verify KYC OTP (JWT required)
    this.router.post("/kyc/verify-otp", requireDbReady, requireAuth, AuthController.verifyOtp.bind(AuthController));

    // Send KYC OTP (demo: returns fixed OTP)
    this.router.post("/kyc/send-otp", requireDbReady, requireAuth, AuthController.sendKycOtp.bind(AuthController));

    
    // Email OTP routes
    this.router.post("/email/send-otp", requireDbReady, AuthController.sendEmailOTP.bind(AuthController));
    this.router.post("/email/verify-otp", requireDbReady, AuthController.verifyEmailOTP.bind(AuthController));
    this.router.post("/email/resend-otp", requireDbReady, AuthController.resendEmailOTP.bind(AuthController));

    // Password reset routes
    this.router.post("/forgot-password", requireDbReady, AuthController.forgotPassword.bind(AuthController));
    this.router.post("/verify-password-reset-otp", requireDbReady, AuthController.verifyPasswordResetOTP.bind(AuthController));
    this.router.post("/reset-password", requireDbReady, AuthController.resetPassword.bind(AuthController));
    this.router.post("/resend-password-reset-otp", requireDbReady, AuthController.resendPasswordResetOTP.bind(AuthController));
  }
}

export default UserRoutes;

