import { Schema } from "mongoose";
import { Currency } from "../../interfaces/asset/asset.types";

  export enum AccountType {
    EscrowBankAccount = "escrow-bank-account",
    CurrentAccount = "current-account",
    CorporateAccount = "corporate-account",
    SavingsAccount = "savings-account",
}

export enum Jurisdiction{
  Kenya ="kenya", 
  Uganda = "uganda",
  Rwanda = "rwanda",
  Ethiopia = "ethiopia",
  Zambia = "zambia"
}

export enum SPVType {
  LLC = "llc",
  PrivateLimited = "private-limited",
  DAOLLC = "dao-llc",
  Corporation = "corporation",
  PublicEntity = "public-entity",
  Partnership = "partnership",
}

export enum TokenSymbol {
  TETHER = "tether",
  XDC = "xdc",
  XRP = "xrp",
  RYZERX = "ryzerx",
}

export enum Blockchain {
  Ethereum = "ethereum",
  Polygon = "polygon",
  Arbitrum = "arbitrum",
  Optimism = "optimism",
  Base = "base",
  Avalanche = "avalanche",
  XRPL = "xrpl",
  XDC = "xdc",
}

export enum GovernanceModel {
  TokenWeighted = "token-weighted",
  EqualVoting = "equal-voting",
  ReputationBased = "reputation-based",
}

export enum DecisionType {
  MajorDecisionOnly = "major-decision-only",
  AllDecisions = "all-decisions",
}

export enum CompanyStatus{
  Draft = 'draft',
  Active = 'active',
  InActive = 'in-active'
}

export enum Role{
  TreasuryManager = 'treasury-manager',
  AssetManager = 'asset-manager'
}

export interface IIdProof{
  name:string,
  url:string
}

export interface IAdditionalBoardMember {
  companyId: Schema.Types.ObjectId;
  fullName: string;
  email: string;
  phoneNumber: string;
  idNumber: string;
  idProof?: IIdProof; 
  role:Role;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IMemoAndTerms {
  investmentMemorandum: string;
  termsAndConditions: string;
  riskFactor: string;
  investmentStrategy: string;
}

export interface IEscrowBankDetails {
  bankName: string;
  accountType: AccountType;
  accountNumber: string;
  routingNumber: string;
  bankStatement?: IIdProof;
}

export interface ILegalDocuments {
  llcOperatingAgreement?: IIdProof;
  articlesOfAssociation?: IIdProof;
  memorandumOfAssociation?: IIdProof;
  otherDocuments?: IIdProof;
}

export interface IBoardMember {
  name: string;
  email: string;
  phoneNumber?: string;
  idNumber: string;
  idProof?: IIdProof;
}

export interface IBoardOfDirectors {
  treasuryManager: IBoardMember;
  assetManager: IBoardMember;
  additionalBoardMembers?: IAdditionalBoardMember[];
}

export interface IVotingPeriod {
  days: number;
  hours: number;
}

export interface IGovernanceRights {
  votingRights: boolean;
  proposalCreation: boolean;
  adminVotePower: boolean;
}

export interface IDaoConfiguration {
  daoName: string;
  tokenSymbol: string;
  blockchain: Blockchain;
  governanceModel: GovernanceModel;
  proposalThresholdPercent: number;
  quorumPercent: number;
  votingPeriod: IVotingPeriod;
  decisionType: DecisionType;
  governanceRights: IGovernanceRights;
  issuerRepSignature:boolean;
}

export interface ICompany {
  name: string;
  type: SPVType;
  jurisdiction: Jurisdiction;
  formationDate: Date;
  businessPurpose: string;
  status:string;
  currency:Currency;
  logo: string;
  memoAndTerms: IMemoAndTerms;
  escrowBankDetails: IEscrowBankDetails;
  legalDocuments: ILegalDocuments;
  boardOfDirectors: IBoardOfDirectors;
  daoConfiguration: IDaoConfiguration;
  completedSteps:[];
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
  createdBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICompanyFilters {
  page?: number;
  limit?: number;
  name?: string;
  type?: SPVType;
  jurisdiction?: string;
  status?:string;
}

