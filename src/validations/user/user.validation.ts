import { z } from 'zod';
import { Gender } from '../../interfaces/user/user.interface'; // Adjust import path if needed
import { AccountType } from "../../config/constants/enums";
import { Types } from 'mongoose';

const strictPastDate = z
    .string({ required_error: "Date of birth is required" })
    .refine((val) => {
        const date = new Date(val);
        if (isNaN(date.getTime())) return false;

        const today = new Date();
        const eighteenYearsAgo = new Date(
            today.getFullYear() - 18,
            today.getMonth(),
            today.getDate()
        );

        return date <= eighteenYearsAgo;
    }, {
        message: "Date of birth must be a valid date in YYYY-MM-DD format and age must be at least 18",
    });

const addressSchema = z.object({
    street: z.string().min(1, 'Street is required').optional(),
    city: z.string().min(1, 'City is required').optional(),
    state: z.string().min(1, 'State is required').optional(),
    country: z.string().min(1, 'Country is required').optional(),
    postalCode: z.string()
        .regex(/^\d{4,10}$/, 'Postal code must be 4 to 10 digits').optional(),
});


// Wallet address validation schema
export const walletAddressSchema = z.object({
  walletAddress: z
    .string()
    .min(1, 'Wallet address is required')
    .regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid wallet address format')
});

export const updateUserSchema = z.object({
    firstName: z.string().trim().min(1, 'Fist name is required').optional(),
    middleName: z.string().trim().min(1, 'Middle name is required').optional(),
    lastName: z.string().trim().min(1, 'Last name is required').optional(),
    country: z.string().trim().min(1, "country name must be atleast one character").optional().nullable(),
    avatar: z.string().url('Avatar must be a valid URL').optional().nullable(),
    countryCode: z.string().min(1, "Country code is required").trim().optional().nullable(),
    gender: z.enum(Object.values(Gender) as [string, ...string[]], {
        errorMap: () => ({
            message: `Gender must be one of: ${Object.values(Gender).join(", ")}`,
        }),
    }).optional().nullable(),
    dob: strictPastDate.optional().nullable(),
    type: z.enum(Object.values(AccountType) as [string, ...string[]], {
        errorMap: () => ({
            message: `Investore type must be one of: ${Object.values(AccountType).join(", ")}`,
        }),
    }).optional(),
    address: addressSchema.nullable().optional(),
});



export const getInvestorListOfAssetQuery = z.object({
    assetId: z
        .string()
        .regex(/^[a-f\d]{24}$/i, { message: 'Invalid MongoDB ObjectId' }),

    // page: z.preprocess(
    //     (val) => {
    //         if (typeof val === 'string') {
    //             const trimmed = val.trim();
    //             if (trimmed === '') return undefined;
    //             const num = Number(trimmed);
    //             return Number.isNaN(num) ? undefined : num;
    //         }
    //         return 1;
    //     },
    //     z.string()
    // ),

    limit: z.preprocess(
        (val) => {
            if (typeof val === 'string') {
                const trimmed = val.trim();
                if (trimmed === '') return undefined;
                const num = Number(trimmed);
                return Number.isNaN(num) ? undefined : num;
            }
            return undefined;
        },
        z.number().int().positive().default(10)
    ),

    type: z.preprocess(
        (val) => {
            if (typeof val === 'string') {
                const trimmed = val.trim();
                return trimmed === '' ? undefined : trimmed;
            }
            return undefined;
        },
        z.enum([AccountType.Individual, AccountType.Institutional]).optional()
    ),

    search: z.preprocess(
        (val) => {
            if (typeof val === 'string') {
                const trimmed = val.trim();
                return trimmed === '' ? undefined : trimmed;
            }
            return undefined;
        },
        z.string().optional()
    ),
});


// Helper for optional numeric strings
const optionalPositiveInt = z
    .string()
    .transform(val => (val === '' ? undefined : val))
    .optional()
    .refine(val => val === undefined || /^[1-9]\d*$/.test(val), {
        message: "Must be a positive integer",
    })
    .transform(val => (val === undefined ? undefined : Number(val))); // optional: cast to number


export const assetInvestorsQuerySchema = z
    .object({
        assetId: z
            .string()
            .regex(/^[a-f\d]{24}$/i, { message: "Invalid assetId format" })
            .optional(),

        companyId: z
            .string()
            .regex(/^[a-f\d]{24}$/i, { message: "Invalid companyId format" })
            .optional(),

        page: optionalPositiveInt,
        limit: optionalPositiveInt,

        search: z
            .string()
            .transform(val => (val === '' ? undefined : val?.trim()))
            .optional(),

        type: z
            .string()
            .transform(val => (val === '' || val === ' ' || val === undefined ? undefined : val))
            .optional()
            .refine(
                val => val === undefined || ['individual', 'institutional'].includes(val),
                { message: "Investor type must be one of: individual, institutional" }
            ),
    })
    .refine(
        data => !(data.assetId && data.companyId),
        {
            message: "Provide only one of assetId or companyId, not both",
            path: ['assetId'], // You can point this to either or both fields for error highlighting
        }
    )
    .refine(
        data => data.assetId || data.companyId,
        {
            message: "Either assetId or companyId must be provided",
            path: ['assetId'],
        }
    );

