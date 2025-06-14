import { ApiConfigurationForm } from "@/components/onboarding/ApiConfigurationForm";
import { BrandingForm } from "@/components/onboarding/BrandingForm";
import { CompanyInformationForm } from "@/components/onboarding/CompanyInformationForm";
import { ContactDetailsForm } from "@/components/onboarding/ContactDetailsForm";
import { PasswordResetForm } from "@/components/onboarding/PasswordResetForm";
import Stepper, { Step } from "@/components/shared/Stepper";
import { type UserProfile, profileService } from "@/services/profileService";
import type { InsurerProfile } from "@/types/insurer";
import { useCallback, useEffect, useRef, useState } from "react";
import type React from "react";
import type { UseFormReturn } from "react-hook-form";
import * as z from "zod";

const passwordResetSchema = z
	.object({
		new_password: z.string().min(8, "Password must be at least 8 characters"),
		confirm_new_password: z.string(),
	})
	.refine((data) => data.new_password === data.confirm_new_password, {
		message: "Passwords don't match",
		path: ["confirm_new_password"],
	});

const companyInformationSchema = z.object({
	name: z.string().min(1, "Company name is required"),
	description: z.string().min(1, "Description is required"),
});

const contactDetailsSchema = z.object({
	contact_email: z.string().email("Invalid email address"),
	contact_phone: z.string().min(10, "Phone number must be at least 10 digits"),
});

const apiConfigurationSchema = z.object({
	api_endpoint: z.string().url("Invalid URL"),
	api_key: z.string().min(1, "API key is required"),
});

const brandingSchema = z.object({
	logo_url: z.union([z.instanceof(Blob), z.string()]).nullable(),
});

interface InsurerOnboardingStepperProps {
	onOnboardingComplete: (profile: InsurerProfile) => void;
}

export const InsurerOnboardingStepper: React.FC<
	InsurerOnboardingStepperProps
