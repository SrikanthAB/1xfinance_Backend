import { z } from 'zod';
import { MOBILE_NUMBER_REGEX, EMAIL_REGEX } from '../../utils/regex';
import { AccountType } from '../../config/constants/enums';


export const enumField = (fieldName: string, enumObj: Record<string, string>) =>
  z
    .string({
      required_error: `${fieldName} is required`,
      invalid_type_error: `${fieldName} must be a string`,
    })
    .refine((val) => Object.values(enumObj).includes(val), {
      message: `${fieldName} must be one of: ${Object.values(enumObj).join(", ")}`,
    });

const tokenSchema = z.string()
    .min(1, 'Token is required')
    .refine((token) => {
        const parts = token.split('.');
        return parts.length === 3 && parts.every((part) => part.length > 0);
    }, {
        message: 'Invalid token format: must have header, payload, and signature.',
    });

export const updateUserAccountSchema = z.object({
    fullName: z.string().min(3, 'Full name is required with atleast 3 characters'),
    mobileNumber: z
        .string()
        .regex(MOBILE_NUMBER_REGEX, 'Invalid mobile number')
        .optional(),
    countryCode: z
        .string()
        .regex(/^\+\d{1,4}$/, 'Invalid country code')
        .optional(),
    country: z
        .string()
        .min(1, 'Country is required')
        .optional(),
    type: enumField("Account Type", AccountType),
});


export const verifyOtpSchema = z.object({
    token: tokenSchema,
    otp: z.string()
        .length(6, 'Invalid OTP: OTP must be exactly 6 digits')
        .regex(/^\d{6}$/, 'Invalid OTP: OTP must be a 6-digit number'),
});

export const loginSchema = z.object({
    email: z.string().regex(EMAIL_REGEX, 'Invalid email')
});

export const refreshAccessTokenSchema = z.object({
    sessionId: z.string()
        .min(64, 'Invalid sessionId: must be at least 64 characters long'),
});


export const googleRegisterSchema = z.object({
    token: tokenSchema
});
