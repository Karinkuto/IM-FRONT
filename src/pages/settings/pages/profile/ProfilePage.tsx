import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { type UserProfile, profileService } from "@/services/profileService";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { ProfileForm } from "../page-sections/profile/ProfileForm";
import { ProfilePreview } from "../page-sections/profile/ProfilePreview";

export default function ProfilePage() {
	const [userData, setUserData] = useState<UserProfile | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const fetchProfile = async () => {
			try {
				setIsLoading(true);
				const data = await profileService.fetchProfile();
				setUserData(data);
			} catch (error) {
				toast.error("Failed to fetch profile data.", {
					description: error instanceof Error ? error.message : "Unknown error",
				});
			} finally {
				setIsLoading(false);
			}
		};
		fetchProfile();
	}, []);

	const handleProfileSubmit = useCallback(
		async (data: {
			companyName: string;
			email: string;
			description: string;
			contactEmail: string;
			contactPhone: string;
			profilePicture: Blob | null;
		}) => {
			setIsSubmitting(true);
			try {
				// Simulate file upload if a new picture is provided
				const newLogoUrl = data.profilePicture
					? URL.createObjectURL(data.profilePicture)
					: userData?.logo_url || null;

				const updatedData: Partial<UserProfile> = {
					companyName: data.companyName,
					email: data.email,
					description: data.description,
					contactEmail: data.contactEmail,
					contactPhone: data.contactPhone,
					logo_url: newLogoUrl,
				};

				await profileService.updateProfile(updatedData);
				setUserData((prev: UserProfile | null) =>
					prev ? { ...prev, ...updatedData } : null,
				);
				toast.success("Profile updated successfully!");
			} catch (error) {
				toast.error("Failed to update profile.", {
					description: error instanceof Error ? error.message : "Unknown error",
				});
			} finally {
				setIsSubmitting(false);
			}
		},
		[userData],
	);

	if (isLoading) {
		return <LoadingSpinner />;
	}

	if (!userData) {
		return <p>Error: User data not found.</p>; // Or a more elaborate error state
	}

	return (
		<>
			<ProfilePreview {...userData} />
			<ProfileForm
				initialData={{
					...userData,
					logo_url: userData.logo_url,
				}}
				onSubmit={handleProfileSubmit}
				isSubmitting={isSubmitting}
			/>
		</>
	);
}