> = ({ onOnboardingComplete }) => {
	const [showOnboardingStepper, setShowOnboardingStepper] = useState(true);

	// Refs for each form, typed correctly
	const passwordResetFormRef =
		useRef<UseFormReturn<z.infer<typeof passwordResetSchema>>>(null);
	// const emailVerificationFormRef = useRef<
	// 	UseFormReturn<z.infer<typeof otpVerificationSchema>> & {
	// 		triggerSubmit: () => Promise<boolean>;
	// 	}
	// >(null);
	const companyInformationFormRef =
		useRef<UseFormReturn<z.infer<typeof companyInformationSchema>>>(null);
	const contactDetailsFormRef =
		useRef<UseFormReturn<z.infer<typeof contactDetailsSchema>>>(null);
	const apiConfigurationFormRef =
		useRef<UseFormReturn<z.infer<typeof apiConfigurationSchema>>>(null);
	const brandingFormRef =
		useRef<UseFormReturn<z.infer<typeof brandingSchema>>>(null);

	const [onboardingData, setOnboardingData] = useState<Partial<UserProfile>>({
		id: "", // Placeholder
		companyName: "",
		email: "",
		description: "",
		contactEmail: "",
		contactPhone: "",
		logo_url: null, // Initialize with null
		profile_complete: false,
	});

	// State to hold the fetched user profile for initial data in BrandingForm
	const [fetchedProfile, setFetchedProfile] = useState<UserProfile | null>(
		null,
	);

	useEffect(() => {
		const fetchInitialProfile = async () => {
			try {
				const data = await profileService.fetchProfile();
				setFetchedProfile(data);
				// Initialize onboardingData with fetched profile data if available
				setOnboardingData((prev) => ({ ...prev, ...data }));
			} catch (error) {
				console.error("Failed to fetch initial profile for onboarding:", error);
			}
		};
		fetchInitialProfile();
	}, []);

	const updateOnboardingData = useCallback(
		<K extends keyof UserProfile>(field: K, value: UserProfile[K]) => {
			setOnboardingData((prev: Partial<UserProfile>) => ({
				...prev,
				[field]: value,
			}));
		},
		[],
	);

	const handleValidateStep = async (currentStep: number): Promise<boolean> => {
		switch (currentStep) {
			case 1: {
				const form = passwordResetFormRef.current;
				if (form) {
					await form.trigger();
					return form.formState.isValid;
				}
				return false;
			}
			case 2: {
				const form = companyInformationFormRef.current;
				let isValid = false;
				if (form) {
					await form.trigger();
					isValid = form.formState.isValid;
				}
				return isValid;
			}
			case 3: {
				const form = contactDetailsFormRef.current;
				let isValid = false;
				if (form) {
					await form.trigger();
					isValid = form.formState.isValid;
				}
				return isValid;
			}
			case 4: {
				const form = apiConfigurationFormRef.current;
				let isValid = false;
				if (form) {
					await form.trigger();
					isValid = form.formState.isValid;
				}
				return isValid;
			}
			case 5: {
				const form = brandingFormRef.current;
				let isValid = false;
				if (form) {
					await form.trigger();
					isValid = form.formState.isValid;
					// Additional manual validation for logo_url to ensure it's not null
					if (isValid && !form.getValues("logo_url")) {
						form.setError("logo_url", {
							type: "manual",
							message: "Company logo is required.",
						});
						isValid = false;
					}
				}
				return isValid;
			}
			default:
				return true;
		}
	};

	const handleFinalStepCompleted = async () => {
		// Ensure all required fields are present before calling onOnboardingComplete
		// This check should be more robust in a real application
		// For now, we assume all fields are filled by the time we reach the end.
		// We also need to add a fake id to the onboardingData since it's required in InsurerProfile
		const finalProfile: InsurerProfile = {
			id:
				onboardingData.id ||
				`insurer-${Math.random().toString(36).substring(2, 9)}`,
			companyName: onboardingData.companyName || "",
			email: onboardingData.email || "",
			description: onboardingData.description || "",
			contactEmail: onboardingData.contactEmail || "",
			contactPhone: onboardingData.contactPhone || "",
			logo_url: onboardingData.logo_url || null,
			profile_complete: true,
		};

		try {
			// Update the profile via service
			await profileService.updateProfile(finalProfile);
			onOnboardingComplete(finalProfile);
			setShowOnboardingStepper(false);
		} catch (error) {
			console.error("Failed to complete onboarding and update profile:", error);
			// Optionally show a toast error
		}
	};

	if (!showOnboardingStepper) {
		return null;
	}

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-xs">
			<Stepper
				initialStep={1}
				onStepChange={(step) => {}}
				onValidateStep={handleValidateStep}
				onFinalStepCompleted={handleFinalStepCompleted}
				backButtonText="Previous"
				nextButtonText="Next"
			>
				<Step>
					<h2 className="text-xl font-bold mb-4">
						Welcome to Insurer Onboarding!
					</h2>
					<p className="text-muted-foreground mb-6">
						Please reset your password to continue.
					</p>
					<PasswordResetForm
						ref={passwordResetFormRef}
						onUpdateData={({ password_reset_required }) =>
							// We no longer explicitly update 'password_reset_required' in onboardingData
							// as it's part of the static profile_complete logic
							{}
						}
					/>
				</Step>

				{/* <Step>
					<EmailVerificationForm
						ref={emailVerificationFormRef}
						onUpdateData={({ email }) => updateOnboardingData("email", email)}
					/>
				</Step> */}

				<Step>
					<CompanyInformationForm
						ref={companyInformationFormRef}
						onUpdateData={({ name, description }) => {
							updateOnboardingData("companyName", name); // Update to companyName
							updateOnboardingData("description", description);
						}}
					/>
				</Step>
				<Step>
					<ContactDetailsForm
						ref={contactDetailsFormRef}
						onUpdateData={({ contact_email, contact_phone }) => {
							updateOnboardingData("contactEmail", contact_email); // Update to contactEmail
							updateOnboardingData("contactPhone", contact_phone); // Update to contactPhone
						}}
					/>
				</Step>
				<Step>
					<ApiConfigurationForm
						ref={apiConfigurationFormRef}
						onUpdateData={() => {
							/* No longer updating onboardingData with API config */
						}}
					/>
				</Step>
				<Step>
					<BrandingForm
						ref={brandingFormRef}
						onUpdateData={({ logo_url }) =>
							updateOnboardingData("logo_url", logo_url)
						}
						initialLogoUrl={
							fetchedProfile?.logo_url instanceof Blob
								? URL.createObjectURL(fetchedProfile.logo_url)
								: fetchedProfile?.logo_url
						}
					/>
				</Step>
			</Stepper>
		</div>
	);
};
