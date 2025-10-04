import { Router } from "express";
import { validateRequest } from "../../middleware/validateRequest";
import { updateUserAccountSchema } from "../../validations/user/auth.validation";
import { walletAddressSchema } from "../../validations/user/user.validation";
import UserController from "../../controllers/user/user.controller";
import authenticateUser from "../../middleware/auth.middleware";

export class UserRoutes {
  router: Router;
  public userController = UserController;

  constructor() {
    this.router = Router();
    this.routes();
  }
  routes() {
    this.router.post("/login", this.userController.login);
    this.router.post("/register", this.userController.register);
    this.router.post(
      "/verify-otp/:userId",
      this.userController.verifyMobileOTP
    );
    
  
    this.router.put(
      "/update-account",
      authenticateUser,
      this.userController.updateUserDetails
    );
    this.router.post("/forgot-password", this.userController.forgotPassword);
    this.router.get("", authenticateUser, this.userController.getUserDetails);
    this.router.post("/refresh-token", this.userController.refreshAccessToken);
    this.router.post(
      "/update-wallet-address",
      authenticateUser,
      validateRequest(walletAddressSchema),
      this.userController.updateWalletAddress
    );
  }
}
