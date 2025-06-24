import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useId, useState } from "react";
import { type FieldErrors, useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { toast } from "sonner";
import { Form } from "@/components/ui/form";
import Stepper, { Step } from "@/components/ui/stepper";
import type { ValidRole } from "@/config/routes";
import { useAuth } from "@/context/AuthContext";
import { useChangePasswordMutation } from "@/redux/apis/authApi";
import { useOnboardInsurerMutation } from "@/redux/apis/insurerApi";
import { useGetUserByIdQuery } from "@/redux/apis/userApi";
import { setCredentials } from "@/redux/slices/authSlice";
import type { RootState } from "@/redux/store";
import { buildInsurerOnboardingFormData } from "@/services/insurerOnboardingService";
import {
	type OnboardingFormValues,
	onboardingSchema,
} from "@/types/onboarding";
import {
	StepApiIntegration,
	StepBasicInfo,
	StepChangePassword,
	StepConfirmation,
	StepContactInfo,
	StepLogoUpload,
} from "./InsurerOnboardingSteps";

interface InsurerOnboardingProps {
	role: ValidRole;
	isTemporaryPassword?: boolean;
	hasInsurerProfile?: boolean;
	onClose: () => void;
}

const stepFields: (keyof OnboardingFormValues)[][] = [
	[], // Step 0 placeholder
	["newPassword", "confirmPassword"], // Step 1
	["name"], // Step 2
	["email", "phone"], // Step 3
	[], // Step 4 is optional
	[], // Step 5 is optional
];

const onboardingSteps = [
	{ text: "Changing password..." },
	{ text: "Onboarding profile..." },
	{ text: "Finalizing setup..." },
];

export function InsurerOnboarding({
	role,
	isTemporaryPassword,
	hasInsurerProfile,
	onClose,
}: InsurerOnboardingProps) {
	// Controls visibility of insurer onboarding modal
	const [showInsurerOnboarding, setShowInsurerOnboarding] = useState(false);
	const [currentStep, setCurrentStep] = useState(1);
	const [loaderState, setLoaderState] = useState(0);
	const [loaderErrorStep, setLoaderErrorStep] = useState<number | null>(null);
	const [loaderErrorMessage, setLoaderErrorMessage] = useState<string | null>(
		null,
	);
	const [showWelcome, setShowWelcome] = useState(false);
	const [welcomeVisible, setWelcomeVisible] = useState(false);
	const [overlayVisible, setOverlayVisible] = useState(true);
	const [logoPreview, setLogoPreview] = useState<string | null>(null);
	const location = useLocation();

	const dispatch = useDispatch();
	const { user } = useAuth();

	const userId = user?.id;
	const currentAccessToken = useSelector(
		(state: RootState) => state.auth.access_token,
	);

	const { refetch: refetchUser } = useGetUserByIdQuery(userId || "", {
		skip: !userId,
	});

	// useId hooks for all form fields (one per field)
	const newPasswordId = useId();
	const confirmPasswordId = useId();
	const nameId = useId();
	const descId = useId();
	const emailId = useId();
	const logoId = useId();
	const apiEndpointId = useId();
	const apiKeyId = useId();

	const form = useForm<
		OnboardingFormValues,
		FieldErrors<OnboardingFormValues>,
		OnboardingFormValues
	>({
		resolver: zodResolver(onboardingSchema),
		mode: "onTouched",
		defaultValues: {
			newPassword: "",
			confirmPassword: "",
			name: "",
			description: "",
			email: "",
			phone: "",
			apiEndpoint: "",
			apiKey: "",
		},
	});

	// Cleanup for logo preview URL
	useEffect(() => {
		return () => {
			if (logoPreview) {
				URL.revokeObjectURL(logoPreview);
			}
		};
	}, [logoPreview]);

	const [changePassword, { isLoading: isChangingPassword }] =
		useChangePasswordMutation();
	const [onboardInsurer, { isLoading: isOnboardingInsurer }] =
		useOnboardInsurerMutation();

	const triggerStepValidation = async (step: number) => {
		const fields = stepFields[step];
		if (!fields || fields.length === 0) return true;
		const isValid = await form.trigger(fields);
		return isValid;
	};

	// Show modal only when:
	// 1. User has insurer role
	// 2. On an insurer route
	// 3. Has temporary password (needs onboarding) OR does not have an insurer profile
	useEffect(() => {
		const shouldShow =
			role === "insurer" &&
			location.pathname.startsWith("/insurer") &&
			(Boolean(isTemporaryPassword) || !hasInsurerProfile);
		setShowInsurerOnboarding(shouldShow);
	}, [role, location.pathname, isTemporaryPassword, hasInsurerProfile]);

	const handleLoaderComplete = () => {
		setShowWelcome(true);
		setWelcomeVisible(true);
		setTimeout(() => {
			setWelcomeVisible(false);
			setTimeout(() => {
				setShowWelcome(false);
				// Delay overlay fade out until after welcome message
				setTimeout(() => {
					setOverlayVisible(false);
				}, 900); // fade out overlay after welcome message fade out
			}, 1200); // fade out duration for welcome message
		}, 4200); // show welcome for 4.2 seconds
	};

	// Final submit handler
	const handleOnboardingSubmit = async (values: OnboardingFormValues) => {
		// 1. Change password (for temporary password users)
		try {
			await changePassword({
				new_password: values.newPassword,
				new_password_confirmation: values.confirmPassword,
			}).unwrap();
			toast.success("Password changed successfully");
			setLoaderState(1); // Move to next loader step

			// Refetch user data to get updated temporary_password status
			const { data: updatedUserResponse } = await refetchUser();
			if (updatedUserResponse && currentAccessToken) {
				dispatch(
					setCredentials({
						access_token: currentAccessToken,
						user: updatedUserResponse,
					}),
				);
			}
		} catch (err: unknown) {
			const errorMessage =
				err &&
				typeof err === "object" &&
				"data" in err &&
				err.data &&
				typeof err.data === "object" &&
				"error" in err.data &&
				typeof (err.data as { error?: string }).error === "string"
					? (err.data as { error: string }).error
					: "Failed to change password";
			toast.error(errorMessage);
			setLoaderErrorStep(0);
			setLoaderErrorMessage(errorMessage);
			return;
		}
		// 2. Onboard insurer profile
		try {
			const formData = buildInsurerOnboardingFormData({
				name: values.name,
				description: values.description ?? undefined,
				contact_email: values.email,
				contact_phone: values.phone,
				api_endpoint: values.apiEndpoint ?? undefined,
				api_key: values.apiKey ?? undefined,
				logo: values.logo,
			});
			await onboardInsurer(formData).unwrap();
			toast.success("Profile onboarded successfully");
			setLoaderState(2); // Move to final loader step

			// Refetch user data to get updated insurer profile
			const { data: updatedUserResponse } = await refetchUser();
			if (updatedUserResponse && currentAccessToken) {
				dispatch(
					setCredentials({
						access_token: currentAccessToken,
						user: updatedUserResponse,
					}),
				);
			}

			toast.success("Onboarding complete!");
			onClose(); // Close the modal
		} catch (err: unknown) {
			const errorMessage =
				err &&
				typeof err === "object" &&
				"data" in err &&
				err.data &&
				typeof err.data === "object" &&
				"error" in err.data &&
				typeof (err.data as { error?: string }).error === "string"
					? (err.data as { error: string }).error
					: "Failed to onboard profile";
			toast.error(errorMessage);
			setLoaderErrorStep(1);
			setLoaderErrorMessage(errorMessage);
			throw err; // Re-throw to prevent stepper from proceeding on failure
		}
	};

	// Exit early if not showing onboarding and overlay is not visible
	if (!showInsurerOnboarding && !showWelcome && !overlayVisible) return null;

	return (
		<AnimatePresence>
			{(showInsurerOnboarding || showWelcome || overlayVisible) && (
				<motion.div
					initial={{ opacity: 0 }}
					animate={{
						opacity: 1,
						transition: { duration: 0.5, ease: "easeIn" },
					}}
					exit={{ opacity: 0, transition: { duration: 0.8, ease: "easeOut" } }}
					className="fixed inset-0 z-[1000] flex items-center justify-center backdrop-blur-sm bg-black/40"
				>
					<AnimatePresence mode="wait">
						{!showWelcome && showInsurerOnboarding && (
							<motion.div
								key="onboarding-loader"
								initial={{ opacity: 0, scale: 0.98 }}
								animate={{
									opacity: 1,
									scale: 1,
									transition: { duration: 0.4, ease: "easeInOut" },
								}}
								exit={{
									opacity: 0,
									scale: 1.02,
									transition: { duration: 0.4, ease: "easeInOut" },
								}}
								className="flex items-center justify-center w-full h-full"
							>
								<Form {...form}>
									<Stepper
										initialStep={currentStep}
										onStepChange={setCurrentStep}
										validate={triggerStepValidation}
										onComplete={form.handleSubmit(handleOnboardingSubmit)}
										stepCircleContainerClassName="bg-white dark:bg-neutral-900 shadow-2xl border border-neutral-200 dark:border-neutral-800"
										onFinalStepCompleted={() => {}}
										onLoaderComplete={handleLoaderComplete}
										loaderProps={{
											loadingStates: onboardingSteps,
											loading: form.formState.isSubmitting,
											currentState: loaderState,
											errorStep: loaderErrorStep,
											errorMessage: loaderErrorMessage,
										}}
										nextButtonProps={{
											disabled: isChangingPassword || isOnboardingInsurer,
										}}
									>
										{/* Step 1: Change Password */}
										<Step>
											<StepChangePassword
												newPasswordId={newPasswordId}
												confirmPasswordId={confirmPasswordId}
												form={form}
											/>
										</Step>
										{/* Step 2: Basic Info */}
										<Step>
											<StepBasicInfo
												nameId={nameId}
												descId={descId}
												form={form}
											/>
										</Step>
										{/* Step 3: Contact Info */}
										<Step>
											<StepContactInfo emailId={emailId} form={form} />
										</Step>
										{/* Step 4: API Integration */}
										<Step>
											<StepApiIntegration
												apiEndpointId={apiEndpointId}
												apiKeyId={apiKeyId}
												form={form}
											/>
										</Step>
										{/* Step 5: Logo Upload */}
										<Step>
											<StepLogoUpload
												logoId={logoId}
												form={form}
												onLogoChange={setLogoPreview}
											/>
										</Step>
										{/* Step 6: Confirmation */}
										<Step>
											<StepConfirmation form={form} logoUrl={logoPreview} />
										</Step>
									</Stepper>
								</Form>
							</motion.div>
						)}
					</AnimatePresence>
					<AnimatePresence>
						{showWelcome && (
							<motion.div
								key="onboarding-welcome"
								initial={{ opacity: 0, scale: 0.98 }}
								animate={{
									opacity: welcomeVisible ? 1 : 0,
									scale: 1,
									transition: { duration: 1, ease: "easeInOut" },
								}}
								exit={{
									opacity: 0,
									scale: 1.02,
									transition: { duration: 1, ease: "easeInOut" },
								}}
								className="absolute inset-0 flex items-center justify-center z-[1100]"
							>
								<h1 className="text-3xl font-bold text-white drop-shadow-lg">
									Welcome to the Insurance Dashboard!
								</h1>
							</motion.div>
						)}
					</AnimatePresence>
				</motion.div>
			)}
		</AnimatePresence>
	);
}
