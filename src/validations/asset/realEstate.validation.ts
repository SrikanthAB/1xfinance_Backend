import { z } from "zod";
import {
  AssetClass,
  AssetCategory,
  AssetStyle,
  AssetStage,
  InstrumentType,
  LockInPeriodType,
  AssetStatus,
} from "../../interfaces/asset/asset.types";

// Basic details validation schema
export const CreateBasicDetailsValidation = z
  .object({
    class: z.enum(Object.values(AssetClass) as [string, ...string[]], {
      errorMap: () => ({
        message: `Asset class must be one of: ${Object.values(AssetClass).join(
          ", "
        )}`,
      }),
    }),
    category: z.enum(Object.values(AssetCategory) as [string, ...string[]], {
      errorMap: () => ({
        message: `Asset category must be one of: ${Object.values(
          AssetCategory
        ).join(", ")}`,
      }),
    }),
    stage: z.enum(Object.values(AssetStage) as [string, ...string[]], {
      errorMap: () => ({
        message: `Asset stage must be one of: ${Object.values(AssetStage).join(
          ", "
        )}`,
      }),
    }),
    style: z.enum(Object.values(AssetStyle) as [string, ...string[]], {
      errorMap: () => ({
        message: `Asset style must be one of: ${Object.values(AssetStyle).join(
          ", "
        )}`,
      }),
    }),
    companyId: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, "Invalid company ID format"),
    company: z.any().optional(),
    currency: z
      .string()
      .min(1, "Currency is required")
      .max(5, "Currency code must be less than 5 characters"),
    instrumentType: z.enum(
      Object.values(InstrumentType) as [string, ...string[]],
      {
        errorMap: () => ({
          message: `Instrument type must be one of: ${Object.values(
            InstrumentType
          ).join(", ")}`,
        }),
      }
    ),
    name: z
      .string()
      .min(1, "Property name is required")
      .max(100, "Property name must be less than 100 characters"),
    about: z.string().min(1, "About section is required"),
    eoi: z.number().optional(),
    country: z.string().min(1, "Country is required"),
    // state: z.string().min(1, "State is required"),
    city: z.string().min(1, "City is required"),
    landmark: z.string().min(1, "Landmark is required"),
  })
  .strict();

// Query validation schema
export const QueryAssetsValidation = z
  .object({
    class: z
      .enum(Object.values(AssetClass) as [string, ...string[]], {
        errorMap: () => ({
          message: `Asset class must be one of: ${Object.values(
            AssetClass
          ).join(", ")}`,
        }),
      })
      .optional(),
    investorId: z.string().optional(),  
    assetStatus: z.enum(["active", "completed"]).optional(),
    category: z
      .enum(Object.values(AssetCategory) as [string, ...string[]], {
        errorMap: () => ({
          message: `Asset category must be one of: ${Object.values(
            AssetCategory
          ).join(", ")}`,
        }),
      })
      .optional(),
    stage: z
      .enum(Object.values(AssetStage) as [string, ...string[]], {
        errorMap: () => ({
          message: `Asset stage must be one of: ${Object.values(
            AssetStage
          ).join(", ")}`,
        }),
      })
      .optional(),
    style: z
      .enum(Object.values(AssetStyle) as [string, ...string[]], {
        errorMap: () => ({
          message: `Asset style must be one of: ${Object.values(
            AssetStyle
          ).join(", ")}`,
        }),
      })
      .optional(),
    currency: z.string().optional(),
    instrumentType: z
      .enum(Object.values(InstrumentType) as [string, ...string[]], {
        errorMap: () => ({
          message: `Instrument type must be one of: ${Object.values(
            InstrumentType
          ).join(", ")}`,
        }),
      })
      .optional(),
    bookmarked: z.string().optional(),
    name: z.string().optional(),
    country: z.string().optional(),
    state: z.string().optional(),
    city: z.string().optional(),
    landmark: z.string().optional(),

    page: z.string().regex(/^\d+$/, "Page must be a number").optional(),
    limit: z.string().regex(/^\d+$/, "Limit must be a number").optional(),
    sort: z.string().optional(),

    // Advanced filtering fields
    "pricePerSft.gte": z
      .string()
      .regex(/^\d+$/, "Price must be a number")
      .optional(),
    "pricePerSft.gt": z
      .string()
      .regex(/^\d+$/, "Price must be a number")
      .optional(),
    "pricePerSft.lte": z
      .string()
      .regex(/^\d+$/, "Price must be a number")
      .optional(),
    "pricePerSft.lt": z
      .string()
      .regex(/^\d+$/, "Price must be a number")
      .optional(),
    "totalNumberOfSfts.gte": z
      .string()
      .regex(/^\d+$/, "Total SFTs must be a number")
      .optional(),
    "totalNumberOfSfts.gt": z
      .string()
      .regex(/^\d+$/, "Total SFTs must be a number")
      .optional(),
    "totalNumberOfSfts.lte": z
      .string()
      .regex(/^\d+$/, "Total SFTs must be a number")
      .optional(),
    "totalNumberOfSfts.lt": z
      .string()
      .regex(/^\d+$/, "Total SFTs must be a number")
      .optional(),
  })
  .strict();

