import AvatarUploader from "@/components/avatar-uploader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Building2, Mail, Phone, Text } from "lucide-react";
import type { ChangeEvent } from "react";
import { useCallback, useState } from "react";
import { SettingsSection } from "../../../components/SettingsSection";

interface ProfileFormProps {
	initialData: {
		companyName: string;
		email: string;
		description: string;
		contactEmail: string;
		contactPhone: string;
		logo_url: string | null;
	};
	onSubmit: (data: {
		companyName: string;
		email: string;
		description: string;
		contactEmail: string;
		contactPhone: string;
		profilePicture: Blob | null;
	}) => Promise<void>;
	isSubmitting?: boolean;
}

export function ProfileForm({
	initialData,
	onSubmit,
	isSubmitting = false,
}: ProfileFormProps) {
	const [formData, setFormData] = useState(initialData);
	const [profilePicture, setProfilePicture] = useState<Blob | null>(null);

	const handleChange = (
		e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
	) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleImageChange = useCallback((blob: Blob | null) => {
		setProfilePicture(blob);
	}, []);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		await onSubmit({ ...formData, profilePicture });
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
