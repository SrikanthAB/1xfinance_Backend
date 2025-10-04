import { Document, Schema, model } from "mongoose";
import {
  IAsset,
  AssetClass,
  AssetCategory,
  AssetStyle,
  LockInPeriodType,
  AssetStage,
  InstrumentType,
  Currency,
  AssetStatus,
  EInvestorAcreditation,
  EKycOrAmlRequirements,
} from "../../interfaces/asset/asset.types";

export interface IAssetDocument extends IAsset, Document {}

// Single AssetSchema with nested objects
const AssetSchema = new Schema(
  {
    companyId: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
    },
    class: {
      type: String,
      enum: Object.values(AssetClass),
    },
    category: {
      type: String,
      enum: Object.values(AssetCategory),
    },
    stage: {
      type: String,
      enum: Object.values(AssetStage),
    },
    style: {
      type: String,
      enum: Object.values(AssetStyle),
    },
    currency: {
      type: String,
      enum: Object.values(Currency),
      required: true,
      default: Currency.KES,
    },
    instrumentType: {
      type: String,
      enum: Object.values(InstrumentType),
      required: true,
    },
    metadata: {
      type: Object,
      default: {},
    },
    status: {
      type: String,
      enum: Object.values(AssetStatus),
      default: AssetStatus.INACTIVE,
    },
    bookmarks: {
      type: Number,
      default: 0,
    },
    name: {
      type: String,
      trim: true,
    },
    about: {
      type: String,
      trim: true,
    },
    eoi: {
      type: Number,
      default: 0,
    },
    country: {
      type: String,
      trim: true,
    },
    state: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      trim: true,
    },
    landmark: {
      type: String,
      trim: true,
    },
    latitude: {
      type: Number,
      default: null,
    },
    longitude: {
      type: Number,
      default: null,
    },
    hasGlobalFeePercentagesSynced: {
      type: Boolean,
      default: false,
    },
    hasGlobalFAQsSynced: {
      type: Boolean,
      default: false,
    },
    hasGlobalRiskFactorsSynced: {
      type: Boolean,
      default: false,
    },
    hasGlobalRiskDisclosuresSynced: {
      type: Boolean,
      default: false,
    },
    hasGlobalAdditionalTaxesSynced: {
      type: Boolean,
      default: false,
    },
    hasGlobalExitOpportunitiesSynced: {
      type: Boolean,
      default: false,
    },
    totalNumberOfSfts: {
      type: Number,
      default: 0,
    },
    pricePerSft: {
      type: Number,
      default: 0,
    },
    basePropertyValue: {
      type: Number,
      default: 0,
    },
    totalPropertyValueAfterFees: {
      type: Number,
      default: 0,
    },
    investmentPerformance: {
      targetCapitalAppreciation: {
        type: Number,
        default: 0,
      },
   
      holdingPeriod: {
        type: Number,
        default: 0,
      },
      numberOfYears: {
        type: Number,
        default: 0,
      },
      netInvestmentMultiplier: {
        type: Number,
        default: 0,
      },
      estimatedSalePriceAsPerLockInPeriod: {
        type: Number,
        default: 0,
      },
      capitalGains: {
        type: Number,
        default: 0,
      },
      capitalGainsTax: {
        type: Number,
        default: 0,
      },
      estimatedReturnsAsPerLockInPeriod: {
        type: Number,
        default: 0,
      },
      interestRateonReserves : {
        type: Number,
        default: 0,
      },
      netRentalYield: {
        type: Number,
        default: 0,
      },
      grossRentalYield: {
        type: Number,
        default: 0,
      },
      irr: {
        type: Number,
        default: 0,
      },
      moic : {
        type: Number,
        default: 0,
      },
      latestPropertyValue: {
        type: Number,
        default: 0,
      },
      latestPropertyValueDate: {
        type: Date,
        default: null,
      }
    },
    investorRequirementsAndTimeline: {
      investorAcreditation: {
        type: String,
        enum: Object.values(EInvestorAcreditation),
        default: EInvestorAcreditation.OPEN_TO_ALL,
      },
      kycOrAmlRequirements: {
        type: String,
        enum: Object.values(EKycOrAmlRequirements),
        default: EKycOrAmlRequirements.REQUIRED_FOR_ALL,
      },
      lockupPeriod: {
        type: Number,
        default: 0,
      },
      lockupPeriodType: {
        type: String,
        enum: Object.values(LockInPeriodType),
        default: LockInPeriodType.MONTH,
      },
      rentalYield: {
        type: Number,
        default: 0,
      },
      distributionStartDate: {
        type: Date,
        default: null,
      },
      distributionEndDate: {
        type: Date,
        default: null,
      },
    },
    rentalInformation: {
      rentPerSft: {
        type: Number,
        default: 0,
      },
      vacancyRate: {
        type: Number,
        default: 0,
      },
      grossMonthlyRent: {
        type: Number,
        default: 0,
      },
      netMonthlyRent: {
        type: Number,
        default: 0,
      },
      grossAnnualRent: {
        type: Number,
        default: 0,
      },
      netAnnualRent: {
        type: Number,
        default: 0,
      },
      expenses: {
        monthlyExpenses: {
          type: Number,
          default: 0,
        },
        annualExpenses: {
          type: Number,
          default: 0,
        },
      },
      netCashFlow: {
        type: Number,
        default: 0,
      },
    },
    escrowInformation: {
      country: {
        type: String,
        trim: true,
        default: '',
      },
      state: {
        type: String,
        trim: true,
        default: '',
      },
      escrowBank: {
        type: String,
        trim: true,
        default: '',
      },
      escrowAgent: {
        type: String,
        trim: true,
        default: '',
      },
    },
    legalAdivisory: {
      name: {
        type: String,
        trim: true,
        default: '',
      },
      document: {
        type: {
          name: {
            type: String,
            trim: true,
          },
          url: {
            type: String,
            trim: true,
          },
        },
        default: null,
      },
    },
    assetManagementCompany: {
      name: {
        type: String,
        trim: true,
        default: '',
      },
      document: {
        type: {
          name: {
            type: String,
            trim: true,
          },
          url: {
            type: String,
            trim: true,
          },
        },
        default: null,
      },
    },
    brokerage: {
      name: {
        type: String,
        trim: true,
        default: '',
      },
      document: {
        type: {
          name: {
            type: String,
            trim: true,
          },
          url: {
            type: String,
            trim: true,
          },
        },
        default: null,
      },
    },
    loanInformation: {
      hasAssetPossesLoan: {
        type: Boolean,
        default: false,
      },
      currentLoanAmount: {
        type: Number,
        default: 0,
      },
      totalNumberOfYears: {
        type: Number,
        default: 0,
      },
      totalLoanAmount: {
        type: Number,
        default: 0,
      },
      numberOfEMIsYetToPay: {
        type: Number,
        default: 0,
      },
      interestRate: {
        type: Number,
        default: 0,
      },
      pendingLoanAmount: {
        type: Number,
        default: 0,
      },
      bankName: {
        type: String,
        trim: true,
        default: '',
      },
      brankBranch: {
        type: String,
        trim: true,
        default: '',
      },
    },
    tokenInformation: {
      tokenSymbol: {
        type: String,
        trim: true,
        default: null,
      },
      tokenSupply: {
        type: Number,
        default: 0,
      },
      minimumTokensToBuy: {
        type: Number,
        default: 0,
      },
      maximumTokensToBuy: {
        type: Number,
        default: 0,
      },
      availableTokensToBuy: {
        type: Number,
        default: 0,
      },
      tokenPrice: {
        type: Number,
        default: 0,
      },
      blockchainProjectAddress: {
        type: String,
        default: null,
      },
      blockchainOrderManagerAddress: {
        type: String,
        default: null,
      },
      assetManagerAddress: {
        type: String,
        default: null,
      },
    },
    media: {
      imageURL: {
        type: String,
        trim: true,
        default: '',
      },
      videoURL: {
        type: String,
        trim: true,
        default: '',
      },
      gallery: {
        type: [
          {
            type: String,
            trim: true,
          },
        ],
        default: [],
      },
      pitchDeckURL: {
        type: String,
        trim: true,
        default: '',
      },
    },
    hostedBy: {
      name: {
        type: String,
        trim: true,
        default: '',
      },
      isVerified: {
        type: Boolean,
        default: false,
      },
      address: {
        type: String,
        trim: true,
        default: '',
      },
      phone: {
        type: String,
        trim: true,
        default: '',
      },
      email: {
        type: String,
        trim: true,
        default: '',
      },
      website: {
        type: String,
        trim: true,
        default: '',
      },
      logoURL: {
        type: String,
        trim: true,
        default: '',
      },
      whatsappNumber: {
        type: String,
        trim: true,
        default: '',
      },
      totalProjects: {
        type: Number,
        default: 0,
      },
      onGoingProjects: {
        type: Number,
        default: 0,
      },
      primeLocation: {
        type: String,
        trim: true,
        default: '',
      },
      about: {
        type: String,
        trim: true,
        default: '',
      },
      yearEstablished: {
        type: Number,
        default: null,
      },
    },
  },
  { timestamps: true }
);

const Asset = model<IAssetDocument>("Asset", AssetSchema);
export default Asset;