// Asset ID validation schema
export const AssetIdValidation = z
  .object({
    assetId: z
      .string({
        required_error: "Asset ID is required",
      })
      .regex(/^[0-9a-fA-F]{24}$/, "Invalid asset ID format"),
  })
  .strict();

// Asset ID Query validation schema
export const AssetIdParamsValidation = z
  .object({
    assetId: z
      .string({
        required_error: "Asset ID is required",
      })
      .regex(/^[0-9a-fA-F]{24}$/, "Invalid asset ID format"),
  })
  .strict();

// Update Asset validation schema
export const UpdateAssetValidation = z.object({
  // Basic details
  class: z
    .enum(Object.values(AssetClass) as [string, ...string[]], {
      errorMap: () => ({
        message: `Asset class must be one of: ${Object.values(AssetClass).join(
          ", "
        )}`,
      }),
    })
    .optional(),
  category: z
    .enum(Object.values(AssetCategory) as [string, ...string[]], {
      errorMap: () => ({
        message: `Asset category must be one of: ${Object.values(
          AssetCategory
        ).join(", ")}`,
      }),
    })
    .optional(),
  stage: z
    .enum(Object.values(AssetStage) as [string, ...string[]], {
      errorMap: () => ({
        message: `Asset stage must be one of: ${Object.values(AssetStage).join(
          ", "
        )}`,
      }),
    })
    .optional(),
  style: z
    .enum(Object.values(AssetStyle) as [string, ...string[]], {
      errorMap: () => ({
        message: `Asset style must be one of: ${Object.values(AssetStyle).join(
          ", "
        )}`,
      }),
    })
    .optional(),
  name: z
    .string()
    .min(1, "Property name is required")
    .max(100, "Property name must be less than 100 characters")
    .optional(),
  about: z.string().min(1, "About section is required").optional(),
  companyId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid company ID format")
    .optional(),
  currency: z
    .string()
    .min(1, "Currency is required")
    .max(5, "Currency code must be less than 5 characters")
    .optional(),
  instrumentType: z
    .enum(Object.values(InstrumentType) as [string, ...string[]], {
      errorMap: () => ({
        message: `Instrument type must be one of: ${Object.values(
          InstrumentType
        ).join(", ")}`,
      }),
    })
    .optional(),

  metadata: z.object({
    places: z.record(z.string(), z.string().nullable()),
  }).optional(),

  eoi: z.number().optional(),
  status: z
    .enum(Object.values(AssetStatus) as [string, ...string[]], {
      errorMap: () => ({
        message: `Asset status must be one of: ${Object.values(
          AssetStatus
        ).join(", ")}`,
      }),
    })
    .optional(),

  country: z.string().optional(),
  state: z.string().optional(),
  city: z.string().optional(),
  landmark: z.string().optional(),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),

  faqs: z.any().optional(),
  tenants: z.any().optional(),
  amenities: z.any().optional(),
  expenses: z.any().optional(),
  features: z.any().optional(),
  fees: z.any().optional(),
  documents: z.any().optional(),
  tokenAllocation: z.any().optional(),
  dueDiligence: z.any().optional(),
  allocationCategory: z.any().optional(),
  allocationStats: z.any().optional(),
  riskFactors: z.any().optional(),
  riskDisclosures: z.any().optional(),
  termsAndConditions: z.any().optional(),
  exitOpportunities: z.any().optional(),
  additionalTaxes: z.any().optional(),
  nearByLocations: z.any().optional(),
  _id: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  __v: z.number().optional(),

  // Numerical values
  totalNumberOfSfts: z
    .number()
    // .positive("Total number of SFTs must be positive")
    .optional()
    .nullable(),
  pricePerSft: z
    .number()
    // .positive("Price per SFT must be positive")
    .optional()
    .nullable(),
  basePropertyValue: z
    .number()
    // .positive("Base property value must be positive")
    .optional()
    .nullable(),
  totalPropertyValueAfterFees: z
    .number()
    // .positive("Total property value after fees must be positive")
    .optional()
    .nullable(),

  // Investment performance
  investmentPerformance: z
    .object({
      targetCapitalAppreciation: z.number().optional().nullable(),
      numberOfYears: z.number().optional().nullable(),
      grossTargetIRR: z.number().optional().nullable(),
      netTargetIRR: z.number().optional().nullable(),
      grossInvestmentMultiplier: z.number().optional().nullable(),
      netInvestmentMultiplier: z.number().optional().nullable(),
      estimatedSalePriceAsPerLockInPeriod: z.number().optional().nullable(),
      capitalGains: z.number().optional().nullable(),
      capitalGainsTax: z.number().optional().nullable(),
      estimatedReturnsAsPerLockInPeriod: z.number().optional().nullable(),
      interestRateonReserves: z.number().optional().nullable(),
      netRentalYield: z.number().optional().nullable(),
      grossRentalYield: z.number().optional().nullable(),
      irr: z.number().optional().nullable(),
      moic: z.number().optional().nullable(),
      holdingPeriod: z.number().optional().nullable(),
      latestPropertyValue: z.number().optional().nullable(),
      latestPropertyValueDate: z.string().optional().nullable(),
    })
    .optional(),

  // Rental information
  rentalInformation: z
    .object({
      rentPerSft: z.number().optional().nullable(),
      vacancyRate: z.number().optional().nullable(),
      grossMonthlyRent: z.number().optional().nullable(),
      netMonthlyRent: z.number().optional().nullable(),
      grossAnnualRent: z.number().optional().nullable(),
      netAnnualRent: z.number().optional().nullable(),
      expenses: z
        .object({
          monthlyExpenses: z.number().optional().nullable(),
          annualExpenses: z.number().optional().nullable(),
        })
        .optional(),
      netCashFlow: z.number().optional().nullable(),
    })
    .optional(),

  // Escrow information
  escrowInformation: z
    .object({
      country: z.string().optional().nullable(),
      state: z.string().optional().nullable(),
      escrowBank: z.string().optional().nullable(),
      escrowAgent: z.string().optional().nullable(),
    })
    .optional(),

  // Legal advisory
  legalAdivisory: z
    .object({
      name: z.string().optional().nullable(),
      document: z
        .object({
          name: z.string().optional().nullable(),
          url: z.string().optional().nullable(),
        })
        .optional()
        .nullable(),
    })
    .optional()
    .nullable(),

  // Asset management company
  assetManagementCompany: z
    .object({
      name: z.string().optional().nullable(),
      document: z
        .object({
          name: z.string().optional().nullable(),
          url: z.string().optional().nullable(),
        })
        .optional()
        .nullable(),
    })
    .optional()
    .nullable(),

  // Brokerage
  brokerage: z
    .object({
      name: z.string().optional().nullable(),
      document: z
        .object({
          name: z.string().optional().nullable(),
          url: z.string().optional().nullable(),
        })
        .optional()
        .nullable(),
    })
    .optional()
    .nullable(),

  // Loan information
  loanInformation: z
    .object({
      hasAssetPossesLoan: z.boolean().optional().nullable(),
      currentLoanAmount: z.number().optional().nullable(),
      totalNumberOfYears: z.number().optional().nullable(),
      totalLoanAmount: z.number().optional().nullable(),
      numberOfEMIsYetToPay: z.number().optional().nullable(),
      interestRate: z.number().optional().nullable(),
      pendingLoanAmount: z.number().optional().nullable(),
      bankName: z.string().optional().nullable(),
      brankBranch: z.string().optional().nullable(),
    })
    .optional()
    .nullable(),

  // Token information
  tokenInformation: z
  .object({
    tokenSymbol: z.string().optional().nullable(),
    tokenSupply: z.number().optional().nullable(), 
    minimumTokensToBuy: z.number().optional().nullable(),
    maximumTokensToBuy: z.number().optional().nullable(),
    availableTokensToBuy: z.number().optional().nullable(),
    tokenPrice: z.number().optional().nullable(),
    blockchainProjectAddress: z.string().optional().nullable(),
    blockchainOrderManagerAddress: z.string().optional().nullable(),
    assetManagerAddress: z.string().optional().nullable()
  })
  .optional(),

  // Media
  media: z
    .object({
      imageURL: z.string().optional().nullable(),
      videoURL: z.string().optional().nullable(),
      gallery: z.array(z.string()).optional().nullable(),
      pitchDeckURL: z.string().optional().nullable(),
    })
    .optional(),

  // Hosted by
  hostedBy: z
    .object({
      name: z.string().optional().nullable(),
      isVerified: z.boolean().optional().nullable(),
      address: z.string().optional().nullable(),
      phone: z.string().optional().nullable(),
      email: z.string().optional().nullable(),
      website: z.string().optional().nullable(),
      logoURL: z.string().optional().nullable(),
      whatsappNumber: z.string().optional().nullable(),
      totalProjects: z.number().optional().nullable(),
      onGoingProjects: z.number().optional().nullable(),
      primeLocation: z.string().optional().nullable(),
      about: z.string().optional().nullable(),
      yearEstablished: z.number().optional().nullable(),
    })
    .optional(),

  // Investor requirements and timeline
  investorRequirementsAndTimeline: z
    .object({
      investorAcreditation: z.string().optional().nullable(),
      kycOrAmlRequirements: z.string().optional().nullable(),
      lockupPeriod: z.number().optional().nullable(),
      lockupPeriodType: z.string().optional().nullable(),
      rentalYield: z.number().optional().nullable(),
      distributionStartDate: z.string().optional().nullable(),
      distributionEndDate: z.string().optional().nullable(),
    })
    .optional(),
});

export const CreateBasicDetailsQueryValidation = z
  .object({
    companyId: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, "Invalid company ID format"),
  })
  .strict();
