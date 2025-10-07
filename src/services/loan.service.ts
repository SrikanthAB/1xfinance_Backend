import { LoanApplication, ILoanApplication } from "../models/loan.model";
import { SchedulerService } from "./scheduler.service";

export interface GoldLoanInput {
  goldWeightGrams: number;
  goldPurityK: "18K" | "22K" | "24K";
  itemDescription?: string;
}

export interface LandLoanInput {
  propertyType: "residential" | "commercial" | "agricultural";
  propertyAddress: string;
  propertyValue: number;
}

export interface VehicleLoanInput {
  vehicleType: "car" | "bike" | "commercial";
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: number;
  vehicleValue: number;
}

export interface PortfolioLoanInput {
  portfolioValue: number;
  portfolioType: "mutual_funds" | "stocks";
}

export interface LoanTermsInput {
  requestedLoanAmount: number;
  loanTermMonths: number;
  selectedLender: string;
  interestRate: number;
}

export interface BranchSelectionInput {
  selectedBranchId: string;
  selectedBranchName: string;
  selectedBranchAddress: string;
  selectedBranchPhone: string;
  selectedBranchDistance: number;
}

export interface CreateLoanApplicationInput {
  loanType: "gold" | "land" | "mutual_funds" | "stocks" | "vehicles";
  assetDetails: GoldLoanInput | LandLoanInput | VehicleLoanInput | PortfolioLoanInput;
  valuation: {
    marketValue: number;
    maxLoanAmount: number;
    ltvRatio: number;
    ratePerGram?: number; // For gold loans
  };
  loanTerms?: LoanTermsInput;
  branchSelection?: BranchSelectionInput;
}

// Gold purity multipliers
const GOLD_PURITY_MULTIPLIERS = {
  "18K": 0.75,  // 18/24 = 0.75
  "22K": 0.916, // 22/24 = 0.916
  "24K": 1.0,   // 24/24 = 1.0
};

// LTV ratios by loan type
const LTV_RATIOS = {
  gold: 80,
  land: 70,
  vehicles: 75,
  mutual_funds: 60,
  stocks: 50,
};

// Available lenders with their rates
export const AVAILABLE_LENDERS = [
  { name: "Bajaj Finance", interestRate: 11.8, maxLoan: 1000000 },
  { name: "Tata Capital", interestRate: 12.5, maxLoan: 1500000 },
  { name: "HDFC Bank", interestRate: 13.0, maxLoan: 2000000 },
  { name: "Axis Bank", interestRate: 12.8, maxLoan: 1200000 },
];

// Mock branch data (fallback)
export const MOCK_BRANCHES = [
  {
    id: "bajaj_mumbai_1",
    name: "Mumbai Branch",
    address: "Andheri East Branch, Plot No. 4, MIDC Central Road",
    phone: "+91-22-6796-7000",
    distance: 2.3,
    lender: "Bajaj Finance"
  },
  {
    id: "bajaj_delhi_1", 
    name: "Delhi Branch",
    address: "Connaught Place, Block A, New Delhi",
    phone: "+91-11-2345-6789",
    distance: 1.8,
    lender: "Bajaj Finance"
  }
];

// Google Places API configuration
const GOOGLE_PLACES_API_KEY = "AIzaSyDGAaY8lPoOH5jcp6IN2Kut2G7GOpNmaY4";
const GOOGLE_PLACES_BASE_URL = "https://maps.googleapis.com/maps/api/place/nearbysearch/json";

export class LoanService {
  // Get gold rate from database (fetched daily by scheduler)
  static async fetchGoldRate(): Promise<number> {
    console.log("fetching gold rate from database");
    try {
      const latestRate = await SchedulerService.getLatestGoldRate();
      
      if (!latestRate) {
        console.log("No gold rate found in database, falling back to API");
        // Fallback to API if no rate in database
        return await this.fetchGoldRateFromAPI();
      }
      
      console.log("Using stored gold rate:", latestRate.ratePerGram24K);
      return latestRate.ratePerGram24K;
    } catch (error) {
      console.error('Failed to fetch gold rate from database:', error);
      // Fallback to API if database fails
      return await this.fetchGoldRateFromAPI();
    }
  }

  // Fallback method to fetch gold rate from API (used when database is empty)
  private static async fetchGoldRateFromAPI(): Promise<number> {
    console.log("fetching gold rate from API as fallback");
    try {
      const response = await fetch(
        'https://api.metalpriceapi.com/v1/latest?api_key=7fb7df5917d9397377f6942be8d9da21&base=INR&currencies=XAU'
      );
      console.log("response", response);
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("data", data);
      
      // The API returns XAU as the rate per ounce in the base currency (INR)
      // But the value seems to be inverted, so we need to use INRXAU instead
      const goldRatePerOunce = data.rates.INRXAU || (1 / data.rates.XAU);
      console.log("goldRatePerOunce", goldRatePerOunce);
      
      // Convert from per ounce to per gram (1 ounce = 31.1035 grams)
      const goldRatePerGram = goldRatePerOunce / 31.1035;
      console.log("goldRatePerGram", goldRatePerGram);
      
      return goldRatePerGram;
    } catch (error) {
      console.error('Failed to fetch gold rate from API:', error);
      // Final fallback to static rate
      return 4815; // 18K rate as fallback
    }
  }

