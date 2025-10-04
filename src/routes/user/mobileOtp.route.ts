
import { Router } from 'express';
import { validateRequest } from '../../middleware/validateRequest';
import MobileOTPCController from '../../controllers/user/mobileOtp.controller';
import authenticateUser from '../../middleware/auth.middleware';

export class MobileOTPRoute {
  router: Router;
  public mobileOTPController = MobileOTPCController;

  constructor() {
    this.router = Router();
    this.routes();
  }
  routes() {
    this.router.post('/send-otp',authenticateUser,this.mobileOTPController.sendMobileOTP);
    this.router.post('/verify-otp',authenticateUser,this.mobileOTPController.verifyMobileOTP);
  }
}