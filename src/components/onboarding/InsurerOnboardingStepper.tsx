import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { PasswordStep } from "./steps/PasswordStep";
import { CompanyInfoStep } from "./steps/CompanyInfoStep";
import { ContactDetailsStep } from "./steps/ContactDetailsStep";
import { ApiConfigStep } from "./steps/ApiConfigStep";
import { BrandingStep } from "./steps/BrandingStep";
import { OnboardingFormProvider } from "./OnboardingFormProvider";
import { useOnboardingForm } from "../../hooks/useOnboardingForm";
import { profileService } from "@/services/profileService";
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
	const [isInitialized, setIsInitialized] = useState(false);
	const [initialData, setInitialData] = useState<Partial<InsurerProfile>>({});
	const [showOnboardingStepper, setShowOnboardingStepper] = useState(false);
	const { user } = useAuth();
	const navigate = useNavigate();

	// Check if user has temporary password
	useEffect(() => {
		if (user?.temporary_password) {
			setShowOnboardingStepper(true);
		} else {
			setShowOnboardingStepper(false);
			navigate(defaultRoleRedirects.insurer);
		}
	}, [user, navigate]);

	// Fetch initial profile data
	const fetchInitialProfile = useCallback(async () => {
		if (!showOnboardingStepper) return;

		try {
			const profile = await profileService.fetchProfile();
			setInitialData(profile);

			// If profile is already complete, close the stepper
			if (profile.profile_complete) {
				onOnboardingComplete(profile);
			}
		} catch (error) {
			console.error("Error fetching profile:", error);
			toast.error("Failed to load profile data");
		} finally {
			setIsInitialized(true);
		}
	}, [showOnboardingStepper, onOnboardingComplete]);

	useEffect(() => {
		fetchInitialProfile();
	}, [fetchInitialProfile]);

	const handleOnboardingComplete = useCallback(
		(profile: InsurerProfile) => {
			onOnboardingComplete(profile);
			navigate(defaultRoleRedirects.insurer);
		},
		[onOnboardingComplete, navigate],
	);

	if (!showOnboardingStepper || !isInitialized) {
		return null;
	}

	return (
		<OnboardingFormProvider
			initialData={initialData}
			onComplete={handleOnboardingComplete}
		>
			<OnboardingStepperContent />
		</OnboardingFormProvider>
	);
};

// Inner component that uses the form context
const OnboardingStepperContent: React.FC = () => {
	const { currentStep, nextStep, prevStep, isSubmitting, form } = useOnboardingForm();
	const navigate = useNavigate();

	const steps = [
		{
			id: "account-setup",
			title: "Account Setup",
			description: "Set your password",
			component: <PasswordStep />,
		},
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
		const isValid = await nextStep();
		if (!isValid) {
			toast.error("Please fill in all required fields");
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
		<div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm overflow-y-auto p-4 flex items-center justify-center min-h-screen">
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
							variant: "ghost"
						}}
						nextButtonProps={{
							disabled: isSubmitting,
							className: "bg-primary text-primary-foreground hover:bg-primary/90"
						}}
						className="w-full"
					>
						{steps.map((step) => (
							<StepComponent key={step.id}>
								<div className="w-full space-y-6">
									<h3 className="text-xl font-semibold text-foreground">{step.title}</h3>
									<div className="w-full">{step.component}</div>
								</div>
							</StepComponent>
						))}
					</Stepper>
			</div>
		</div>
	);
};
