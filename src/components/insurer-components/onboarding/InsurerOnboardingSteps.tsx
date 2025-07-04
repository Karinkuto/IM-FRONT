import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { Controller, type UseFormReturn } from "react-hook-form";
import { PasswordStrengthMeter } from "@/components/strength-meter";
import AvatarUploader from "@/components/ui/AvatarUploader";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FormControl, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { PhoneNumberInput } from "@/components/ui/phone-input";
import { Textarea } from "@/components/ui/textarea";
import type { OnboardingFormValues } from "@/types/onboarding";

// Step 1: Change Password
interface StepChangePasswordProps {
	newPasswordId: string;
	confirmPasswordId: string;
	form: UseFormReturn<OnboardingFormValues>;
}

export function StepChangePassword({
	newPasswordId,
	confirmPasswordId,
	form,
}: StepChangePasswordProps) {
	return (
		<div className="space-y-4 py-4">
			<Controller
				control={form.control}
				name="newPassword"
				render={({ field, fieldState: { error } }) => (
					<FormItem>
						<FormLabel htmlFor={newPasswordId}>New Password</FormLabel>
						<FormControl>
							<PasswordStrengthMeter
								enableAutoGenerate={true}
								meterClassName="h-1"
								onValueChange={field.onChange}
								placeholder="Enter new password"
								showRequirements={false}
								value={field.value}
							/>
						</FormControl>
						{error && (
							<p className="mt-1 text-red-500 text-xs">{error.message}</p>
						)}
					</FormItem>
				)}
			/>
			<Controller
				control={form.control}
				name="confirmPassword"
				render={({ field, fieldState: { error } }) => (
					<FormItem>
						<FormLabel htmlFor={confirmPasswordId}>Confirm Password</FormLabel>
						<FormControl>
							<PasswordInput
								id={confirmPasswordId}
								placeholder="Confirm new password"
								{...field}
							/>
						</FormControl>
						{error && (
							<p className="mt-1 text-red-500 text-xs">{error.message}</p>
						)}
					</FormItem>
				)}
			/>
		</div>
	);
}

// Step 2: Basic Info
interface StepBasicInfoProps {
	nameId: string;
	descId: string;
	form: UseFormReturn<OnboardingFormValues>;
}
export function StepBasicInfo({ nameId, descId, form }: StepBasicInfoProps) {
	return (
		<div className="space-y-4 py-4">
			<FormItem>
				<FormLabel htmlFor={nameId}>Name *</FormLabel>
				<FormControl>
					<Input
						id={nameId}
						placeholder="Insurer Name"
						type="text"
						{...form.register("name")}
					/>
				</FormControl>
				{form.formState.errors.name && (
					<p className="mt-1 text-red-500 text-xs">
						{form.formState.errors.name.message as string}
					</p>
				)}
			</FormItem>
			<FormItem>
				<FormLabel htmlFor={descId}>Description</FormLabel>
				<FormControl>
					<Textarea
						id={descId}
						placeholder="Description (optional)"
						{...form.register("description")}
					/>
				</FormControl>
				{form.formState.errors.description && (
					<p className="mt-1 text-red-500 text-xs">
						{form.formState.errors.description.message as string}
					</p>
				)}
			</FormItem>
		</div>
	);
}

// Step 3: Contact Info
interface StepContactInfoProps {
	emailId: string;
	form: UseFormReturn<OnboardingFormValues>;
}
export function StepContactInfo({ emailId, form }: StepContactInfoProps) {
	return (
		<div className="space-y-4 py-4">
			<FormItem>
				<FormLabel htmlFor={emailId}>Contact Email *</FormLabel>
				<FormControl>
					<Input
						id={emailId}
						placeholder="Contact Email"
						type="email"
						{...form.register("email")}
					/>
				</FormControl>
				{form.formState.errors.email && (
					<p className="mt-1 text-red-500 text-xs">
						{form.formState.errors.email.message as string}
					</p>
				)}
			</FormItem>
			<PhoneNumberInput
				control={form.control}
				defaultCountry="ET"
				label="Contact Phone *"
				name="contact_phone"
				placeholder="Enter phone number"
				selectable={false}
			/>
			{form.formState.errors.contact_phone && (
				<p className="mt-1 text-red-500 text-xs">
					{form.formState.errors.contact_phone.message as string}
				</p>
			)}
		</div>
	);
}

// Step 4: API Integration
interface StepApiIntegrationProps {
	apiEndpointId: string;
	apiKeyId: string;
	form: UseFormReturn<OnboardingFormValues>;
}
export function StepApiIntegration({
	apiEndpointId,
	apiKeyId,
	form,
}: StepApiIntegrationProps) {
	return (
		<div className="space-y-4 py-4">
			<FormItem>
				<FormLabel htmlFor={apiEndpointId}>API Endpoint</FormLabel>
				<FormControl>
					<Input
						id={apiEndpointId}
						placeholder="https://api.example.com"
						type="text"
						{...form.register("apiEndpoint")}
					/>
				</FormControl>
				{form.formState.errors.apiEndpoint && (
					<p className="mt-1 text-red-500 text-xs">
						{form.formState.errors.apiEndpoint.message}
					</p>
				)}
			</FormItem>
			<FormItem>
				<FormLabel htmlFor={apiKeyId}>API Key</FormLabel>
				<FormControl>
					<Input
						id={apiKeyId}
						placeholder="API Key"
						type="text"
						{...form.register("apiKey")}
					/>
				</FormControl>
				{form.formState.errors.apiKey && (
					<p className="mt-1 text-red-500 text-xs">
						{form.formState.errors.apiKey.message}
					</p>
				)}
			</FormItem>
		</div>
	);
}

