export const ROLES = {
    ADMIN: 'admin',
    USER: 'user',
    GUEST: 'guest'
} as const;

export const STATUSES = {
    ACTIVE: 'active',
    INACTIVE: 'in-active',
    PENDING: 'pending'
} as const;

export enum CompanyRole {
    Advisor = 'advisor',
    Manager = 'manager',
    BoardMember = 'board-member',
}

export enum DirectorStatusType {
    Active = "active",
    Inactive = "inactive"
}

export enum DirectorPermissionLevel {
    Manager = "manager"
}

export enum LocationType {
    School = 'school',
    Gym = 'gym',
    Hospital = 'hospital',
    Cinema = 'cinema',
    Cafe = 'cafe',
    Garden = 'garden',
    MedicalPost = 'medical-post',
    Office = 'office',
    PoliceStation = 'police-station',
}

export enum UserRoles {
    SuperAdmin = 'super-admin',
    Admin = 'admin',
    SPVOwner = 'spv-owner',
    SPVEmployee = 'spv-employee',
    PropertyValuationManager = 'property-valuation-manager',
    RyzerEmployee = 'ryzer-employee',
    Investor = 'investor',
    Guest = "guest"
}

export enum AccountType {
    Individual = "individual",
    Institutional = "institutional"
}


export const ROLE_VALUES = ['Admin', 'User', 'Guest'] as const;
export const STATUS_VALUES = ['Active', 'Inactive', 'Pending'] as const;

export type RoleType = typeof ROLE_VALUES[number];
export type StatusType = typeof STATUS_VALUES[number]; 