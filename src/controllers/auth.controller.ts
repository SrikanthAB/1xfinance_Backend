import { Request, Response } from "express";
import AuthService, { LoginInput, RegisterInput, UpdateUserInput, VerifyOtpInput, EmailOtpInput, ForgotPasswordInput, VerifyPasswordResetInput, ResetPasswordInput } from "../services/auth.service";

export class AuthController {
  async register(req: Request, res: Response) {
    try {
      const body = req.body as RegisterInput;
      if (!body.fullName || !body.phoneNumber || !body.email || !body.password) {
        return res.status(400).json({ success: false, message: "Missing fields" });
      }
      const result = await AuthService.register(body);
      console.log("result", result);
      return res.status(201).json({ success: true, data: result });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const body = req.body as LoginInput;
      if (!body.emailOrPhone || !body.password) {
        return res.status(400).json({ success: false, message: "Missing fields" });
      }
      const result = await AuthService.login(body);
      return res.status(200).json({ success: true, data: result });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }



  async updateUser(req: Request, res: Response) {
    try {
      const userId = (req as any).userId as string | undefined;
      const body = req.body as UpdateUserInput;
      if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      // If dob is provided as string, coerce to Date
      if (body && (body as any).dob && typeof (body as any).dob === "string") {
        const parsed = new Date((body as any).dob);
        if (!Number.isNaN(parsed.getTime())) {
          body.dob = parsed;
        }
      }

      const user = await AuthService.updateUser(userId, body);
      return res.status(200).json({ success: true, data: user });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  async me(req: Request, res: Response) {
    try {
      const userId = (req as any).userId as string | undefined;
      if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }
      const user = await AuthService.getUserById(userId);
      return res.status(200).json({ success: true, data: user });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  async verifyOtp(req: Request, res: Response) {
    try {
      const userId = (req as any).userId as string | undefined;
      if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }
      const body = req.body as VerifyOtpInput;
      if (!body || typeof body.otp !== "string") {
        return res.status(400).json({ success: false, message: "OTP required" });
      }
      const user = await AuthService.verifyKycOtp(userId, body);
      const verified = user.kycStatus === "verified";
      return res.status(200).json({ success: true, message: verified ? "verified" : "not verified", verified });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  async sendKycOtp(req: Request, res: Response) {
    try {
      const userId = (req as any).userId as string | undefined;
      if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }
      console.log("req.body", req.body.aadhaarNumber);
      const aadhar = req.body.aadhaarNumber;
      if (!aadhar) {
        return res.status(400).json({ success: false, message: "Aadhar number  required" });
      }
      const aadharLast4 = aadhar.slice(-4);
      const aadharMasked = aadharLast4.padStart(12, "X");
      const otp = aadharMasked;
      const user = await AuthService.getUserById(userId);
      if (user.kycStatus === "verified") {
        return res.status(400).json({ success: false, message: "KYC already verified" });
      }
      if (user.kycStatus === "rejected") {
        return res.status(400).json({ success: false, message: "KYC rejected" });
      }
      // Demo implementation: return static OTP. In production, integrate an SMS/Email provider.
      return res.status(200).json({ success: true, message: "OTP sent", data: { otp: "otp sent successfully" } });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  /**
   * Send email OTP for email verification
   */
  async sendEmailOTP(req: Request, res: Response) {
    try {
      const { email } = req.body;
      console.log("email", email);
      
      if (!email) {
        return res.status(400).json({ success: false, message: "Email is required" });
      }

      const result = await AuthService.sendEmailOTP(email);
      
      if (result.success) {
        return res.status(200).json({ 
          success: true, 
          message: result.message,
          ...(result.otp && { data: { otp: result.otp } }) // Include OTP in development
        });
      } else {
        return res.status(400).json({ success: false, message: result.message });
      }
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  /**
   * Verify email OTP
   */
  async verifyEmailOTP(req: Request, res: Response) {
    try {
      const { email, otp } = req.body as EmailOtpInput;
      
      if (!email || !otp) {
        return res.status(400).json({ success: false, message: "Email and OTP are required" });
      }

      const result = await AuthService.verifyEmailOTP(email, otp);
      
      if (result.success) {
        return res.status(200).json({ 
          success: true, 
          message: result.message,
          data: result.user
        });
      } else {
        return res.status(400).json({ success: false, message: result.message });
      }
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  /**
   * Resend email OTP
   */
  async resendEmailOTP(req: Request, res: Response) {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ success: false, message: "Email is required" });
      }

      const result = await AuthService.resendEmailOTP(email);
      
      if (result.success) {
        return res.status(200).json({ 
          success: true, 
          message: result.message,
          ...(result.otp && { data: { otp: result.otp } }) // Include OTP in development
        });
      } else {
        return res.status(400).json({ success: false, message: result.message });
      }
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  /**
   * Forgot password - Send password reset OTP
   */
  async forgotPassword(req: Request, res: Response) {
    try {
      const { email } = req.body as ForgotPasswordInput;
      
      if (!email) {
        return res.status(400).json({ success: false, message: "Email is required" });
      }

      const result = await AuthService.forgotPassword({ email });
      
      if (result.success) {
        return res.status(200).json({ 
          success: true, 
          message: result.message,
          ...(result.otp && { data: { otp: result.otp } }) // Include OTP in development
        });
      } else {
        return res.status(400).json({ success: false, message: result.message });
      }
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  /**
   * Verify password reset OTP
   */
  async verifyPasswordResetOTP(req: Request, res: Response) {
    try {
      const { email, otp } = req.body as VerifyPasswordResetInput;
      
      if (!email || !otp) {
        return res.status(400).json({ success: false, message: "Email and OTP are required" });
      }

      const result = await AuthService.verifyPasswordResetOTP({ email, otp });
      
      if (result.success) {
        return res.status(200).json({ 
          success: true, 
          message: result.message,
          data: { token: result.token }
        });
      } else {
        return res.status(400).json({ success: false, message: result.message });
      }
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  /**
   * Reset password with token
   */
  async resetPassword(req: Request, res: Response) {
    try {
      const { email, token, newPassword } = req.body as ResetPasswordInput;
      
      if (!email || !token || !newPassword) {
        return res.status(400).json({ success: false, message: "Email, token, and new password are required" });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ success: false, message: "Password must be at least 6 characters long" });
      }

      const result = await AuthService.resetPassword({ email, token, newPassword });
      
      if (result.success) {
        return res.status(200).json({ 
          success: true, 
          message: result.message,
          data: result.user
        });
      } else {
        return res.status(400).json({ success: false, message: result.message });
      }
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  /**
   * Resend password reset OTP
   */
  async resendPasswordResetOTP(req: Request, res: Response) {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ success: false, message: "Email is required" });
      }

      const result = await AuthService.resendPasswordResetOTP(email);
      
      if (result.success) {
        return res.status(200).json({ 
          success: true, 
          message: result.message,
          ...(result.otp && { data: { otp: result.otp } }) // Include OTP in development
        });
      } else {
        return res.status(400).json({ success: false, message: result.message });
      }
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }
}

export default new AuthController();

