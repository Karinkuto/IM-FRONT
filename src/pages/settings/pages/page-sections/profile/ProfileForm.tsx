import AvatarUploader from "@/components/avatar-uploader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Building2, Mail, Phone, Text, Globe, Key, Eye, EyeOff } from "lucide-react";
import type { ChangeEvent } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { SettingsSection } from "../../../components/SettingsSection";

// Define interfaces outside the component for clarity and reusability
interface InitialProfileData {
	companyName: string;
	description: string;
	contactEmail: string;
	contactPhone: string;
	apiEndpoint?: string;
	apiKey?: string;
	logo_url: string | null;
}

// Data structure for the payload to be sent to the backend
interface ProfilePayload {
	companyName?: string;
	description?: string;
	contactEmail?: string;
	contactPhone?: string;
	apiEndpoint?: string;
	apiKey?: string;
	logo?: Blob | null; // Logo will be Blob or null when sent
}

interface ProfileFormProps {
	initialData: InitialProfileData;
	onSubmit: (data: FormData) => Promise<void>;
	isSubmitting?: boolean;
}

// Zod schema for validation
const profileValidationSchema = z.object({
	companyName: z.string().min(1, "Company name is required").optional(),
	description: z.string().optional(),
	contactEmail: z
		.string()
		.min(1, "Contact email is required")
		.email("Invalid contact email format"),
	contactPhone: z.string().optional(),
	apiEndpoint: z.string().url("Must be a valid URL").optional().or(z.literal('')),
	apiKey: z.string().optional(),
	logo: z.any().optional(), // File or Blob
});

// Type for form errors
interface FormErrors {
  [key: string]: string | undefined;
}

