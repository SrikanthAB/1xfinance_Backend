import { z } from "zod";
import {
  SPVType,
  AccountType,
  Blockchain,
  GovernanceModel,
  DecisionType,
  Role,
  Jurisdiction
} from "../../interfaces/company/company.types";

import { Currency } from "../../interfaces/asset/asset.types";

// Common reusables
const stringField = (fieldName: string) =>
  z.string({ required_error: `${fieldName} is required` }).trim().min(1, `${fieldName} cannot be empty`);

const optionalStringField = (fieldName: string) =>
  z.string().trim().optional();

const booleanField = (fieldName: string) =>
  z.boolean({ required_error: `${fieldName} is required` });

const numberField = (fieldName: string) =>
  z.number({ required_error: `${fieldName} is required` });

const percentField = (fieldName: string) =>
  z.number({ required_error: `${fieldName} is required` }).min(0, `${fieldName} must be at least 0`).max(100, `${fieldName} must be at most 100`);

const strictPastDate = z
  .string({ required_error: "Formation Date is required" })
  .refine((val) => {
    const date = new Date(val);
    return (
      !isNaN(date.getTime()) &&
      date < new Date()
    );
  }, {
    message: "Formation Date must be a valid date in YYYY-MM-DD format and must be earlier than today",
  });
// reusable enum field
export const enumField = (fieldName: string, enumObj: Record<string, string>) =>
  z
    .string({
      required_error: `${fieldName} is required`,
      invalid_type_error: `${fieldName} must be a string`,
    })
    .refine((val) => Object.values(enumObj).includes(val), {
      message: `${fieldName} must be one of: ${Object.values(enumObj).join(", ")}`,
    });
// Optional Objects
const memoAndTermsSchema = z.object({
  investmentMemorandum: optionalStringField("Investment Memorandum").optional().nullable(),
  termsAndConditions: optionalStringField("Terms and Conditions").optional().nullable(),
  riskFactor: optionalStringField("Risk Factor").optional().nullable(),
  investmentStrategy: optionalStringField("Investment Strategy").optional().nullable()
});

const escrowBankDetailsSchema = z.object({
  bankName: stringField("Bank Name").nullable(),
  accountType: enumField("Account Type", AccountType).nullable(),
  accountNumber: stringField("Account Number").nullable(),
  routingNumber: stringField("Routing Number").nullable(),
  bankStatement: z.object({
    name: z.string().min(1, { message: 'Bank statement name is required' }).optional().nullable(),
    url: z.string().url({ message: 'Bank statement must be a valid URL' }).optional().nullable()
  }).optional().nullable()
});

const legalDocumentsSchema = z.object({
  llcOperatingAgreement: z.object({
    name: z.string().min(1, { message: 'llcOperatingAgreement name is required' }).optional().nullable(),
    url: z.string().url({ message: 'llcOperatingAgreement must be a valid URL' }).optional().nullable()
  }).nullable(),
  articlesOfAssociation: z.object({
    name: z.string().min(1, { message: 'articlesOfAssociation name is required' }).optional().nullable(),
    url: z.string().url({ message: 'articlesOfAssociation must be a valid URL' }).optional().nullable()
  }).nullable(),
  memorandumOfAssociation: z.object({
    name: z.string().min(1, { message: 'memorandumOfAssociation name is required' }).optional().nullable(),
    url: z.string().url({ message: 'memorandumOfAssociation must be a valid URL' }).optional().nullable()
  }).nullable(),
  otherDocuments: z.object({
    name: z.string().min(1, { message: 'otherDocuments name is required' }).optional().nullable(),
    url: z.string().url({ message: 'otherDocuments be a valid URL' }).optional().nullable()
  }).optional().nullable()
});

const boardOfDirectorsSchema = z.object({
  treasuryManager: z.object({
    name: stringField("Treasury Manager Name").nullable(),
    email: stringField("Treasury Manager Email").email("Invalid email formate").nullable(),
    phoneNumber: optionalStringField("Treasury Manager Phone Number").optional().nullable(),
    idNumber: stringField("Treasury Manager ID Number").nullable(),
    idProof: z.object({
      name: z.string().min(1, { message: 'idProof name is required' }).optional().nullable(),
      url: z.string().url({ message: 'idProof be a valid URL' }).optional().nullable()
    }).optional().nullable()
  }),
  assetManager: z.object({
    name: stringField("Asset Manager Name").nullable(),
    email: stringField("Asset Manager Email").email("Invalid email formate").nullable(),
    phoneNumber: optionalStringField("Asset Manager Phone Number").optional().nullable(),
    idNumber: stringField("Asset Manager ID Number").nullable(),
    idProof: z.object({
      name: z.string().min(1, { message: 'idProof name is required' }).optional().nullable(),
      url: z.string().url({ message: 'idProof be a valid URL' }).optional().nullable()
    }).optional().nullable()
  }),
});

