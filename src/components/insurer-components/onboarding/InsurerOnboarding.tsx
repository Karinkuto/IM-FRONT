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
import { useAuth } from "@/hooks/useAuth";
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

// Utility function to map user.ts User to auth.ts User
const mapUserToAuthUser = (
	user: import("@/types/user").User,
): import("@/types/auth").User => {
	// Helper function to normalize roles to the expected format
	const normalizeRoles = (
		roles: unknown,
	): { id: number; name: "admin" | "customer" | "insurer" }[] | undefined => {
		if (!roles) return undefined;

		if (Array.isArray(roles)) {
			return roles.map((role) => {
				if (typeof role === "string") {
					return {
						id: 0, // Default ID for string roles
						name: role as "admin" | "customer" | "insurer",
					};
				} else if (role && typeof role === "object" && "name" in role) {
					return {
						id: "id" in role ? Number(role.id) : 0,
						name: String(role.name) as "admin" | "customer" | "insurer",
					};
				}
				return { id: 0, name: "customer" as const }; // Default fallback
			});
		}
		return undefined;
	};

	// Determine the user's role
	const determineRole = (): "admin" | "customer" | "insurer" => {
		if (user.role) return user.role;
		if (user.roles && user.roles.length > 0) {
			const firstRole = Array.isArray(user.roles) ? user.roles[0] : null;
			if (firstRole) {
				if (typeof firstRole === "string")
					return firstRole as "admin" | "customer" | "insurer";
				if (firstRole.name)
					return firstRole.name as "admin" | "customer" | "insurer";
			}
		}
		return "customer"; // Default role
	};

	return {
		id: user.id.toString(),
		role: determineRole(),
		email: user.email,
		phone_number: user.phone_number || undefined,
		fin: user.fin || undefined,
		temporary_password: !!user.temporary_password,
		customer: user.customer
			? {
					first_name: user.customer.first_name,
					middle_name: user.customer.middle_name,
					last_name: user.customer.last_name,
				}
			: undefined,
		insurer: user.insurer ? { name: user.insurer.name } : undefined,
		roles: normalizeRoles(user.roles),
	};
};

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
	const { user, refreshUser } = useAuth();

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
		try {
			setLoaderState(1); // Show loading state for both operations

			// 1. Prepare both requests
			const passwordPromise = changePassword({
				new_password: values.newPassword,
				new_password_confirmation: values.confirmPassword,
			}).unwrap();

			const formData = buildInsurerOnboardingFormData({
				name: values.name,
				description: values.description ?? undefined,
				contact_email: values.email,
				contact_phone: values.phone,
				api_endpoint: values.apiEndpoint ?? undefined,
				api_key: values.apiKey ?? undefined,
				logo: values.logo,
			});
			const profilePromise = onboardInsurer(formData).unwrap();

			// 2. Send both requests in parallel
			await Promise.all([passwordPromise, profilePromise]);

			// 3. Move to verification state
			setLoaderState(2);
			toast.success("Processing your updates...");

			// 4. Verify both updates were successful
			const { data: updatedUserResponse } = await refetchUser();

			if (updatedUserResponse && currentAccessToken) {
				// Check if password was changed (temporary_password should be false)
				const isPasswordUpdated = !updatedUserResponse.temporary_password;
				// Check if profile was created
				const isProfileUpdated = !!updatedUserResponse.insurer;

				// Update credentials with latest data
				dispatch(
					setCredentials({
						access_token: currentAccessToken,
						user: mapUserToAuthUser(updatedUserResponse),
					}),
				);

				if (isPasswordUpdated && isProfileUpdated) {
					// Refresh user data in AuthContext to ensure all components are updated
					await refreshUser();
					toast.success("All updates completed successfully!");
					setTimeout(() => {
						onClose(); // Close the modal after success
					}, 1000);
				} else {
					const errors = [];
					if (!isPasswordUpdated) {
						errors.push("password update");
					}
					if (!isProfileUpdated) {
						errors.push("profile update");
					}
					throw new Error(`Failed to verify: ${errors.join(" and ")}`);
				}
			} else {
				// Failed to fetch updated user data or missing access token
				throw new Error("Failed to fetch updated user data");
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
