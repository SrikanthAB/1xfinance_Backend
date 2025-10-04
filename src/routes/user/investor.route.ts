import { Router } from "express";
import InvestorController from "../../controllers/user/investor.controller";
import authenticateUser from "../../middleware/auth.middleware";
import { validateRequest } from "../../middleware/validateRequest";
import {
  updateUserSchema,
  getInvestorListOfAssetQuery,
  assetInvestorsQuerySchema,
} from "../../validations/user/user.validation";

export class InvestorRoutes {
  router: Router;
  public investorController = InvestorController;

  constructor() {
    this.router = Router();
    this.routes();
  }
  routes() {
    this.router.get(
      "/", 
      authenticateUser, 
      this.investorController.getUser
    );

    this.router.get(
      "/my-profile",
      authenticateUser,
      this.investorController.getInvestorDetailsWithWallet
    );

    this.router.get(
      "/asset-investors",
      validateRequest(assetInvestorsQuerySchema, { target: "query" }),
      this.investorController.getInvestorListing
    );

    this.router.put(
      "/",
      authenticateUser,
      validateRequest(updateUserSchema),
      this.investorController.updateUser
    );

    this.router.delete(
      "/",
      authenticateUser,
      this.investorController.deleteUser
    );
    
    this.router.get(
      "/list",
      this.investorController.getInvestors
    );
  }
}