const daoConfigurationSchema = z.object({
  daoName: stringField("DAO Name").nullable(),
  tokenSymbol:stringField("Token symbol").nullable(),
  blockchain: enumField("Blockchain", Blockchain).nullable(),
  governanceModel: enumField("Governance Model", GovernanceModel).optional().nullable(),
  proposalThresholdPercent: percentField("Proposal Threshold Percent").optional().nullable(),
  quorumPercent: percentField("Quorum Percent").optional().nullable(),
  votingPeriod: z.object({
    days: numberField("Voting Period Days").min(0, "Days must be greater than or equal to 0").nullable(),
    hours: numberField("Voting Period Hours").min(0, "Hours must be between 0 and 23").max(23, "Hours must be between 0 and 23").nullable()
  }).optional().nullable(),
  decisionType: enumField("Decision Type", DecisionType).optional().nullable(),
  governanceRights: z.object({
    votingRights: booleanField("Voting Rights"),
    proposalCreation: booleanField("Proposal Creation Rights"),
    adminVotePower: booleanField("Admin Vote Power")
  }).optional().nullable(),
  issuerRepSignature: booleanField("Authorized Issuer Representative Signature").optional(),
});

// Final CreateCompanyValidation
export const CreateCompanyValidation = z.object({
  // Required fields
  name: stringField("Name"),
  type: enumField("Type", SPVType),
  jurisdiction: enumField("Jurisdiction",Jurisdiction).optional(),
  formationDate: strictPastDate,
  businessPurpose: stringField("Business Purpose"),
  currency: enumField("Currency", Currency),
  // Optional objects — if present, validate fully
  status: stringField("status").optional(),
  // logo: z.string().url({ message: 'Logo must be a valid URL' }),
  completedSteps: z.array(z.string()).optional(),
  createdBy: stringField("Created By").optional(),
  walletAddress: stringField("Wallet Address").optional(),
}).strict();


// For update, allow partial
export const UpdateCompanyValidation = z
  .object({
    // Required fields
    name: stringField('Name'),
    type: enumField('Type', SPVType),
    jurisdiction: enumField("Jurisdiction",Jurisdiction).optional(),
    formationDate: strictPastDate,
    businessPurpose: stringField('Business Purpose'),
    currency: z.enum(Object.values(Currency) as [string, ...string[]], {
      errorMap: () => ({
        message: `Currency must be one of: ${Object.values(Currency).join(", ")}`,
      }),
    }),
    logo: z
      .string()
      .url({ message: "Logo must be a valid URL" })
      .nullable()
      .optional(),
    // Optional objects — if present, validate fully
    memoAndTerms: memoAndTermsSchema.optional(),
    escrowBankDetails: escrowBankDetailsSchema.optional(),
    legalDocuments: legalDocumentsSchema.optional(),
    boardOfDirectors: boardOfDirectorsSchema.optional(),
    daoConfiguration: daoConfigurationSchema.optional(),
    status: stringField('Status').optional(),
    completedSteps: z.array(z.string()).optional(),
    // Blockchain-related fields
    spvAddress: stringField('SPV Address').optional(),
    OnchainAddress: stringField('Onchain Address').optional(),
    daoAddress: stringField('DAO Address').optional(),
    ledgerAddress: stringField('Ledger Address').optional(),
    blockchainSpvId: stringField('Blockchain SPV ID').optional(),
    blockchainCompanyId: stringField('Blockchain Company ID').optional(),
    idHash: stringField('ID Hash').optional(),
    walletAddress: stringField('Wallet Address').optional(),
    transactionHash: stringField('Transaction Hash').optional(),
    metadata: stringField('Metadata').optional(),
    createdBy: stringField('Created By').optional(),
  })
  .partial();

// For getAllCompanies query params
const allowedTypes = Object.values(SPVType);

export const getAllCompaniesValidation = z.object({
  page: z
    .string()
    .optional()
    .refine((val) => val === undefined || (/^\d+$/.test(val) && Number(val) > 0), {
      message: "Page must be a positive integer",
    }),
  limit: z
    .string()
    .optional()
    .refine((val) => val === undefined || (/^\d+$/.test(val) && Number(val) > 0), {
      message: "Limit must be a positive integer",
    }),
  name: z.string().trim().optional(),
  type: z
    .union([
      z.enum(Object.values(SPVType) as [string, ...string[]]),
      z.array(z.enum(Object.values(SPVType) as [string, ...string[]])),
    ])
    .optional()
    .refine((val) => val === undefined || (Array.isArray(val) ? val.length > 0 : true), {
      message: 'Type cannot be an empty array',
    }).optional(),
  jurisdiction: z.string().trim().optional(),
  status: z.string().trim().optional(),
  search: z.string().trim().min(1, {
    message: "Search must be at least 1 character long",
  }).optional(),
});



export const CreateAdditionalBoardMemberSchema = z.object({
  fullName: z.string().min(1, { message: 'Full name is required' }).nullable(),
  email: z.string().email({ message: 'Invalid email formate' }).nullable(),
  phoneNumber: z.string().min(7, { message: 'Phone number must be valid' }).optional().nullable(),
  idNumber: z.string().min(1, { message: 'ID number is required' }).nullable(),
  idProof: z.object({
    name: z.string().min(1, { message: 'ID proof name is required' }).optional().nullable(),
    url: z.string().url({ message: 'ID proof must be a valid URL' }).optional().nullable()
  }).optional().nullable(),
  role: enumField("Role",Role ).nullable()
});


export const validateCompanyIdQuery = z.object({
  companyId: z
    .string()
    .length(24, { message: 'companyId must be a 24-character string' }),
});


export const validateIdParam = z.object({
  id: z
    .string()
    .length(24, { message: 'Id must be a 24-character string' }),
});

export const UpdateAdditionalBoardMemberSchema = CreateAdditionalBoardMemberSchema.partial();

