import { useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import type { Role } from "@/types/auth";

import { PasswordStep } from "./steps/PasswordStep";
import { CompanyInfoStep } from "./steps/CompanyInfoStep";
import { ContactDetailsStep } from "./steps/ContactDetailsStep";
import { ApiConfigStep } from "./steps/ApiConfigStep";
import { BrandingStep } from "./steps/BrandingStep";
import { OnboardingFormProvider } from "./OnboardingFormProvider";
import { useOnboardingForm } from "../../hooks/useOnboardingForm";
import { useGetProfileQuery } from "@/redux/api/authApi";
import type { InsurerProfile } from "@/types/profile";
import { useAuth } from "@/hooks/useAuth";
import { defaultRoleRedirects } from "@/config/routes";
import Stepper, { Step as StepComponent } from "../shared/Stepper";

interface InsurerOnboardingStepperProps {
	onOnboardingComplete: (profile: InsurerProfile) => void;
}

// Main component that wraps the form with the provider
export const InsurerOnboardingStepper: React.FC<
	InsurerOnboardingStepperProps
> = ({ onOnboardingComplete }) => {
	const { user } = useAuth();
	const navigate = useNavigate();

	// Only fetch profile when we have a valid user ID
	const {
		data: userProfileData,
		isLoading: isLoadingProfile,
		isError: isProfileError,
	} = useGetProfileQuery(user?.id?.toString() || "", {
		skip: !user?.id,
	});

	const handleOnboardingComplete = useCallback(
		(profile: InsurerProfile) => {
			onOnboardingComplete(profile);
			navigate(defaultRoleRedirects.insurer);
		},
		[onOnboardingComplete, navigate],
	);

	if (isLoadingProfile || isProfileError || !userProfileData) {
		return null;
	}

	// Pass initialData from userProfileData to the form provider
	const initialFormData: Partial<InsurerProfile> = {
		id: String(userProfileData.id),
		insurerId: userProfileData?.insurer?.id
			? String(userProfileData.insurer.id)
			: undefined,
		companyName: userProfileData?.insurer?.name || "",
		description: userProfileData?.insurer?.description || "",
		contactEmail: userProfileData?.insurer?.contact_email || "",
		contactPhone: userProfileData?.insurer?.contact_phone || "",
		apiEndpoint: userProfileData?.insurer?.api_endpoint || "",
		apiKey: userProfileData?.insurer?.api_key || "",
		logo: userProfileData?.insurer?.logo_url || null,
		temporary_password: userProfileData?.temporary_password,
	};

	return (
		<OnboardingFormProvider
			initialData={initialFormData}
			onComplete={handleOnboardingComplete}
			isTemporaryPassword={userProfileData?.temporary_password}
		>
			<OnboardingStepperContent
				isTemporaryPassword={userProfileData?.temporary_password}
			/>
		</OnboardingFormProvider>
	);
};

// Inner component that uses the form context
interface OnboardingStepperContentProps {
	isTemporaryPassword: boolean | undefined;
}

const OnboardingStepperContent: React.FC<OnboardingStepperContentProps> = ({
	isTemporaryPassword,
}) => {
	const {
		currentStep,
		nextStep,
		prevStep,
		isSubmitting,
		form,
		submitForm,
		goToStep,
	} = useOnboardingForm();
	const navigate = useNavigate();

	const baseSteps = [
		{
			id: "company-info",
			title: "Company Info",
			description: "Tell us about your company",
			component: <CompanyInfoStep />,
		},
		{
			id: "contact-details",
			title: "Contact Details",
			description: "How can we reach you?",
			component: <ContactDetailsStep />,
		},
		{
			id: "api-configuration",
			title: "API Configuration",
			description: "Connect your services",
			component: <ApiConfigStep />,
		},
		{
			id: "branding",
			title: "Branding",
			description: "Customize your profile",
			component: <BrandingStep />,
		},
	] as const;

	const steps = isTemporaryPassword
		? [
				{
					id: "account-setup",
					title: "Account Setup",
					description: "Set your password",
					component: <PasswordStep />,
				},
				...baseSteps,
			]
		: baseSteps;

	// Adjust totalSteps based on whether PasswordStep is included
	const totalSteps = steps.length;

	useEffect(() => {
		// If password is not temporary, and current step is 1 (which would be password step),
		// then advance to the first actual profile step (which is now index 0 of baseSteps)
		if (!isTemporaryPassword && currentStep === 1) {
			goToStep(1);
		}
	}, [isTemporaryPassword, currentStep, goToStep]);

	const handleStepChange = async (step: number) => {
		if (step > currentStep) {
			const isValid = await nextStep();
			if (!isValid) {
				toast.error("Please fill in all required fields");
				return false;
			}
		} else if (step < currentStep) {
			prevStep();
		}
		return true;
	};

	const handleComplete = async () => {
		// First validate the current step
		const isValid = await form.trigger();
		if (!isValid) {
			toast.error("Please fill in all required fields");
			return;
		}

		try {
			// Submit the form data
			await submitForm();
		} catch (error) {
			console.error("Error submitting form:", error);
			toast.error("Failed to complete onboarding. Please try again.");
		}
	};

	const handleBack = () => {
		if (currentStep > 1) {
			prevStep();
		} else {
			navigate(-1);
		}
	};

	return (
		<div className="fixed inset-0 z-50 bg-background/5 backdrop-blur-sm overflow-y-auto p-4 flex items-center justify-center min-h-screen">
			<div className="w-full max-w-4xl my-8 mx-auto px-4">
				<Stepper
					initialStep={currentStep}
					onStepChange={handleStepChange}
					onFinalStepCompleted={handleComplete}
					onValidateStep={async () => {
						const isValid = await form.trigger();
						if (!isValid) {
							toast.error("Please fill in all required fields");
						}
						return isValid;
					}}
					backButtonText={currentStep === 1 ? "Cancel" : "Back"}
					nextButtonText={currentStep === steps.length ? "Finish" : "Next"}
					disableStepIndicators={false}
					backButtonProps={{
						onClick: handleBack,
						disabled: isSubmitting,
						className: "text-muted-foreground hover:bg-muted",
					}}
					nextButtonProps={{
						disabled: isSubmitting,
						className: "bg-primary text-primary-foreground hover:bg-primary/90",
					}}
					className="w-full"
				>
					{steps.map((step) => (
						<StepComponent key={step.id}>
							<div className="w-full space-y-6">
								<h3 className="text-xl font-semibold text-foreground">
									{step.title}
								</h3>
								<div className="w-full">{step.component}</div>
							</div>
						</StepComponent>
					))}
				</Stepper>
			</div>
		</div>
	);
};
