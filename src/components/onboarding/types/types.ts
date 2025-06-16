import type { UseFormReturn } from "react-hook-form";
import { z } from "zod";

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

// Password strength levels
export type PasswordStrength = {
	score: number;
	label: "Weak" | "Fair" | "Good" | "Strong";
	color: "red" | "orange" | "yellow" | "green";
};

// Password strength checker
export const checkPasswordStrength = (password: string): PasswordStrength => {
	let score = 0;
	// Length check
	if (password.length >= 12) score += 2;
	else if (password.length >= 8) score += 1;

	// Contains lowercase
	if (/[a-z]/.test(password)) score += 1;
	// Contains uppercase
	if (/[A-Z]/.test(password)) score += 1;
	// Contains number
	if (/[0-9]/.test(password)) score += 1;
	// Contains special char
	if (/[^A-Za-z0-9]/.test(password)) score += 1;

	// Determine strength level
	if (score <= 2) return { score, label: "Weak", color: "red" };
	if (score <= 3) return { score, label: "Fair", color: "orange" };
	if (score <= 5) return { score, label: "Good", color: "yellow" };
	return { score, label: "Strong", color: "green" };
};

// Validation schemas for each step
export const passwordSchema = z
	.object({
		password: z
			.string()
			.min(8, "Password must be at least 8 characters")
			.regex(/[a-z]/, "Password must contain at least one lowercase letter")
			.regex(/[A-Z]/, "Password must contain at least one uppercase letter")
			.regex(/[0-9]/, "Password must contain at least one number")
			.regex(
				/[^A-Za-z0-9]/,
				"Password must contain at least one special character",
			),
		confirmPassword: z.string(),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords don't match",
		path: ["confirmPassword"],
	});

export const companyInfoSchema = z.object({
	companyName: z.string().min(1, "Company name is required"),
	description: z.string().optional(),
});

export const contactDetailsSchema = z.object({
	contactEmail: z.string().email("Please enter a valid email"),
	contactPhone: z.string().min(1, "Phone number is required"),
});

export const apiConfigSchema = z.object({
	apiEndpoint: z.string().url("Please enter a valid URL"),
	apiKey: z.string().min(1, "API key is required"),
});

export const brandingSchema = z.object({
	logo: z.union([z.instanceof(File), z.string()]).nullable(),
});

export const stepSchemas = [
	passwordSchema,
	companyInfoSchema,
	contactDetailsSchema,
	apiConfigSchema,
	brandingSchema,
];