  // Calculate gold loan valuation with dynamic rates
  static async calculateGoldValuation(input: GoldLoanInput) {
    const goldRatePerGram24K = await this.fetchGoldRate();
    const purityMultiplier = GOLD_PURITY_MULTIPLIERS[input.goldPurityK];
    const ratePerGram = goldRatePerGram24K * purityMultiplier;
    const marketValue = input.goldWeightGrams * ratePerGram;
    const ltvRatio = LTV_RATIOS.gold;
    const maxLoanAmount = Math.floor((marketValue * ltvRatio) / 100);
    
    return {
      marketValue: Math.round(marketValue),
      maxLoanAmount,
      ltvRatio,
      ratePerGram: Math.round(ratePerGram),
    };
  }

  // Calculate land loan valuation
  static calculateLandValuation(input: LandLoanInput) {
    const marketValue = input.propertyValue;
    const ltvRatio = LTV_RATIOS.land;
    const maxLoanAmount = Math.floor((marketValue * ltvRatio) / 100);
    
    return {
      marketValue,
      maxLoanAmount,
      ltvRatio,
    };
  }

  // Calculate vehicle loan valuation
  static calculateVehicleValuation(input: VehicleLoanInput) {
    const marketValue = input.vehicleValue;
    const ltvRatio = LTV_RATIOS.vehicles;
    const maxLoanAmount = Math.floor((marketValue * ltvRatio) / 100);
    
    return {
      marketValue,
      maxLoanAmount,
      ltvRatio,
    };
  }

  // Calculate portfolio loan valuation
  static calculatePortfolioValuation(input: PortfolioLoanInput) {
    const marketValue = input.portfolioValue;
    const ltvRatio = LTV_RATIOS[input.portfolioType];
    const maxLoanAmount = Math.floor((marketValue * ltvRatio) / 100);
    
    return {
      marketValue,
      maxLoanAmount,
      ltvRatio,
    };
  }

  // Create loan application
  static async createLoanApplication(userId: string, input: CreateLoanApplicationInput): Promise<ILoanApplication> {
    // Validate requested loan amount doesn't exceed maximum
    if (input.loanTerms?.requestedLoanAmount && input.loanTerms?.requestedLoanAmount > input.valuation.maxLoanAmount) {
      throw new Error(`Requested loan amount cannot exceed maximum available: ₹${input.valuation.maxLoanAmount}`);
    }

    // Validate lender exists
    const lender = AVAILABLE_LENDERS.find(l => l.name === input.loanTerms?.selectedLender);
    if (!lender) {
      throw new Error("Invalid lender selected");
    }

    // Validate loan amount against lender's maximum
    if (input.loanTerms?.requestedLoanAmount && input.loanTerms?.requestedLoanAmount > lender.maxLoan) {
      throw new Error(`Requested loan amount exceeds lender's maximum: ₹${lender.maxLoan}`);
    }

    const loanData: any = {
      userId,
      loanType: input.loanType,
      marketValue: input.valuation.marketValue,
      maxLoanAmount: input.valuation.maxLoanAmount,
      ltvRatio: input.valuation.ltvRatio,
      requestedLoanAmount: input.loanTerms?.requestedLoanAmount,
      loanTermMonths: input.loanTerms?.loanTermMonths,
      selectedLender: input.loanTerms?.selectedLender,
      interestRate: input.loanTerms?.interestRate,
      status: "draft",
    };

    // Add asset-specific fields
    switch (input.loanType) {
      case "gold":
        const goldInput = input.assetDetails as GoldLoanInput;
        loanData.goldWeightGrams = goldInput.goldWeightGrams;
        loanData.goldPurityK = goldInput.goldPurityK;
        loanData.itemDescription = goldInput.itemDescription;
        loanData.ratePerGram = input.valuation.ratePerGram;
        break;
      case "land":
        const landInput = input.assetDetails as LandLoanInput;
        loanData.propertyType = landInput.propertyType;
        loanData.propertyAddress = landInput.propertyAddress;
        loanData.propertyValue = landInput.propertyValue;
        break;
      case "vehicles":
        const vehicleInput = input.assetDetails as VehicleLoanInput;
        loanData.vehicleType = vehicleInput.vehicleType;
        loanData.vehicleMake = vehicleInput.vehicleMake;
        loanData.vehicleModel = vehicleInput.vehicleModel;
        loanData.vehicleYear = vehicleInput.vehicleYear;
        loanData.vehicleValue = vehicleInput.vehicleValue;
        break;
      case "mutual_funds":
      case "stocks":
        const portfolioInput = input.assetDetails as PortfolioLoanInput;
        loanData.portfolioValue = portfolioInput.portfolioValue;
        loanData.portfolioType = portfolioInput.portfolioType;
        break;
    }

    // Add branch selection if provided
    if (input.branchSelection) {
      loanData.selectedBranchId = input.branchSelection.selectedBranchId;
      loanData.selectedBranchName = input.branchSelection.selectedBranchName;
      loanData.selectedBranchAddress = input.branchSelection.selectedBranchAddress;
      loanData.selectedBranchPhone = input.branchSelection.selectedBranchPhone;
      loanData.selectedBranchDistance = input.branchSelection.selectedBranchDistance;
    }

    const loanApplication = await LoanApplication.create(loanData);
    return loanApplication;
  }