// Step 5: Logo Upload
interface StepLogoUploadProps {
	logoId: string;
	form: UseFormReturn<OnboardingFormValues>;
	onLogoChange: (url: string | null) => void;
}
export function StepLogoUpload({
	logoId,
	form,
	onLogoChange,
}: StepLogoUploadProps) {
	const handleFileChange = (fileOrBlob: File | Blob | null) => {
		form.setValue("logo", fileOrBlob || undefined, { shouldValidate: true });
		if (fileOrBlob) {
			const previewUrl = URL.createObjectURL(fileOrBlob);
			onLogoChange(previewUrl);
		} else {
			onLogoChange(null);
		}
	};
	return (
		<div className="py-4">
			<FormItem>
				<FormLabel htmlFor={logoId}>Company Logo</FormLabel>
				<FormControl>
					<AvatarUploader
						height={160}
						maxSizeMB={5}
						onChange={handleFileChange}
						shape="rounded"
						value={form.watch("logo")}
					/>
				</FormControl>
			</FormItem>
		</div>
	);
}

// Regex for detecting duplicate +251 prefixes
const DUPLICATE_PREFIX_REGEX = /^\+251\+251/;

// Step 6: Confirmation
interface StepConfirmationProps {
	form: UseFormReturn<OnboardingFormValues>;
	logoUrl: string | null;
}

export function StepConfirmation({ form, logoUrl }: StepConfirmationProps) {
	const values = form.getValues();
	const displayValue = (value: string | undefined | null) =>
		value || "Not provided";

	// State for toggling password/API key visibility
	const [showPassword, setShowPassword] = useState(false);
	const [showApiKey, setShowApiKey] = useState(false);

	// Format phone number to ensure it has +251 prefix
	const formatPhoneNumber = (phone: string | undefined | null) => {
		if (!phone) {
			return "Not provided";
		}
		if (phone.startsWith("+251")) {
			return phone;
		}
		return `+251${phone}`.replace(DUPLICATE_PREFIX_REGEX, "+251");
	};

	// Mask sensitive information
	const maskSensitive = (value: string | undefined | null, show = false) => {
		if (!value) return "Not provided";
		return show ? value : "•".repeat(8);
	};

	return (
		<div className="space-y-4 py-4">
			<div className="space-y-2">
				{/* Profile header: logo + name/email */}
				<div className="flex items-center gap-4">
					<Avatar className="h-16 w-16 rounded-lg">
						<AvatarImage
							alt={values.name}
							className="rounded-lg"
							src={logoUrl || undefined}
						/>
						<AvatarFallback className="rounded-lg text-2xl">
							{values.name.charAt(0).toUpperCase()}
						</AvatarFallback>
					</Avatar>
					<div>
						<h3 className="font-semibold text-xl">{values.name}</h3>
						<p className="text-muted-foreground">{values.email}</p>
					</div>
				</div>
				<div className="grid grid-cols-1 gap-4 pt-4 md:grid-cols-2">
					<div>
						<div className="flex items-center justify-between">
							<Label>Password</Label>
							<button
								aria-label={showPassword ? "Hide password" : "Show password"}
								className="inline-flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted"
								onClick={() => setShowPassword(!showPassword)}
								type="button"
							>
								{showPassword ? (
									<EyeOff className="h-4 w-4" />
								) : (
									<Eye className="h-4 w-4" />
								)}
							</button>
						</div>
						<p className="mt-1 text-muted-foreground text-sm">
							{maskSensitive(values.newPassword, showPassword)}
						</p>
					</div>
					<div>
						<Label>Description</Label>
						<p className="text-muted-foreground text-sm">
							{displayValue(values.description)}
						</p>
					</div>
					<div>
						<Label>Contact Phone</Label>
						<p className="text-muted-foreground text-sm">
							{formatPhoneNumber(values.contact_phone)}
						</p>
					</div>
					<div>
						<Label>API Endpoint</Label>
						<p className="text-muted-foreground text-sm">
							{displayValue(values.apiEndpoint)}
						</p>
					</div>
					<div>
						<div className="flex items-center justify-between">
							<Label>API Key</Label>
							<button
								aria-label={showApiKey ? "Hide API key" : "Show API key"}
								className="inline-flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted"
								onClick={() => setShowApiKey(!showApiKey)}
								type="button"
							>
								{showApiKey ? (
									<EyeOff className="h-4 w-4" />
								) : (
									<Eye className="h-4 w-4" />
								)}
							</button>
						</div>
						<p className="mt-1 text-muted-foreground text-sm">
							{maskSensitive(values.apiKey, showApiKey)}
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
