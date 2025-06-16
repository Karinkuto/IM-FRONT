import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useCallback, useEffect } from "react";
import { toast } from "sonner";
import { ProfileForm } from "../page-sections/profile/ProfileForm";
import { ProfilePreview } from "../page-sections/profile/ProfilePreview";
import {
	useGetProfileQuery,
	useUpdateUserProfileMutation,
	useUpdateInsurerProfileMutation,
	type UpdateUserProfilePayload,
	type InsurerProfilePayload,
} from "@/redux/api/authApi";
import { useAuth } from "@/hooks/useAuth";
import type { User } from "@/types/auth";
import type { InsurerProfile, UserProfile } from "@/types/profile";

// Helper function to convert data URL to Blob (replicated from OnboardingFormProvider)
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

export default function ProfilePage() {
	const { user } = useAuth();

	// Only fetch profile when we have a valid user ID
	const {
		data: userData,
		isLoading,
		isError,
		refetch,
	} = useGetProfileQuery(user?.id?.toString() || "", {
		skip: !user?.id,
	});

	const [updateUserProfile, { isLoading: isUpdatingUser }] =
		useUpdateUserProfileMutation();
	const [updateInsurerProfile, { isLoading: isUpdatingInsurer }] =
		useUpdateInsurerProfileMutation();
	const isSubmitting = isUpdatingUser || isUpdatingInsurer;

	// Debug log to track user ID and profile data
	useEffect(() => {
		console.log("ProfilePage - User ID:", user?.id);
		console.log("ProfilePage - User data:", user);
		console.log("ProfilePage - Profile data:", userData);
	}, [user, userData]);

	const handleProfileSubmit = useCallback(
		async (formData: FormData) => {
			try {
				// Update insurer profile if it exists
				if (userData?.data.insurer) {
					await updateInsurerProfile({
						id: String(userData.data.insurer.id),
						payload: formData,
					}).unwrap();
				}

				toast.success("Profile updated successfully!");
				refetch(); // Refetch user data to get updated profile information
			} catch (error) {
				console.error("Failed to update profile:", error);
				toast.error("Failed to update profile.", {
					description: error instanceof Error ? error.message : "Unknown error",
				});
			}
		},
		[updateInsurerProfile, userData, refetch],
	);

	if (isLoading) {
		return <LoadingSpinner />;
	}

	if (isError || !userData) {
		return <p>Error: User data not found or failed to load.</p>;
	}

	// Transform userData to a format compatible with ProfilePreview and ProfileForm
	const userProfileForComponents = {
		id: String(userData.data.id),
		companyName: userData.data.insurer?.name || "",
		email: userData.data.email || "",
		description: userData.data.insurer?.description || "",
		contactEmail: userData.data.insurer?.contact_email || "",
		contactPhone: userData.data.insurer?.contact_phone || "",
		logo_url:
			userData.data.insurer?.logo_url instanceof Blob
				? URL.createObjectURL(userData.data.insurer.logo_url)
				: userData.data.insurer?.logo_url || null,
	};

	console.log(
		"ProfilePage - userProfileForComponents:",
		userProfileForComponents,
	);

	return (
		<>
			<ProfilePreview {...userProfileForComponents} />
			<ProfileForm
				initialData={{
					...userProfileForComponents,
					logo_url: userProfileForComponents.logo_url,
				}}
				onSubmit={handleProfileSubmit}
				isSubmitting={isSubmitting}
			/>
		</>
	);
}
