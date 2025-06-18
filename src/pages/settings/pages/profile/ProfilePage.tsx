import { useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useAuth } from '@/hooks/useAuth';
import {
  useGetProfileQuery,
  useUpdateInsurerProfileMutation
} from '@/redux/api/authApi';
import { ProfileForm } from '../page-sections/profile/ProfileForm';
import { ProfilePreview } from '../page-sections/profile/ProfilePreview';

// Define the error type for better type safety
interface ApiError {
  data?: {
    error?: string;
  };
  error?: string | { message?: string };
  message?: string;
}

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

	// Initialize mutation
	const [updateInsurerProfile, { isLoading: isUpdatingInsurer }] =
		useUpdateInsurerProfileMutation();
	const isSubmitting = isUpdatingInsurer;

	// Debug log to track user ID and profile data
	useEffect(() => {
		console.log('[ProfilePage] User data updated:', {
			userId: user?.id,
			hasInsurer: !!userData?.data.insurer,
			insurerId: userData?.data.insurer?.id
		});
	}, [user, userData]);

	const handleProfileSubmit = useCallback(
		async (formData: FormData) => {
			try {
				// Log the form data being submitted
				console.log("ProfilePage - Submitting form data:");
				for (const [key, value] of formData.entries()) {
					if (value instanceof File) {
						console.log(`  ${key}: [File] ${value.name} (${value.type}, ${value.size} bytes)`);
					} else {
						console.log(`  ${key}:`, value);
					}
				}

				// Update insurer profile if it exists
				if (userData?.data.insurer) {
					console.log("Updating insurer profile with ID:", userData.data.insurer.id);
					const result = await updateInsurerProfile({
						id: String(userData.data.insurer.id),
						payload: formData,
					}).unwrap();

					console.log("Update insurer profile response:", result);
				} else {
					console.log("No insurer profile found, skipping update");
				}

				toast.success("Profile updated successfully!");
				// Refetch user data to get updated profile information
				await refetch();
			} catch (error) {
				console.error('Failed to update profile:', error);

				// Extract detailed error message if available
				let errorMessage = 'Failed to update profile';

				// Type guard to check if error is an object with expected properties
				const apiError = error as ApiError;

				if (apiError?.data?.error) {
					errorMessage += `: ${apiError.data.error}`;
				} else if (typeof apiError?.error === 'string') {
					errorMessage += `: ${apiError.error}`;
				} else if (typeof apiError?.error === 'object' && apiError.error?.message) {
					errorMessage += `: ${apiError.error.message}`;
				} else if (apiError?.message) {
					errorMessage += `: ${apiError.message}`;
				} else if (error instanceof Error) {
					errorMessage += `: ${error.message}`;
				}

				toast.error(errorMessage);
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
		description: userData.data.insurer?.description || "",
		contactEmail: userData.data.insurer?.contact_email || "",
		contactPhone: userData.data.insurer?.contact_phone || "",
		apiEndpoint: userData.data.insurer?.api_endpoint || "",
		apiKey: userData.data.insurer?.api_key || "",
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
