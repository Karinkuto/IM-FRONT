import AvatarUploader from "@/components/avatar-uploader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Building2, Mail, Phone, Text } from "lucide-react";
import type { ChangeEvent } from "react";
import { useCallback, useState, useRef, useEffect } from "react";
import { SettingsSection } from "../../../components/SettingsSection";
import { toast } from "sonner";
import { z } from "zod";

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

// Define interfaces outside the component for clarity and reusability
interface InitialProfileData {
	companyName: string;
	email: string;
	description: string;
	contactEmail: string;
	contactPhone: string;
	logo_url: string | null;
}

// Data structure for the payload to be sent to the backend
interface ProfilePayload {
	companyName?: string;
	email?: string;
	description?: string;
	contactEmail?: string;
	contactPhone?: string;
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
	email: z.string().email("Invalid email format").optional(),
	description: z.string().optional(),
	contactEmail: z
		.string()
		.min(1, "Contact email is required")
		.email("Invalid contact email format"),
	contactPhone: z.string().optional(),
	logo: z.any().optional(), // File or Blob
});

type ProfileFormErrors = z.infer<typeof profileValidationSchema>;

export function ProfileForm({
	initialData,
	onSubmit,
	isSubmitting = false,
}: ProfileFormProps) {
	const [formData, setFormData] = useState(initialData);
	const [profilePicture, setProfilePicture] = useState<Blob | null>(null);
	const [errors, setErrors] = useState<Record<string, string | undefined>>({});
	const initialDataRef = useRef(initialData);

	// Update initialDataRef if initialData changes externally
	useEffect(() => {
		initialDataRef.current = initialData;
		// Reset form data and errors when initialData changes, e.g., on successful save
		setFormData(initialData);
		setErrors({});
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
		setErrors((prev) => ({ ...prev, logo: undefined }));
	}, []);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setErrors({}); // Clear previous errors

		const changedFields: Partial<ProfilePayload> = {};

		// Compare current formData with initialData to find changes in text fields
		if (formData.companyName !== initialDataRef.current.companyName) {
			changedFields.companyName = formData.companyName;
		}
		if (formData.email !== initialDataRef.current.email) {
			changedFields.email = formData.email;
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

		// Handle profile picture separately
		if (profilePicture !== null) {
			// New image selected or existing image re-selected
			changedFields.logo = profilePicture;
		} else if (
			profilePicture === null &&
			initialDataRef.current.logo_url !== null
		) {
			// Image was removed
			changedFields.logo = null;
		}

		// Validate changed fields with Zod
		const validationResult = profileValidationSchema.safeParse(changedFields);

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

		const formDataToSend = new FormData();
		for (const [key, value] of Object.entries(changedFields)) {
			// Type assertion for key to match ProfilePayload properties
			const typedKey = key as keyof ProfilePayload;

			if (typedKey === "logo") {
				if (value instanceof File || value instanceof Blob) {
					formDataToSend.append(
						`payload[${typedKey}]`,
						value,
						`logo_${Date.now()}.png`,
					);
				} else if (value === null) {
					formDataToSend.append(`payload[${typedKey}]`, "null");
				}
			} else if (value !== null && value !== undefined) {
				formDataToSend.append(`payload[${typedKey}]`, String(value));
			}
		}

		console.log("Changed Fields:", changedFields);
		console.log("FormData to Send (entries):");
		for (const pair of formDataToSend.entries()) {
			console.log(`${pair[0]}: ${pair[1]}`);
		}

		// Only submit if there are actual changes
		if (Object.keys(changedFields).length > 0) {
			await onSubmit(formDataToSend);
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
								<div className="space-y-2">
									<Label htmlFor="email">Email</Label>
									<Input
										id="email"
										name="email"
										type="email"
										value={formData.email}
										onChange={handleChange}
										placeholder="your@email.com"
										icon={<Mail className="h-4 w-4" />}
									/>
									{errors.email && (
										<p className="text-red-500 text-sm mt-1">{errors.email}</p>
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
