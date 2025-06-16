import { useState, useCallback, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useForm, FormProvider } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";
import { ZodError } from "zod";

// Import types and context
import type {
	OnboardingFormProviderProps,
	OnboardingData,
} from "./types/onboarding";
import { OnboardingFormContext } from "./context/OnboardingFormContext";
import { stepSchemas } from "./types/types";
import {
	useChangePasswordMutation,
	useCreateInsurerProfileMutation,
	useUpdateInsurerProfileMutation,
} from "@/redux/api/authApi";
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

			// Fallback to empty array if shape can't be determined
			return [];
		}
	} catch (error) {
		console.error("Error getting schema fields:", error);
		return [];
	}
};

// Helper function to convert data URL to Blob
const dataURLtoBlob = (dataurl: string, filename: string) => {
	const arr = dataurl.split(",");
	const mimeMatch = arr[0].match(/:(.*?);/);
	const mime = mimeMatch ? mimeMatch[1] : "image/png";
	const bstr = atob(arr[1]);
	let n = bstr.length;
	const u8arr = new Uint8Array(n);
	while (n--) {
		u8arr[n] = bstr.charCodeAt(n);
	}
	return new File([u8arr], filename, { type: mime });
};

export const OnboardingFormProvider: React.FC<OnboardingFormProviderProps> = ({
	children,
	initialData = {},
	onComplete,
	isTemporaryPassword = false,
}) => {
	const { user } = useAuth();
	const userId = user?.id || initialData.id;

	const initialStep = isTemporaryPassword ? 1 : 1; // Start at step 1 for password, or step 1 for company info if no password needed
	const totalSteps = isTemporaryPassword ? 5 : 4; // 5 steps if password, 4 if not

	const [currentStep, setCurrentStep] = useState(initialStep);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const form = useForm<OnboardingData>({
		defaultValues: {
			// Always start with empty values for new users
			password: "",
			confirmPassword: "",
			companyName: "",
			description: "",
			contactEmail: "",
			contactPhone: "",
			apiEndpoint: "",
			apiKey: "",
			logo: null,
		},
		mode: "onChange",
		resolver: async (data) => {
			const schemaIndex = isTemporaryPassword ? currentStep - 1 : currentStep;
			const schema = stepSchemas[schemaIndex];
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
			const currentSchemaIndex = isTemporaryPassword
				? currentStep - 1
				: currentStep;
			const currentSchema = stepSchemas[currentSchemaIndex];
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
	}, [currentStep, form, isTemporaryPassword, totalSteps]);

	const prevStep = useCallback(() => {
		setCurrentStep((prev) => Math.max(prev - 1, 1));
	}, []);

	const goToStep = useCallback(
		(step: number) => {
			setCurrentStep(() => Math.max(1, Math.min(step, totalSteps)));
		},
		[totalSteps],
	);

	const [changePassword] = useChangePasswordMutation();
	const [createInsurerProfile] = useCreateInsurerProfileMutation();
	const [updateInsurerProfile] = useUpdateInsurerProfileMutation();

	const submitForm = useCallback(async () => {
		if (!userId) {
			toast.error("User ID is required to update insurer profile");
			return;
		}

		let profile: InsurerProfile;

		try {
			setIsSubmitting(true);
			const values = form.getValues();

			// 1. Handle password change (always from temporary password during onboarding)
			if (isTemporaryPassword && values.password && values.confirmPassword) {
				if (values.password !== values.confirmPassword) {
					toast.error("Passwords do not match.");
					setIsSubmitting(false);
					return;
				}

				try {
					// Change password from temporary to permanent
					await changePassword({
						new_password: values.password,
						new_password_confirmation: values.confirmPassword,
					}).unwrap();
					toast.success("Password changed successfully!");
				} catch (error) {
					console.error("Password change error:", error);
					toast.error("Failed to update password. Please try again.");
					setIsSubmitting(false);
					return;
				}
			}

			// 2. Handle Insurer Profile creation or update
			const insurerPayload = {
				name: values.companyName,
				description: values.description || "",
				contact_email: values.contactEmail,
				contact_phone: values.contactPhone || "",
				api_endpoint: values.apiEndpoint || "",
				api_key: values.apiKey || "",
				logo: values.logo || undefined,
			};
			console.log(
				"OnboardingFormProvider - submitForm: Original Insurer Payload:",
				insurerPayload,
			);

			// Create FormData to send multipart/form-data, nesting under 'payload'
			const formData = new FormData();
			for (const key in insurerPayload) {
				if (Object.prototype.hasOwnProperty.call(insurerPayload, key)) {
					// @ts-ignore
					let value = insurerPayload[key];

					if (
						key === "logo" &&
						typeof value === "string" &&
						value.startsWith("data:")
					) {
						// Convert data URL to Blob/File if it's a data URL string (from image preview)
						value = dataURLtoBlob(value, `logo_${Date.now()}.png`); // Assuming PNG for now, can be improved
					}

					if (value instanceof File) {
						formData.append(`payload[${key}]`, value, value.name);
					} else if (value !== null && value !== undefined) {
						formData.append(`payload[${key}]`, String(value));
					} else if (value === null) {
						// Explicitly send null for logo if it's null (e.g., user removed it)
						formData.append(`payload[${key}]`, "null");
					}
				}
			}

			// Log FormData contents for debugging
			console.log(
				"OnboardingFormProvider - submitForm: FormData contents (with payload nesting):",
			);
			formData.forEach((value, key) => {
				console.log(`  Key: ${key}, Value:`, value);
			});

			// 3. Create or update the insurer profile
			if (initialData.insurerId) {
				// Update existing profile using the insurer ID
				profile = await updateInsurerProfile({
					id: initialData.insurerId,
					payload: formData,
				}).unwrap();
				toast.success("Profile updated successfully!");
			} else {
				// Create new profile
				profile = await createInsurerProfile(formData).unwrap();

				// Update the form with the new insurer ID for any subsequent updates
				if (profile.id) {
					form.setValue("insurerId", profile.id);
				}

				toast.success("Profile created successfully!");
			}

			// 4. Call the onComplete callback with the updated profile
			onComplete(profile);
		} catch (error) {
			console.error("Error submitting form:", error);
			const errorMessage =
				error?.data?.message || "Failed to save profile. Please try again.";
			toast.error(errorMessage);
			throw error;
		} finally {
			setIsSubmitting(false);
		}
	}, [
		userId,
		form,
		changePassword,
		initialData.insurerId,
		updateInsurerProfile,
		createInsurerProfile,
		onComplete,
		isTemporaryPassword,
	]);

	const contextValue = useMemo(
		() => ({
			currentStep,
			totalSteps,
			isSubmitting,
			form,
			nextStep,
			prevStep,
			submitForm,
			goToStep,
		}),
		[
			currentStep,
			isSubmitting,
			form,
			nextStep,
			prevStep,
			submitForm,
			goToStep,
			totalSteps,
		],
	);

	return (
		<OnboardingFormContext.Provider value={contextValue}>
			<FormProvider {...form}>{children}</FormProvider>
		</OnboardingFormContext.Provider>
	);
};
