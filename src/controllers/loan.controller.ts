import { Request, Response } from "express";
import LoanService, { 
  CreateLoanApplicationInput, 
  GoldLoanInput, 
  LandLoanInput, 
  VehicleLoanInput, 
  PortfolioLoanInput,
  LoanTermsInput,
  BranchSelectionInput 
} from "../services/loan.service";

export class LoanController {
  // Get available lenders
  async getLenders(req: Request, res: Response) {
    try {
      const lenders = LoanService.getAvailableLenders();
      return res.status(200).json({ success: true, data: lenders });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  // Get branches for a specific lender


  // Calculate gold loan valuation
  async calculateGoldValuation(req: Request, res: Response) {
    try {
      const { goldWeightGrams, goldPurityK, itemDescription } = req.body as GoldLoanInput;
      
      if (!goldWeightGrams || !goldPurityK) {
        return res.status(400).json({ success: false, message: "Gold weight and purity are required" });
      }

      const valuation = await LoanService.calculateGoldValuation({
        goldWeightGrams,
        goldPurityK,
        itemDescription
      });

      return res.status(200).json({ success: true, data: valuation });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  // Calculate land loan valuation
  async calculateLandValuation(req: Request, res: Response) {
    try {
      const { propertyType, propertyAddress, propertyValue } = req.body as LandLoanInput;
      
      if (!propertyType || !propertyAddress || !propertyValue) {
        return res.status(400).json({ success: false, message: "Property type, address, and value are required" });
      }

      const valuation = LoanService.calculateLandValuation({
        propertyType,
        propertyAddress,
        propertyValue
      });

      return res.status(200).json({ success: true, data: valuation });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  // Calculate vehicle loan valuation
  async calculateVehicleValuation(req: Request, res: Response) {
    try {
      const { vehicleType, vehicleMake, vehicleModel, vehicleYear, vehicleValue } = req.body as VehicleLoanInput;
      
      if (!vehicleType || !vehicleMake || !vehicleModel || !vehicleYear || !vehicleValue) {
        return res.status(400).json({ success: false, message: "All vehicle details are required" });
      }

      const valuation = LoanService.calculateVehicleValuation({
        vehicleType,
        vehicleMake,
        vehicleModel,
        vehicleYear,
        vehicleValue
      });

      return res.status(200).json({ success: true, data: valuation });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  // Calculate portfolio loan valuation
  async calculatePortfolioValuation(req: Request, res: Response) {
    try {
      const { portfolioValue, portfolioType } = req.body as PortfolioLoanInput;
      
      if (!portfolioValue || !portfolioType) {
        return res.status(400).json({ success: false, message: "Portfolio value and type are required" });
      }

      const valuation = LoanService.calculatePortfolioValuation({
        portfolioValue,
        portfolioType
      });

      return res.status(200).json({ success: true, data: valuation });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  // Create loan application
  async createLoanApplication(req: Request, res: Response) {
    try {
      const userId = (req as any).userId as string;
      if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const { loanType, assetDetails, valuation, loanTerms, branchSelection } = req.body as CreateLoanApplicationInput;
      
      if (!loanType || !assetDetails || !valuation || !loanTerms) {
        return res.status(400).json({ success: false, message: "Loan type, asset details, valuation, and loan terms are required" });
      }

      // Validate valuation data
      if (!valuation.marketValue || !valuation.maxLoanAmount || !valuation.ltvRatio) {
        return res.status(400).json({ success: false, message: "Market value, max loan amount, and LTV ratio are required in valuation" });
      }

      const loanApplication = await LoanService.createLoanApplication(userId, {
        loanType,
        assetDetails,
        valuation,
        loanTerms,
        branchSelection
      });

      return res.status(201).json({ success: true, data: loanApplication });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  // Get user's loan applications
  async getUserLoanApplications(req: Request, res: Response) {
    try {
      const userId = (req as any).userId as string;
      if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const loanApplications = await LoanService.getUserLoanApplications(userId);
      return res.status(200).json({ success: true, data: loanApplications });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  // Get specific loan application
  async getLoanApplication(req: Request, res: Response) {
    try {
      const userId = (req as any).userId as string;
      if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ success: false, message: "Loan application ID is required" });
      }

      const loanApplication = await LoanService.getLoanApplicationById(id, userId);
      return res.status(200).json({ success: true, data: loanApplication });
    } catch (err: any) {
      return res.status(404).json({ success: false, message: err.message });
    }
  }

  // Update loan application
  async updateLoanApplication(req: Request, res: Response) {
    try {
      const userId = (req as any).userId as string;
      if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ success: false, message: "Loan application ID is required" });
      }

      const updates = req.body;
      const loanApplication = await LoanService.updateLoanApplication(id, userId, updates);
      return res.status(200).json({ success: true, data: loanApplication });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  // Submit loan application
  async submitLoanApplication(req: Request, res: Response) {
    try {
      const userId = (req as any).userId as string;
      if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ success: false, message: "Loan application ID is required" });
      }

      const loanApplication = await LoanService.submitLoanApplication(id, userId);
      return res.status(200).json({ success: true, data: loanApplication, message: "Loan application submitted successfully" });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  // Find nearest branch using Google Places API
  async findNearestBranch(req: Request, res: Response) {
    try {
      const { lat, lng, bankName } = req.body;
      console.log("lat", lat);
      console.log("lng", lng);
      console.log("bankName", bankName);
      
      if (!lat || !lng || !bankName) {
        return res.status(400).json({ 
          success: false, 
          message: "Latitude, longitude, and bank name are required" 
        });
      }

      if (typeof lat !== 'number' || typeof lng !== 'number') {
        return res.status(400).json({ 
          success: false, 
          message: "Latitude and longitude must be numbers" 
        });
      }

      const result = await LoanService.findNearestBranch(lat, lng, bankName);
      return res.status(200).json({ success: true, data: result });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }
}

export default new LoanController();