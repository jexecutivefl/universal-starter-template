import { z } from 'zod';

/**
 * Common Zod Validation Schemas
 *
 * Reusable validation schemas for forms and API requests.
 * Extend these for your domain-specific validations.
 */

// ============================================================================
// Primitive Validations
// ============================================================================

/**
 * Email validation
 */
export const emailSchema = z
  .string()
  .email('Invalid email address')
  .min(1, 'Email is required');

/**
 * Password validation with strength requirements
 */
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(
    /[^A-Za-z0-9]/,
    'Password must contain at least one special character'
  );

/**
 * Simple password (for less strict requirements)
 */
export const simplePasswordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters');

/**
 * Phone number validation (US format)
 */
export const phoneSchema = z
  .string()
  .regex(
    /^(\+1)?[-.\s]?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/,
    'Invalid phone number'
  );

/**
 * URL validation
 */
export const urlSchema = z.string().url('Invalid URL');

/**
 * UUID validation
 */
export const uuidSchema = z.string().uuid('Invalid ID');

/**
 * Date string validation (ISO format)
 */
export const dateStringSchema = z.string().datetime('Invalid date format');

/**
 * Positive number
 */
export const positiveNumberSchema = z
  .number()
  .positive('Must be a positive number');

/**
 * Non-negative number (including zero)
 */
export const nonNegativeNumberSchema = z
  .number()
  .min(0, 'Must be zero or greater');

/**
 * Percentage (0-100)
 */
export const percentageSchema = z
  .number()
  .min(0, 'Must be at least 0')
  .max(100, 'Must be at most 100');

/**
 * Currency amount (2 decimal places)
 */
export const currencySchema = z
  .number()
  .multipleOf(0.01, 'Amount must have at most 2 decimal places');

// ============================================================================
// Object Validations
// ============================================================================

/**
 * Address schema
 */
export const addressSchema = z.object({
  street1: z.string().min(1, 'Street address is required'),
  street2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  postalCode: z.string().min(1, 'Postal code is required'),
  country: z.string().default('US'),
});

export type Address = z.infer<typeof addressSchema>;

/**
 * Name schema
 */
export const nameSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  middleName: z.string().optional(),
});

export type Name = z.infer<typeof nameSchema>;

/**
 * Pagination schema
 */
export const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

export type Pagination = z.infer<typeof paginationSchema>;

/**
 * Search/filter schema
 */
export const searchSchema = z.object({
  query: z.string().optional(),
  filters: z.record(z.unknown()).optional(),
  ...paginationSchema.shape,
});

export type SearchParams = z.infer<typeof searchSchema>;

/**
 * Date range schema
 */
export const dateRangeSchema = z
  .object({
    startDate: z.date(),
    endDate: z.date(),
  })
  .refine((data) => data.startDate <= data.endDate, {
    message: 'Start date must be before end date',
    path: ['endDate'],
  });

export type DateRange = z.infer<typeof dateRangeSchema>;

// ============================================================================
// Auth Validations
// ============================================================================

/**
 * Login form schema
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

export type LoginFormData = z.infer<typeof loginSchema>;

/**
 * Registration form schema
 */
export const registerSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    acceptTerms: z.literal(true, {
      errorMap: () => ({ message: 'You must accept the terms' }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;

/**
 * Forgot password schema
 */
export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

/**
 * Reset password schema
 */
export const resetPasswordSchema = z
  .object({
    code: z.string().min(1, 'Verification code is required'),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

// ============================================================================
// Helpers
// ============================================================================

/**
 * Create an optional version of a schema
 */
export function optional<T extends z.ZodTypeAny>(schema: T) {
  return schema.optional().or(z.literal(''));
}

/**
 * Create a nullable version of a schema
 */
export function nullable<T extends z.ZodTypeAny>(schema: T) {
  return schema.nullable();
}

/**
 * Validate data and return typed result or throw
 */
export function validate<T extends z.ZodTypeAny>(
  schema: T,
  data: unknown
): z.infer<T> {
  return schema.parse(data);
}

/**
 * Safely validate data without throwing
 */
export function safeValidate<T extends z.ZodTypeAny>(
  schema: T,
  data: unknown
): { success: true; data: z.infer<T> } | { success: false; errors: z.ZodError } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, errors: result.error };
}
