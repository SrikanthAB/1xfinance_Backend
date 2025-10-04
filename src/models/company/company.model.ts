import { Schema, Document, model } from "mongoose";
import {
  ICompany,
  IAdditionalBoardMember,
  SPVType,
  AccountType,
  Role,
  Blockchain,
  GovernanceModel,
  DecisionType,
  Jurisdiction,
  CompanyStatus
} from "../../interfaces/company/company.types";
import { accessibleRecordsPlugin } from "@casl/mongoose";
import { Currency } from "../../interfaces/asset/asset.types";

export interface ICompanyDocument extends ICompany, Document {
  symbol?: string;
  baseURI?: string;
  owner?: string;
  spvAddress?: string;
  blockchain?: string;
  createdBy: string;
  updatedBy?: string;
  // Blockchain-related fields
  OnchainAddress?: string;
  daoAddress?: string;
  ledgerAddress?: string;
  blockchainSpvId?: string;
  blockchainCompanyId?: string;
  idHash?: string;
  walletAddress?: string;
  transactionHash?: string;
  metadata?: string;
}
export interface IAdditionalBoardMemberDocument
  extends IAdditionalBoardMember,
    Document {}

const CompanySchema: Schema = new Schema<ICompanyDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: Object.values(SPVType),
      required: true,
    },
    jurisdiction: {
      type: String,
      enum: Object.values(Jurisdiction),
      default: Jurisdiction.Kenya,
      required: true,
    },
    formationDate: {
      type: Date,
      required: true,
    },
    businessPurpose: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum:Object.values(CompanyStatus),
      default: CompanyStatus.Draft
    },
    currency: {
      type: String,
      enum: Object.values(Currency),
      default: Currency.KES,
      required: true,
    },
    logo: {
      type: String,
      default: null,
    },
    memoAndTerms: {
      investmentMemorandum: {
        type: String,
        trim: true,
        default: null,
      },
      termsAndConditions: {
        type: String,
        trim: true,
        default: null,
      },
      riskFactor: {
        type: String,
        trim: true,
        default: null,
      },
      investmentStrategy: {
        type: String,
        trim: true,
        default: null,
      },
    },
    escrowBankDetails: {
      bankName: {
        type: String,
        trim: true,
        default: null,
      },
      accountType: {
        type: String,
        enum: Object.values(AccountType),
        default: null,
      },
      accountNumber: {
        type: String,
        trim: true,
        default: null,
      },
      routingNumber: {
        type: String,
        trim: true,
        default: null,
      },
      bankStatement: {
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
    legalDocuments: {
      llcOperatingAgreement: {
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
      articlesOfAssociation: {
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
      memorandumOfAssociation: {
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
      otherDocuments: {
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
      createdBy: {
        type: String,
        trim: true,
      },
    },
    boardOfDirectors: {
      treasuryManager: {
        name: {
          type: String,
          trim: true,
          default: null,
        },
        email: {
          type: String,
          trim: true,
          default: null,
        },
        phoneNumber: {
          type: String,
          trim: true,
          default: null,
        },
        idNumber: {
          type: String,
          trim: true,
          default: null,
        },
        idProof: {
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
      assetManager: {
        name: {
          type: String,
          trim: true,
          default: null,
        },
        email: {
          type: String,
          trim: true,
          default: null,
        },
        phoneNumber: {
          type: String,
          trim: true,
          default: null,
        },
        idNumber: {
          type: String,
          trim: true,
          default: null,
        },
        idProof: {
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
    },
    daoConfiguration: {
      daoName: {
        type: String,
        trim: true,
        default: null,
      },
      tokenSymbol: {
        type: String,
        default: null,
      },
      blockchain: {
        type: String,
        enum: Object.values(Blockchain),
        default: null,
      },
      governanceModel: {
        type: String,
        enum: Object.values(GovernanceModel),
        default: null,
      },
      proposalThresholdPercent: {
        type: Number,
        min: 0,
        max: 100,
        default: null,
      },
      quorumPercent: {
        type: Number,
        min: 0,
        max: 100,
        default: null,
      },
      votingPeriod: {
        days: {
          type: Number,
          default: null,
        },
        hours: {
          type: Number,
          min: 0,
          max: 23,
          default: null,
        },
      },
      decisionType: {
        type: String,
        enum: Object.values(DecisionType),
        default: null,
      },
      governanceRights: {
        votingRights: {
          type: Boolean,
          default: false,
        },
        proposalCreation: {
          type: Boolean,
          default: false,
        },
        adminVotePower: {
          type: Boolean,
          default: false,
        },
      },
      issuerRepSignature: {
        type: Boolean,
        default: false,
      },
    },
    completedSteps: {
      type: [String],
      default: [],
    },
    // Blockchain-related fields
    spvAddress: {
      type: String,
      trim: true,
      default: null,
    },
    OnchainAddress: {
      type: String,
      trim: true,
      default: null,
    },
    daoAddress: {
      type: String,
      trim: true,
      default: null,
    },
    ledgerAddress: {
      type: String,
      trim: true,
      default: null,
    },
    blockchainSpvId: {
      type: String,
      trim: true,
      default: null,
    },
    blockchainCompanyId: {
      type: String,
      trim: true,
      default: null,
    },
    idHash: {
      type: String,
      trim: true,
      default: null,
    },
    walletAddress: {
      type: String,
      trim: true,
      default: null,
    },
    transactionHash: {
      type: String,
      trim: true,
      default: null,
    },
    metadata: {
      type: String,
      trim: true,
      default: null,
    },
    createdBy: {
      type: String,
      trim: true,
      default: null,
    },
  },
  { timestamps: true }
);

//  Virtual relation
CompanySchema.virtual("additionalBoardMembers", {
  ref: "AdditionalBoardMember",
  localField: "_id",
  foreignField: "companyId",
});
CompanySchema.set("toObject", { virtuals: true });
CompanySchema.set("toJSON", { virtuals: true });

const AdditionalBoardMemberSchema = new Schema<IAdditionalBoardMemberDocument>(
  {
    companyId: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
      default: null,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      default: null,
    },
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
    },
    idNumber: {
      type: String,
      required: true,
      trim: true,
      default: null,
    },
    idProof: {
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
    role: {
      type: String,
      enum: Object.values(Role),
      required: true,
      default: null,
    },
  },
  { timestamps: true }
);

CompanySchema.plugin(accessibleRecordsPlugin);
CompanySchema.pre("findOneAndDelete", async function (next) {
  const doc = await this.model.findOne(this.getFilter());
  if (doc) {
    await AdditionalBoardMember.deleteMany({ companyId: doc._id });
  }
  next();
});
const Company = model<ICompanyDocument>("Company", CompanySchema);
AdditionalBoardMemberSchema.plugin(accessibleRecordsPlugin);
const AdditionalBoardMember = model<IAdditionalBoardMemberDocument>(
  "AdditionalBoardMember",
  AdditionalBoardMemberSchema
);

export { Company, AdditionalBoardMember };
