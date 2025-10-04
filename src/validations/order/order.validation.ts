import { z } from "zod";
import {
  EPaymentType,
  EOrderTrackingStatus,
} from "../../interfaces/order/order.interface";
import { Currency } from "../../interfaces/asset/asset.types";

// Base order schema for reuse

const orderBaseSchema = z.object({
  investorId: z
    .string({
      required_error: "Investor ID is required",
      invalid_type_error: "Investor ID must be a string",
    })
    .min(1, "Investor ID cannot be empty"),

    assetId: z
    .string({
      required_error: "Investor ID is required",
      invalid_type_error: "Investor ID must be a string",
    })
    .min(1, "Investor ID cannot be empty"),

    

  tokensBooked: z
    .string({
      required_error: "Number of tokens to book is required",
      invalid_type_error:
        "Tokens booked must be a string (formatted in ether units)",
    })
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: "Tokens booked must be a positive number",
    }),

  blockchainOrderId: z
    .number({
      required_error: "Blockchain order ID is required",
      invalid_type_error: "Blockchain order ID must be a number",
    })
    .int("Order ID must be an integer")
    .positive("Order ID must be positive"),

  transactionHash: z
    .string({
      required_error: "Transaction hash is required",
      invalid_type_error: "Transaction hash must be a string",
    })
    .regex(/^0x([A-Fa-f0-9]{64})$/, "Invalid transaction hash format"),

  blockNumber: z
    .number({
      required_error: "Block number is required",
      invalid_type_error: "Block number must be a number",
    })
    .int("Block number must be an integer")
    .nonnegative("Block number must be non-negative"),

  from: z
    .string({
      required_error: "Wallet address is required",
      invalid_type_error: "Wallet address must be a string",
    })
    .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid wallet address"),
});


// Create order validation
export const CreateOrderValidation = orderBaseSchema.strict();

export const OrderStatusSchema = z.nativeEnum(EOrderTrackingStatus);


// Update order validation (making all fields optional)
export const UpdateOrderValidation = orderBaseSchema
  .extend({
    orderStatus: OrderStatusSchema,
  })
  .partial()
  .strict();

// Asset ID validation schema
export const AssetIdValidation = z
  .object({
    assetId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid asset ID format"),
  })
  .strict();

// Order ID validation schema
export const OrderIdValidation = z
  .object({
    orderId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid order ID format"),
  })
  .strict();

// Asset ID query validation schema
export const AssetIdQueryValidation = z
  .object({
    assetId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid asset ID format"),
  })
  .strict();

const strictPastDate = (fieldName: string) =>
  z.string({ required_error: `${fieldName} is required` }).refine(
    (val) => {
      const date = new Date(val);
      return !isNaN(date.getTime()) && date < new Date();
    },
    {
      message: `${fieldName} must be a valid date in YYYY-MM-DD format and must be earlier than today`,
    }
  );

export const getMyOrdersQueryValidation = z
  .object({
    fromDate: strictPastDate("From-Date").optional(),
    toDate: strictPastDate("To-Date").optional(),
    orderStatus: z.string().optional(),
    date: strictPastDate("Date").optional(),
    today: z.literal("").optional(),
    lastMonth: z.literal("").optional(),
    lastThreeMonths: z.literal("").optional(),
    lastSixMonths: z.literal("").optional(),
    lastYear: z.literal("").optional(),
    page: z
      .string()
      .optional()
      .refine((val) => !val || !isNaN(Number(val)), {
        message: "Page must be a valid number",
      }),
    limit: z
      .string()
      .optional()
      .refine((val) => !val || !isNaN(Number(val)), {
        message: "Limit must be a valid number",
      }),
    search: z.string().trim().optional(),
  })
  .refine(
    (data) =>
      !(
        data.today !== undefined &&
        (data.fromDate !== undefined ||
          data.toDate !== undefined ||
          data.date !== undefined ||
          data.lastMonth !== undefined ||
          data.lastThreeMonths !== undefined ||
          data.lastSixMonths !== undefined ||
          data.lastYear !== undefined)
      ),
    {
      message:
        "Invalid date filter: 'today' cannot be combined with other date filters",
    }
  )
  .refine(
    (data) =>
      !(
        data.lastMonth !== undefined &&
        (data.fromDate !== undefined ||
          data.toDate !== undefined ||
          data.today !== undefined ||
          data.date !== undefined ||
          data.lastThreeMonths !== undefined ||
          data.lastSixMonths !== undefined ||
          data.lastYear !== undefined)
      ),
    {
      message:
        "Invalid date filter: 'lastMonth' cannot be combined with other date filters",
    }
  )
  .refine(
    (data) =>
      !(
        data.lastThreeMonths !== undefined &&
        (data.fromDate !== undefined ||
          data.toDate !== undefined ||
          data.today !== undefined ||
          data.date !== undefined ||
          data.lastMonth !== undefined ||
          data.lastSixMonths !== undefined ||
          data.lastYear !== undefined)
      ),
    {
      message:
        "Invalid date filter: 'lastThreeMonths' cannot be combined with other date filters",
    }
  )
  .refine(
    (data) =>
      !(
        data.lastSixMonths !== undefined &&
        (data.fromDate !== undefined ||
          data.toDate !== undefined ||
          data.today !== undefined ||
          data.date !== undefined ||
          data.lastMonth !== undefined ||
          data.lastThreeMonths !== undefined ||
          data.lastYear !== undefined)
      ),
    {
      message:
        "Invalid date filter: 'lastSixMonths' cannot be combined with other date filters",
    }
  )
  .refine(
    (data) =>
      !(
        data.lastYear !== undefined &&
        (data.fromDate !== undefined ||
          data.toDate !== undefined ||
          data.today !== undefined ||
          data.date !== undefined ||
          data.lastMonth !== undefined ||
          data.lastThreeMonths !== undefined ||
          data.lastSixMonths !== undefined)
      ),
    {
      message:
        "Invalid date filter: 'lastYear' cannot be combined with other date filters",
    }
  )
  .refine(
    (data) =>
      !(
        data.date !== undefined &&
        (data.fromDate !== undefined ||
          data.toDate !== undefined ||
          data.today !== undefined ||
          data.lastMonth !== undefined ||
          data.lastThreeMonths !== undefined ||
          data.lastSixMonths !== undefined ||
          data.lastYear !== undefined)
      ),
    {
      message:
        "Invalid date filter: 'date' cannot be combined with other date filters",
    }
  )
  .refine(
    (data) =>
      !(
        (data.fromDate !== undefined && data.toDate === undefined) ||
        (data.toDate !== undefined && data.fromDate === undefined)
      ),
    {
      message:
        "Invalid date filter: 'fromDate' and 'toDate' must both be provided or both omitted",
    }
  );
