





import { Router, Request, Response } from "express";
import { requireDbReady } from "../../db/connection";
import { requireAuth } from "../../utils/authUser";
import { BusinessController } from "../../controllers/business.controller";

export class BusinessRoutes {
  public router: Router;

  constructor() {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // Health check for loan routes
    this.router.get("/health", (_req: Request, res: Response) => {
      res.status(200).json({ success: true, message: "Loan routes healthy" });
    });

  
    this.router.post("/wishlist", BusinessController.addToWishlist.bind(BusinessController));
    // Public routes (no auth required)
    // this.router.get("/businesses", requireDbReady, BusinessController.getBusinesses.bind(BusinessController));
  }
}

export default BusinessRoutes;