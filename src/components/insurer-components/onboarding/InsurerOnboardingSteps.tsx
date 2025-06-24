import { Controller, type UseFormReturn } from "react-hook-form";
import { AvatarUploader } from "@/components/ui/AvatarUploader";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FormControl, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { PasswordStrengthInput } from "@/components/ui/password-strength-input";
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
				name="newPassword"
				control={form.control}
				render={({ field, fieldState: { error } }) => (
					<FormItem>
						<FormLabel htmlFor={newPasswordId}>New Password</FormLabel>
						<FormControl>
							<PasswordStrengthInput
								id={newPasswordId}
								placeholder="Enter new password"
								{...field}
							/>
						</FormControl>
						{error && (
							<p className="text-red-500 text-xs mt-1">{error.message}</p>
						)}
					</FormItem>
				)}
			/>
			<Controller
				name="confirmPassword"
				control={form.control}
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
							<p className="text-red-500 text-xs mt-1">{error.message}</p>
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
						type="text"
						placeholder="Insurer Name"
						{...form.register("name")}
					/>
				</FormControl>
				{form.formState.errors.name && (
					<p className="text-red-500 text-xs mt-1">
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
					<p className="text-red-500 text-xs mt-1">
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
						type="email"
						placeholder="Contact Email"
						{...form.register("email")}
					/>
				</FormControl>
				{form.formState.errors.email && (
					<p className="text-red-500 text-xs mt-1">
						{form.formState.errors.email.message as string}
					</p>
				)}
			</FormItem>
			<PhoneNumberInput
				control={form.control}
				name="phone"
				label="Contact Phone *"
				placeholder="Enter phone number"
			/>
			{form.formState.errors.phone && (
				<p className="text-red-500 text-xs mt-1">
					{form.formState.errors.phone.message as string}
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
						type="text"
						placeholder="https://api.example.com"
						{...form.register("apiEndpoint")}
					/>
				</FormControl>
				{form.formState.errors.apiEndpoint && (
					<p className="text-red-500 text-xs mt-1">
						{form.formState.errors.apiEndpoint.message}
					</p>
				)}
			</FormItem>
			<FormItem>
				<FormLabel htmlFor={apiKeyId}>API Key</FormLabel>
				<FormControl>
					<Input
						id={apiKeyId}
						type="text"
						placeholder="API Key"
						{...form.register("apiKey")}
					/>
				</FormControl>
				{form.formState.errors.apiKey && (
					<p className="text-red-500 text-xs mt-1">
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
						value={form.watch("logo")}
						onChange={handleFileChange}
						maxSizeMB={5}
						shape="rounded"
					/>
				</FormControl>
			</FormItem>
		</div>
	);
}

// Step 6: Confirmation
interface StepConfirmationProps {
	form: UseFormReturn<OnboardingFormValues>;
	logoUrl: string | null;
}

export function StepConfirmation({ form, logoUrl }: StepConfirmationProps) {
	const values = form.getValues();
	const displayValue = (value: string | undefined | null) =>
		value || "Not provided";

	return (
		<div className="space-y-4 py-4">
			<div className="space-y-2">
				{/* Profile header: logo + name/email */}
				<div className="flex items-center gap-4">
					<Avatar className="h-16 w-16 rounded-lg">
						<AvatarImage
							src={logoUrl || undefined}
							alt={values.name}
							className="rounded-lg"
						/>
						<AvatarFallback className="rounded-lg text-2xl">
							{values.name.charAt(0).toUpperCase()}
						</AvatarFallback>
					</Avatar>
					<div>
						<h3 className="text-xl font-semibold">{values.name}</h3>
						<p className="text-muted-foreground">{values.email}</p>
					</div>
				</div>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
					<div>
						<Label>Password</Label>
						<p className="text-sm text-muted-foreground">
							{displayValue(values.newPassword)}
						</p>
					</div>
					<div>
						<Label>Description</Label>
						<p className="text-sm text-muted-foreground">
							{displayValue(values.description)}
						</p>
					</div>
					<div>
						<Label>Contact Phone</Label>
						<p className="text-sm text-muted-foreground">{values.phone}</p>
					</div>
					<div>
						<Label>API Endpoint</Label>
						<p className="text-sm text-muted-foreground">
							{displayValue(values.apiEndpoint)}
						</p>
					</div>
					<div>
						<Label>API Key</Label>
						<p className="text-sm text-muted-foreground">
							{displayValue(values.apiKey)}
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