  // Get user's loan applications
  static async getUserLoanApplications(userId: string): Promise<ILoanApplication[]> {
    return await LoanApplication.find({ userId }).sort({ createdAt: -1 });
  }

  // Get loan application by ID
  static async getLoanApplicationById(id: string, userId: string): Promise<ILoanApplication> {
    const loan = await LoanApplication.findOne({ _id: id, userId });
    if (!loan) {
      throw new Error("Loan application not found");
    }
    return loan;
  }

  // Update loan application
  static async updateLoanApplication(id: string, userId: string, updates: Partial<ILoanApplication>): Promise<ILoanApplication> {
    const loan = await LoanApplication.findOneAndUpdate(
      { _id: id, userId },
      { ...updates, updatedAt: new Date() },
      { new: true }
    );
    if (!loan) {
      throw new Error("Loan application not found");
    }
    return loan;
  }

  // Submit loan application
  static async submitLoanApplication(id: string, userId: string): Promise<ILoanApplication> {
    const loan = await LoanApplication.findOneAndUpdate(
      { _id: id, userId, status: "draft" },
      { 
        status: "submitted", 
        submittedAt: new Date(),
        updatedAt: new Date()
      },
      { new: true }
    );
    if (!loan) {
      throw new Error("Loan application not found or already submitted");
    }
    return loan;
  }

  // Get available lenders
  static getAvailableLenders() {
    return AVAILABLE_LENDERS;
  }

  // Get branches for a lender
  static getBranchesForLender(lenderName: string) {
    return MOCK_BRANCHES.filter(branch => branch.lender === lenderName);
  }

  // Find nearest branch using Google Places API
  static async findNearestBranch(lat: number, lng: number, bankName: string) {
    try {
      const params = new URLSearchParams({
        location: `${lat},${lng}`,
        radius: '150000', // 1km radius (increased)
        type: 'bank',
        keyword: bankName,
        key: GOOGLE_PLACES_API_KEY
      });
    console.log("params", params);
      const response = await fetch(`${GOOGLE_PLACES_BASE_URL}?${params}`);
      console.log("response", response);
      if (!response.ok) {
        throw new Error(`Google Places API request failed: ${response.status}`);
      }

      const data = await response.json();
      console.log("Google Places API response:", data);
      
      if (data.status !== 'OK' || !data.results || data.results.length === 0) {
        console.log("No results found, status:", data.status, "error_message:", data.error_message);
        // Fallback to mock data if no results found
        const mockBranch = MOCK_BRANCHES.find(branch => 
          branch.lender.toLowerCase().includes(bankName.toLowerCase())
        );
        
        if (mockBranch) {
          return {
            branch: {
              id: mockBranch.id,
              name: mockBranch.name,
              address: mockBranch.address,
              phone: mockBranch.phone,
              placeId: null
            },
            distanceKm: mockBranch.distance,
            mapsLink: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mockBranch.address)}`,
            source: 'mock'
          };
        }
        
        throw new Error('No branches found for the specified bank');
      }

      const nearestBranch = data.results[0];
      const placeId = nearestBranch.place_id;
      
      // Calculate distance (approximate)
      const distanceKm = this.calculateDistance(lat, lng, nearestBranch.geometry.location.lat, nearestBranch.geometry.location.lng);
      
      return {
        branch: {
          id: placeId,
          name: nearestBranch.name,
          address: nearestBranch.vicinity || nearestBranch.formatted_address,
          phone: nearestBranch.formatted_phone_number || 'Phone not available',
          placeId: placeId
        },
        distanceKm: Math.round(distanceKm * 10) / 10, // Round to 1 decimal
        mapsLink: `https://www.google.com/maps/search/?api=1&query=${placeId}`,
        source: 'google_places'
      };
    } catch (error) {
      console.error('Error finding nearest branch:', error);
      
      // Fallback to mock data on error
      const mockBranch = MOCK_BRANCHES.find(branch => 
        branch.lender.toLowerCase().includes(bankName.toLowerCase())
      );
      
      if (mockBranch) {
        return {
          branch: {
            id: mockBranch.id,
            name: mockBranch.name,
            address: mockBranch.address,
            phone: mockBranch.phone,
            placeId: null
          },
          distanceKm: mockBranch.distance,
          mapsLink: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mockBranch.address)}`,
          source: 'mock_fallback'
        };
      }
      
      throw new Error('Failed to find nearest branch');
    }
  }

  // Calculate distance between two coordinates (Haversine formula)
  private static calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.deg2rad(lat2 - lat1);
    const dLng = this.deg2rad(lng2 - lng1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private static deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }
}

export default LoanService;