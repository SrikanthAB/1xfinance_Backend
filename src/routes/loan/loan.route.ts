import { Router, Request, Response } from "express";
import { requireDbReady } from "../../db/connection";
import { requireAuth } from "../../utils/authUser";
import LoanController from "../../controllers/loan.controller";

export class LoanRoutes {
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

    // Public routes (no auth required)
    this.router.get("/lenders", requireDbReady, LoanController.getLenders.bind(LoanController));

    // Valuation calculation routes (no auth required for demo)
    this.router.post("/calculate/gold", requireDbReady, LoanController.calculateGoldValuation.bind(LoanController));
    this.router.post("/calculate/land", requireDbReady, LoanController.calculateLandValuation.bind(LoanController));
    this.router.post("/calculate/vehicle", requireDbReady, LoanController.calculateVehicleValuation.bind(LoanController));
    this.router.post("/calculate/portfolio", requireDbReady, LoanController.calculatePortfolioValuation.bind(LoanController));

    // Find nearest branch (no auth required)
    this.router.post("/nearest-branch", requireDbReady, LoanController.findNearestBranch.bind(LoanController));

    // Protected routes (auth required)
    this.router.post("/apply", requireDbReady, requireAuth, LoanController.createLoanApplication.bind(LoanController));
    this.router.get("/my-applications", requireDbReady, requireAuth, LoanController.getUserLoanApplications.bind(LoanController));
    this.router.get("/:id", requireDbReady, requireAuth, LoanController.getLoanApplication.bind(LoanController));
    this.router.put("/:id", requireDbReady, requireAuth, LoanController.updateLoanApplication.bind(LoanController));
    this.router.post("/:id/submit", requireDbReady, requireAuth, LoanController.submitLoanApplication.bind(LoanController));
  }
}

export default LoanRoutes;