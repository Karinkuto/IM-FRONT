import type { UseFormReturn } from 'react-hook-form';
import { z } from 'zod';

export type BlobOrString = Blob | string;

export interface OnboardingData {
  // Step 1: Password Reset
  password: string;
  confirmPassword: string;

  // Step 2: Company Information
  companyName: string;
  description: string;

  // Step 3: Contact Details
  contactEmail: string;
  contactPhone: string;

  // Step 4: API Configuration
  apiEndpoint: string;
  apiKey: string;

  // Step 5: Branding
  logo: BlobOrString | null;
}

export interface OnboardingFormContextType {
  form: UseFormReturn<OnboardingData>;
  currentStep: number;
  totalSteps: number;
  nextStep: () => Promise<boolean>;
  prevStep: () => void;
  submitForm: () => Promise<void>;
  isSubmitting: boolean;
}

// Validation schemas for each step
export const passwordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

export const companyInfoSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  description: z.string().optional()
});

export const contactDetailsSchema = z.object({
  contactEmail: z.string().email("Please enter a valid email"),
  contactPhone: z.string().min(1, "Phone number is required")
});

export const apiConfigSchema = z.object({
  apiEndpoint: z.string().url("Please enter a valid URL"),
  apiKey: z.string().min(1, "API key is required")
});

export const brandingSchema = z.object({
  logo: z.union([z.instanceof(File), z.string()]).nullable()
});

export const stepSchemas = [
  passwordSchema,
  companyInfoSchema,
  contactDetailsSchema,
  apiConfigSchema,
  brandingSchema
];
