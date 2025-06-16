import { createContext, useContext, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { type z, ZodError } from "zod";

// Import types from local types file
import type { OnboardingData, OnboardingFormContextType } from "./types/types";

// Import services
import { profileService } from "@/services/profileService";

// Import schemas from types file
import { stepSchemas } from "./types/types";
import type { InsurerProfile } from "@/types/profile";

// Helper to safely extract field names from a Zod schema
const getSchemaFields = (schema: z.ZodTypeAny): string[] => {
	try {
		// Try to get the shape directly
		if (
			"shape" in schema &&
			typeof schema.shape === "object" &&
			schema.shape !== null
		) {
			return Object.keys(schema.shape);
		}

		// Try to get shape from _def if available
		if (
			"_def" in schema &&
			typeof schema._def === "object" &&
			schema._def !== null
		) {
			const def = schema._def as Record<string, unknown>;

			// Handle shape as a function
			if (typeof def.shape === "function") {
				const shape = def.shape();
				if (shape && typeof shape === "object") {
					return Object.keys(shape);
				}
			}

			// Handle shape as an object
			if (def.shape && typeof def.shape === "object" && def.shape !== null) {
				return Object.keys(def.shape);
			}
		}

		// Fallback to empty array if shape can't be determined
		return [];
	} catch (error) {
		console.error("Error getting schema fields:", error);
		return [];
	}
};

export const OnboardingFormContext =
	createContext<OnboardingFormContextType | null>(null);

interface OnboardingFormProviderProps {
	children: React.ReactNode;
	initialData?: Partial<InsurerProfile>;
	onComplete: (profile: InsurerProfile) => void;
}

export const OnboardingFormProvider: React.FC<OnboardingFormProviderProps> = ({
	children,
	initialData = {},
	onComplete,
}) => {
	const [currentStep, setCurrentStep] = useState(1);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const totalSteps = 5;

	const form = useForm<OnboardingData>({
		defaultValues: {
			password: "",
			confirmPassword: "",
			companyName: initialData.companyName || "",
			description: initialData.description || "",
			contactEmail: initialData.contactEmail || "",
			contactPhone: initialData.contactPhone || "",
			apiEndpoint: initialData.apiEndpoint || "",
			apiKey: initialData.apiKey || "",
			logo: initialData.logo || null,
		},
		mode: "onChange",
		resolver: async (data) => {
			const schema = stepSchemas[currentStep - 1];
			try {
				const values = await schema.parseAsync(data);
				return { values, errors: {} };
			} catch (error) {
				if (error instanceof ZodError) {
					return {
						values: {},
						errors: error.errors.reduce(
							(acc, curr) => {
								const newAcc = Object.assign({}, acc);
								newAcc[curr.path[0]] = { message: curr.message };
								return newAcc;
							},
							{} as Record<string, { message: string }>,
						),
					};
				}
				// For non-Zod errors, rethrow them
				throw error;
			}
		},
	});

	const nextStep = useCallback(async () => {
		try {
			const currentSchema = stepSchemas[currentStep - 1];
			const fields = getSchemaFields(currentSchema);

			// Trigger validation for the current step fields
			const isValid = await form.trigger(fields as (keyof OnboardingData)[]);

			if (isValid) {
				setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
			}
			return isValid;
		} catch (error) {
			console.error("Error in nextStep:", error);
			return false;
		}
	}, [currentStep, form]);

	const prevStep = useCallback(() => {
		setCurrentStep((prev) => Math.max(prev - 1, 1));
	}, []);

	const submitForm = useCallback(async () => {
		try {
			setIsSubmitting(true);
			const values = form.getValues();
			const formData = new FormData();

			// Convert to FormData, handling file uploads
			for (const [key, value] of Object.entries(values)) {
				if (value === null || value === undefined) continue;

				if (key === "logo" && value instanceof File) {
					formData.append("logo", value);
				} else if (typeof value === "string") {
					formData.append(key, value);
				} else if (typeof value === "object") {
					formData.append(key, JSON.stringify(value));
				}
			}

			// Convert FormData to a plain object for type safety
			const formDataObj: Record<string, unknown> = {};
			formData.forEach((value, key) => {
				formDataObj[key] = value;
			});

			// Create profile update object without spread
			const profileUpdate: Partial<InsurerProfile> = Object.assign(
				{},
				formDataObj,
				// Add any additional transformations if needed
			);

			// Update profile with the form data
			const profile = await profileService.updateProfile(profileUpdate);
			toast.success("Profile updated successfully!");
			onComplete(profile);
		} catch (error) {
			console.error("Error submitting form:", error);
			const errorMessage =
				error instanceof Error ? error.message : "Failed to save profile";
			toast.error(errorMessage);
			throw error;
		} finally {
			setIsSubmitting(false);
		}
	}, [form, onComplete]);

	const value = {
		form,
		currentStep,
		totalSteps,
		nextStep,
		prevStep,
		submitForm,
		isSubmitting,
	};

	return (
		<OnboardingFormContext.Provider value={value}>
			{children}
		</OnboardingFormContext.Provider>
	);
};

export const useOnboardingForm = () => {
	const context = useContext(OnboardingFormContext);
	if (!context) {
		throw new Error(
			"useOnboardingForm must be used within an OnboardingFormProvider",
		);
	}
	return context;
};
