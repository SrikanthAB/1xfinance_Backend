import emailOtpController from '../../controllers/user/emailOtp.controller';  
import authenticateUser from '../../middleware/auth.middleware';
import { Router } from "express";

export class EmailOTPRoute {
  router: Router;
  public emailOTPController = emailOtpController;

  constructor() {
    this.router = Router();
    this.routes();
  }
  routes() {
    this.router.post('/send-otp',authenticateUser,this.emailOTPController.generateAndSendOTP);
    this.router.post('/verify-otp',authenticateUser,this.emailOTPController.verifyOTP);
  }
}