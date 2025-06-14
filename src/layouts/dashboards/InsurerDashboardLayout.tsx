import { SharedDashboardLayout } from "../SharedDashboardLayout";
import { InsurerNav } from "@/components/shared/InsurerNav";
import { InsurerOnboardingStepper } from "@/components/admin-components/products/InsurerOnboardingStepper";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { profileService, type UserProfile } from "@/services/profileService";
import type { InsurerProfile } from "@/types/insurer";
import type { ValidRole } from "@/config/roles";
import { useCallback, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

export interface InsurerDashboardLayoutProps {
	role: ValidRole;
}

export function InsurerDashboardLayout({ role }: InsurerDashboardLayoutProps) {
	const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
	const [isLoadingProfile, setIsLoadingProfile] = useState(true);

	useEffect(() => {
		const fetchProfile = async () => {
			try {
				const data = await profileService.fetchProfile();
				setUserProfile(data);
			} catch (error) {
				console.error(
					"Failed to fetch user profile in InsurerDashboardLayout:",
					error,
				);
			} finally {
				setIsLoadingProfile(false);
			}
		};
		fetchProfile();
	}, []);

	const handleOnboardingComplete = useCallback((profile: InsurerProfile) => {
		setUserProfile((prev) =>
			prev ? { ...prev, ...profile, profile_complete: true } : profile,
		);
	}, []);

	const location = useLocation();
	const pathSegments = location.pathname.split("/").filter(Boolean);
	let breadcrumbPageContent = "Home";

	const isQuotationDetailsPage =
		pathSegments.length >= 3 &&
		pathSegments[1] === "quotation-requests" &&
		!Number.isNaN(Number.parseInt(pathSegments[2]));

	if (location.pathname === "/admin/settings/profile") {
		breadcrumbPageContent = "Profile Settings";
	} else if (location.pathname === "/admin/settings/security") {
		breadcrumbPageContent = "Security Settings";
	} else if (isQuotationDetailsPage) {
		breadcrumbPageContent = `Quotation Request #${pathSegments[2]}`;
	} else if (pathSegments.length > 1) {
		breadcrumbPageContent = pathSegments[pathSegments.length - 1]
			.replace(/-/g, " ")
			.replace(/\b\w/g, (char) => char.toUpperCase());
	}

	if (isLoadingProfile || !userProfile) {
		return <LoadingSpinner />;
	}

	// If profile is not complete, show only the onboarding stepper
	if (!userProfile?.profile_complete) {
		return (
			<InsurerOnboardingStepper
				onOnboardingComplete={handleOnboardingComplete}
			/>
		);
	}

	return (
		<SharedDashboardLayout
			role={role}
			breadcrumbPageContent={breadcrumbPageContent}
			footerContent={
				<InsurerNav
					user={
						{
							id: userProfile.id || "",
							role: "insurer",
							companyName: userProfile.companyName || "User Name",
							email: userProfile.email || "user@example.com",
							description: userProfile.description || "",
							contactEmail: userProfile.contactEmail || "",
							contactPhone: userProfile.contactPhone || "",
							logo_url:
								userProfile.logo_url instanceof Blob
									? URL.createObjectURL(userProfile.logo_url)
									: userProfile.logo_url,
							profile_complete: true,
						} as InsurerProfile
					}
				/>
			}
		/>
	);
}
