import nodemailer from 'nodemailer';
import crypto from 'crypto';

export interface EmailOtpData {
  email: string;
  otp: string;
  expiresAt: Date;
  attempts: number;
}

export interface PasswordResetData {
  email: string;
  token: string;
  otp: string;
  expiresAt: Date;
  attempts: number;
}

class EmailService {
  private transporter: nodemailer.Transporter;
  private otpStorage: Map<string, EmailOtpData> = new Map();
  private passwordResetStorage: Map<string, PasswordResetData> = new Map();

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER || "srikanthkarkampally01@gmail.com",
        pass: process.env.SMTP_PASS || "ohldrukgpkapnnsh",
      },
    });
  }

  /**
   * Generate a 6-digit OTP
   */
  private generateOTP(): string {
    return crypto.randomInt(100000, 999999).toString();
  }

  /**
   * Send OTP to email
   */
  async sendOTP(email: string): Promise<{ success: boolean; message: string; otp?: string }> {
    try {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return { success: false, message: 'Invalid email format' };
      }

      // Check if there's already a valid OTP for this email
      const existingOtp = this.otpStorage.get(email);
    //   if (existingOtp && existingOtp.expiresAt > new Date()) {
    //     return { success: false, message: 'OTP already sent. Please wait before requesting a new one.' };
    //   }

      // Generate new OTP
      const otp = this.generateOTP();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

      // Store OTP data
      this.otpStorage.set(email, {
        email,
        otp,
        expiresAt,
        attempts: 0
      });

      // Email content
      const mailOptions = {
        from: process.env.SMTP_FROM|| "srikanthkarkampally01@gmail.com" || process.env.SMTP_USER || "srikanthkarkampally01@gmail.com",
        to: email,
        subject: 'Email Verification OTP - 1X Finance',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">1X Finance</h1>
              <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Email Verification</p>
            </div>
            
            <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
              <h2 style="color: #333; margin: 0 0 20px 0;">Verify Your Email Address</h2>
              
              <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Thank you for registering with 1X Finance. To complete your email verification, please use the following One-Time Password (OTP):
              </p>
              
              <div style="background: white; border: 2px dashed #667eea; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
                <span style="font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px; font-family: 'Courier New', monospace;">${otp}</span>
              </div>
              
              <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 20px 0;">
                <strong>Important:</strong>
                <br>• This OTP is valid for 10 minutes only
                <br>• Do not share this OTP with anyone
                <br>• If you didn't request this verification, please ignore this email
              </p>
              
              <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px;">
                <p style="color: #999; font-size: 12px; margin: 0;">
                  This is an automated message from 1X Finance. Please do not reply to this email.
                </p>
              </div>
            </div>
          </div>
        `,
        text: `
          1X Finance - Email Verification
          
          Your OTP for email verification is: ${otp}
          
          This OTP is valid for 10 minutes only.
          Do not share this OTP with anyone.
          
          If you didn't request this verification, please ignore this email.
          
          Best regards,
          1X Finance Team
        `
      };

      // Send email
      await this.transporter.sendMail(mailOptions);

      // In development, also return the OTP for testing
      const isDevelopment = process.env.NODE_ENV === 'development';
      
      return {
        success: true,
        message: 'OTP sent successfully to your email',
        ...(isDevelopment && { otp })
      };

    } catch (error: any) {
      console.error('Email sending error:', error);
      return {
        success: false,
        message: 'Failed to send OTP. Please try again later.'
      };
    }
  }

  /**
   * Verify OTP
   */
  async verifyOTP(email: string, inputOtp: string): Promise<{ success: boolean; message: string }> {
    try {
      const otpData = this.otpStorage.get(email);
       
      if (!otpData) {
        return { success: false, message: 'No OTP found for this email. Please request a new OTP.' };
      }

      // Check if OTP has expired
      if (otpData.expiresAt < new Date()) {
        this.otpStorage.delete(email);
        return { success: false, message: 'OTP has expired. Please request a new one.' };
      }

      // Check attempt limit
      if (otpData.attempts >= 3) {
        this.otpStorage.delete(email);
        return { success: false, message: 'Too many failed attempts. Please request a new OTP.' };
      }

      // Verify OTP
      if (otpData.otp !== inputOtp.trim()) {
        otpData.attempts += 1;
        this.otpStorage.set(email, otpData);
        
        const remainingAttempts = 3 - otpData.attempts;
        return {
          success: false,
          message: `Invalid OTP. ${remainingAttempts > 0 ? `${remainingAttempts} attempts remaining.` : 'Please request a new OTP.'}`
        };
      }

      // OTP is valid, remove it from storage
      this.otpStorage.delete(email);
      
      return { success: true, message: 'Email verified successfully!' };

    } catch (error: any) {
      console.error('OTP verification error:', error);
      return {
        success: false,
        message: 'Failed to verify OTP. Please try again.'
      };
    }
  }

  /**
   * Clean up expired OTPs (call this periodically)
   */
  cleanupExpiredOTPs(): void {
    const now = new Date();
    for (const [email, otpData] of this.otpStorage.entries()) {
      if (otpData.expiresAt < now) {
        this.otpStorage.delete(email);
      }
    }
  }

  /**
   * Get OTP status for an email (for debugging)
   */
  getOTPStatus(email: string): { exists: boolean; expiresAt?: Date; attempts?: number } {
    const otpData = this.otpStorage.get(email);
    if (!otpData) {
      return { exists: false };
    }
    return {
      exists: true,
      expiresAt: otpData.expiresAt,
      attempts: otpData.attempts
    };
  }

  /**
   * Generate a secure password reset token
   */
  private generatePasswordResetToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Send password reset OTP to email
   */
  async sendPasswordResetOTP(email: string): Promise<{ success: boolean; message: string; otp?: string }> {
    try {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return { success: false, message: 'Invalid email format' };
      }

      // Check if there's already a valid password reset OTP for this email
      const existingReset = this.passwordResetStorage.get(email);
      if (existingReset && existingReset.expiresAt > new Date()) {
        return { success: false, message: 'Password reset OTP already sent. Please wait before requesting a new one.' };
      }

      // Generate new OTP
      const otp = this.generateOTP();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now

      // Store password reset data
      this.passwordResetStorage.set(email, {
        email,
        token: this.generatePasswordResetToken(),
        otp: otp, // Store the actual OTP that was sent
        expiresAt,
        attempts: 0
      });

      // Email content
      const mailOptions = {
        from: process.env.SMTP_FROM|| "srikanthkarkampally01@gmail.com" || process.env.SMTP_USER || "srikanthkarkampally01@gmail.com",
        to: email,
        subject: 'Password Reset OTP - 1X Finance',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">1X Finance</h1>
              <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Password Reset</p>
            </div>
            
            <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
              <h2 style="color: #333; margin: 0 0 20px 0;">Reset Your Password</h2>
              
              <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                We received a request to reset your password for your 1X Finance account. Use the following One-Time Password (OTP) to reset your password:
              </p>
              
              <div style="background: white; border: 2px dashed #e74c3c; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
                <span style="font-size: 32px; font-weight: bold; color: #e74c3c; letter-spacing: 5px; font-family: 'Courier New', monospace;">${otp}</span>
              </div>
              
              <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 20px 0;">
                <strong>Important:</strong>
                <br>• This OTP is valid for 15 minutes only
                <br>• Do not share this OTP with anyone
                <br>• If you didn't request this password reset, please ignore this email
                <br>• Your account remains secure if you don't take any action
              </p>
              
              <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p style="color: #856404; font-size: 14px; margin: 0;">
                  <strong>Security Notice:</strong> If you didn't request this password reset, please contact our support team immediately.
                </p>
              </div>
              
              <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px;">
                <p style="color: #999; font-size: 12px; margin: 0;">
                  This is an automated message from 1X Finance. Please do not reply to this email.
                </p>
              </div>
            </div>
          </div>
        `,
        text: `
          1X Finance - Password Reset
          
          Your OTP for password reset is: ${otp}
          
          This OTP is valid for 15 minutes only.
          Do not share this OTP with anyone.
          
          If you didn't request this password reset, please ignore this email.
          Your account remains secure if you don't take any action.
          
          Best regards,
          1X Finance Team
        `
      };

      // Send email
      await this.transporter.sendMail(mailOptions);

      // In development, also return the OTP for testing
      const isDevelopment = process.env.NODE_ENV === 'development';
      
      return {
        success: true,
        message: 'Password reset OTP sent successfully to your email',
        ...(isDevelopment && { otp })
      };

    } catch (error: any) {
      console.error('Password reset email sending error:', error);
      return {
        success: false,
        message: 'Failed to send password reset OTP. Please try again later.'
      };
    }
  }

  /**
   * Verify password reset OTP
   */
  async verifyPasswordResetOTP(email: string, inputOtp: string): Promise<{ success: boolean; message: string; token?: string }> {
    try {
      const resetData = this.passwordResetStorage.get(email);
      
      if (!resetData) {
        return { success: false, message: 'No password reset request found for this email. Please request a new password reset.' };
      }

      // Check if OTP has expired
      if (resetData.expiresAt < new Date()) {
        this.passwordResetStorage.delete(email);
        return { success: false, message: 'Password reset OTP has expired. Please request a new one.' };
      }

      // Check attempt limit
      if (resetData.attempts >= 3) {
        this.passwordResetStorage.delete(email);
        return { success: false, message: 'Too many failed attempts. Please request a new password reset OTP.' };
      }

      // Verify OTP
      if (resetData.otp !== inputOtp.trim()) {
        resetData.attempts += 1;
        this.passwordResetStorage.set(email, resetData);
        
        const remainingAttempts = 3 - resetData.attempts;
        return {
          success: false,
          message: `Invalid OTP. ${remainingAttempts > 0 ? `${remainingAttempts} attempts remaining.` : 'Please request a new password reset OTP.'}`
        };
      }

      // OTP is valid, return the reset token
      const resetToken = resetData.token;
      this.passwordResetStorage.delete(email);
      
      return { 
        success: true, 
        message: 'OTP verified successfully! You can now reset your password.',
        token: resetToken
      };

    } catch (error: any) {
      console.error('Password reset OTP verification error:', error);
      return {
        success: false,
        message: 'Failed to verify password reset OTP. Please try again.'
      };
    }
  }

  /**
   * Clean up expired password reset data (call this periodically)
   */
  cleanupExpiredPasswordResets(): void {
    const now = new Date();
    for (const [email, resetData] of this.passwordResetStorage.entries()) {
      if (resetData.expiresAt < now) {
        this.passwordResetStorage.delete(email);
      }
    }
  }

  /**
   * Get password reset status for an email (for debugging)
   */
  getPasswordResetStatus(email: string): { exists: boolean; expiresAt?: Date; attempts?: number } {
    const resetData = this.passwordResetStorage.get(email);
    if (!resetData) {
      return { exists: false };
    }
    return {
      exists: true,
      expiresAt: resetData.expiresAt,
      attempts: resetData.attempts
    };
  }
}

export default new EmailService();
