import { RequestHandler } from 'express';

export const GENDER = {
  MALE: 'MALE',
  FEMALE: 'FEMALE',
  OTHERS: 'OTHERS',
} as const;

export type Gender = keyof typeof GENDER;

export const PROJECT_STATUS = {
  PRE_LAUNCH: 'PRE_LAUNCH',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
} as const;

export type ProjectStatus = keyof typeof PROJECT_STATUS;

export const USER_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  BLOCK: 'BLOCK',
} as const;

export type UserStatus = keyof typeof USER_STATUS;

export const PLAN_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  ON_HOLD: 'ON_HOLD',
} as const;

export type PlanStatus = keyof typeof PLAN_STATUS;

export const PLAN_TYPE = {
  FREE: 'FREE',
  SILVER: 'SILVER',
  GOLD: 'GOLD',
  DIAMOND: 'DIAMOND',
} as const;

export type PlanType = keyof typeof PLAN_TYPE;

export const PLAN_UNIT = {
  MONTHLY: 'MONTHLY',
  YEARLY: 'YEARLY',
} as const;

export type PlanUnit = keyof typeof PLAN_UNIT;

export const ROLE_TYPE = {
  ADMIN: 'admin',
  BUILDER: 'builder',
  AGENT: 'agent',
} as const;

export type RoleType = keyof typeof ROLE_TYPE;

export const PROJECT_TYPE = {
  RESIDENTIAL: 'RESIDENTIAL_APARTMENTS',
  COMMERCIAL: 'COMMERCIAL',
  VILLAS: 'VILLAS',
  FARM_LAND: 'FARM_LAND',
  PLOTTING: 'PLOTTING',
} as const;

export type ProjectType = keyof typeof PROJECT_TYPE;

export const APPROVAL_TYPE = {
  RERA: 'RERA',
  HMDA: 'HMDA',
  DTCP: 'DTCP',
  NONE: null as null,
} as const;

export type ApprovalType = keyof Omit<typeof APPROVAL_TYPE, 'NONE'> | null;



export const PREFIXES = {
  PROFILE_IMG_PREFIX: 'profile',

  PROJECT_IMG_PREFIX: 'project/images',
  PROJECT_VIDEOS_PREFIX: 'project/videos',
  PROJECT_DOCS_PREFIX: 'project/docs',

  PLOTTING_SVG_PREFIX: 'plotting/svg',
  PLOTTING_LOGO_PREFIX: 'plotting/logo',
  PLOTTING_IMG_PREFIX: 'plotting/image',

  APARTMENT_IMG_PREFIX: 'apartments/images',
  APARTMENT_SVG_PREFIX: 'apartments/svgs',
} as const;

export const defaultHideFields = ['__v', 'updatedAt', 'password'];
export const defaultRenameFields = ['_id:id'];

export default {
  USER_STATUS,
  PROJECT_STATUS,
  GENDER,
  PLAN_STATUS,
  PLAN_TYPE,
  PLAN_UNIT,
  ROLE_TYPE,
  PROJECT_TYPE,
  APPROVAL_TYPE,
  PREFIXES,
  defaultHideFields,
  defaultRenameFields,
};