export function ProfileForm({
	initialData,
	onSubmit,
	isSubmitting = false,
}: ProfileFormProps) {
	const [formData, setFormData] = useState(initialData);
	const [profilePicture, setProfilePicture] = useState<Blob | null>(null);
	const [errors, setErrors] = useState<FormErrors>({});
	const [showApiKey, setShowApiKey] = useState(false);
	const initialDataRef = useRef(initialData);
	const hasInitialized = useRef(false);

	// Keep track of the previous initialData to detect changes
	const prevInitialDataRef = useRef(initialData);

	// Keep form data in sync with initialData when it changes
	useEffect(() => {
		// Only update form data if this is the initial mount
		// or if initialData has changed from a refetch
		const prevInitialData = prevInitialDataRef.current;
		const hasInitialDataChanged = JSON.stringify(prevInitialData) !== JSON.stringify(initialData);

		if (!hasInitialized.current || hasInitialDataChanged) {
			hasInitialized.current = true;
			setFormData(initialData);
		}

		// Update the ref with the latest initialData
		prevInitialDataRef.current = initialData;
	}, [initialData]);


	const handleChange = useCallback(
		(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
			const { name, value } = e.target;
			setFormData((prev) => ({
				...prev,
				[name]: name === "contactEmail" ? value.trim() : value,
			}));
			// Clear error for the changed field
			setErrors((prev) => ({
				...prev,
				[name]: undefined,
			}));
		},
		[],
	);

	const handleImageChange = useCallback((blob: Blob | null) => {
		setProfilePicture(blob);
		// Clear any logo-related errors when image changes
		setErrors((prev) => ({ ...prev, logo: undefined }));

		// If we're removing the image, update the form data immediately
		if (blob === null) {
			setFormData(prev => ({
				...prev,
				logo_url: null
			}));
		}
	}, []);



	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setErrors({}); // Clear previous errors

		let changedFields: Partial<ProfilePayload> = {};

		// Compare current formData with initialData to find changes in text fields
		if (formData.companyName !== initialDataRef.current.companyName) {
			changedFields.companyName = formData.companyName;
		}
		if (formData.description !== initialDataRef.current.description) {
			changedFields.description = formData.description;
		}
		if (formData.contactEmail !== initialDataRef.current.contactEmail) {
			changedFields.contactEmail = formData.contactEmail;
		}
		if (formData.contactPhone !== initialDataRef.current.contactPhone) {
			changedFields.contactPhone = formData.contactPhone;
		}
		if (formData.apiEndpoint !== (initialDataRef.current.apiEndpoint || '')) {
			changedFields.apiEndpoint = formData.apiEndpoint || undefined;
		}
		if (formData.apiKey !== (initialDataRef.current.apiKey || '')) {
			changedFields.apiKey = formData.apiKey || undefined;
		}

		// Handle profile picture separately
		if (profilePicture !== null) {
			// New image selected or existing image re-selected
			changedFields.logo = profilePicture;
		} else if (profilePicture === null && initialData.logo_url) {
			// Image was removed - set to null to indicate removal
			changedFields.logo = null;
		}

		// Create a partial schema that only validates the fields that have changed
		const validationFields: Record<string, unknown> = {};
		const fieldsToValidate: Array<keyof typeof profileValidationSchema.shape> = [];

		// Collect fields that need validation
		for (const key in changedFields) {
			if (key in profileValidationSchema.shape) {
				const fieldKey = key as keyof typeof profileValidationSchema.shape;
				validationFields[fieldKey] = formData[fieldKey as keyof typeof formData];
				fieldsToValidate.push(fieldKey);
			}
		}

		// Only validate if there are fields to validate
		if (fieldsToValidate.length > 0) {
			// Create a new schema with only the fields we want to validate
			const partialSchema: z.ZodRawShape = {};
			for (const field of fieldsToValidate) {
				partialSchema[field] = profileValidationSchema.shape[field];
			}

			const validationResult = z.object(partialSchema).safeParse(validationFields);

			if (!validationResult.success) {
				const newErrors: Record<string, string | undefined> = {};
				for (const err of validationResult.error.errors) {
					if (err.path.length > 0) {
						newErrors[err.path[0]] = err.message;
					}
				}
				setErrors(newErrors);
				toast.error("Please correct the highlighted errors.");
				return;
			}
		}

		try {
			// Only proceed if there are changes
			if (Object.keys(changedFields).length === 0) {
				toast.info("No changes detected.");
				return;
			}

			// Create FormData with proper file handling
			const formDataToSend = new FormData();

			// Convert camelCase to snake_case for backend
			const toSnakeCase = (str: string) =>
				str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);

			// Handle logo first as it needs special treatment
			const logoChanged = 'logo' in changedFields;
			const logoValue = changedFields.logo;

			if (logoChanged) {
				if (logoValue instanceof Blob) {
					// New image selected - attach it directly to form data
					formDataToSend.append('payload[logo]', logoValue, 'logo.png');
				} else if (logoValue === null && initialData.logo_url) {
					// Image removal requested
					formDataToSend.append('payload[remove_logo]', 'true');
					// Also include logo_url: null in the payload
					formDataToSend.append('payload[logo_url]', 'null');
				}
				// Create a new object without the logo field to avoid mutating the original
				const { logo: _, ...fieldsWithoutLogo } = changedFields;
				changedFields = fieldsWithoutLogo;
			}

			// Handle other fields - ensure we're using the correct parameter names expected by the backend
			for (const [key, value] of Object.entries(changedFields)) {
				if (value === null || value === undefined) continue;

				// Map frontend field names to backend parameter names
				const backendParamName = key === 'companyName' ? 'name' :
										key === 'contactEmail' ? 'contact_email' :
										key === 'contactPhone' ? 'contact_phone' :
										toSnakeCase(key);

				formDataToSend.append(`payload[${backendParamName}]`, String(value));
			}

			// Submit the form data and wait for it to complete
			await onSubmit(formDataToSend);

			// Reset profile picture state after successful submission
			setProfilePicture(null);

			// If we just removed the logo, update the initial data ref and form data
			if (logoChanged && logoValue === null) {
				initialDataRef.current = { ...initialDataRef.current, logo_url: null };
				setFormData(prev => ({
					...prev,
					logo_url: null
				}));
				// Reset the profile picture state
				setProfilePicture(null);
			}

			// Clear any errors
			setErrors({});
		} catch (error) {
			const errorMessage = error instanceof Error
				? error.message
				: 'An unknown error occurred';
			console.error('[ProfileForm] Form submission error:', errorMessage);
			toast.error('Failed to update profile. Please try again.');
		}
	};

	return (
		<form onSubmit={handleSubmit}>
			<SettingsSection
				title="Profile Information"
				description="Update your company's information and contact details."
			>
				<Card>
					<CardContent>
						<div className="space-y-6">
							<div className="space-y-2">
								<Label htmlFor="profilePicture">Profile Picture</Label>
								<AvatarUploader
									initialImageUrl={initialData.logo_url}
									onImageChange={handleImageChange}
								/>
								{errors.logo && (
									<p className="text-red-500 text-sm mt-1">{errors.logo}</p>
								)}
							</div>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<div className="space-y-2">
									<Label htmlFor="companyName">Company Name</Label>
									<Input
										id="companyName"
										name="companyName"
										value={formData.companyName}
										onChange={handleChange}
										placeholder="Your company name"
										icon={<Building2 className="h-4 w-4" />}
									/>
									{errors.companyName && (
										<p className="text-red-500 text-sm mt-1">
											{errors.companyName}
										</p>
									)}
								</div>
							</div>

							<div className="space-y-2">
								<Label htmlFor="description">Description</Label>
								<Textarea
									id="description"
									name="description"
									value={formData.description}
									onChange={handleChange}
									placeholder="Tell us about your company"
									rows={4}
									icon={<Text className="h-4 w-4" />}
								/>
								{errors.description && (
									<p className="text-red-500 text-sm mt-1">
										{errors.description}
									</p>
								)}
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<div className="space-y-2">
									<Label htmlFor="contactEmail">Contact Email</Label>
									<Input
										id="contactEmail"
										name="contactEmail"
										type="email"
										value={formData.contactEmail}
										onChange={handleChange}
										placeholder="contact@yourcompany.com"
										icon={<Mail className="h-4 w-4" />}
									/>
									{errors.contactEmail && (
										<p className="text-red-500 text-sm mt-1">
											{errors.contactEmail}
										</p>
									)}
								</div>
								<div className="space-y-2">
									<Label htmlFor="contactPhone">Contact Phone</Label>
									<Input
										id="contactPhone"
										name="contactPhone"
										value={formData.contactPhone}
										onChange={handleChange}
										placeholder="+1 (555) 000-0000"
										icon={<Phone className="h-4 w-4" />}
									/>
									{errors.contactPhone && (
										<p className="text-red-500 text-sm mt-1">
											{errors.contactPhone}
										</p>
									)}
								</div>
							</div>

							{/* API Settings Section */}
							<div className="border-t border-gray-200 pt-6 mt-6">
								<h3 className="text-lg font-medium mb-4">API Settings</h3>
								<div className="grid grid-cols-1 gap-6">
									<div className="space-y-2">
										<Label htmlFor="apiEndpoint">API Endpoint</Label>
										<Input
											id="apiEndpoint"
											name="apiEndpoint"
											type="url"
											value={formData.apiEndpoint || ''}
											onChange={handleChange}
											placeholder="https://api.example.com"
											icon={<Globe className="h-4 w-4" />}
										/>
										{errors.apiEndpoint && (
											<p className="text-red-500 text-sm mt-1">
												{errors.apiEndpoint}
											</p>
										)}
									</div>
									<div className="space-y-2">
										<Label htmlFor="apiKey">API Key</Label>
										<div className="relative">
											<Input
												id="apiKey"
												name="apiKey"
												type={showApiKey ? 'text' : 'password'}
												value={formData.apiKey || ''}
												onChange={handleChange}
												placeholder="••••••••••••••••"
												icon={<Key className="h-4 w-4" />}
												className="pr-10"
											/>
											<button
												type="button"
												onClick={() => setShowApiKey(!showApiKey)}
												className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
											>
												{showApiKey ? (
													<EyeOff className="h-4 w-4" />
												) : (
													<Eye className="h-4 w-4" />
												)}
											</button>
										</div>
										{errors.apiKey && (
											<p className="text-red-500 text-sm mt-1">
												{errors.apiKey}
											</p>
										)}

									</div>
								</div>
							</div>

							<div className="flex justify-end pt-2">
								<Button type="submit" disabled={isSubmitting}>
									{isSubmitting ? "Saving..." : "Save Changes"}
								</Button>
							</div>
						</div>
					</CardContent>
				</Card>
			</SettingsSection>
		</form>
	);
}
