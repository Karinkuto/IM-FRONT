import { InsurerOnboardingStepper } from "@/components/onboarding/InsurerOnboardingStepper";
import { InsurerNav } from "@/components/shared/InsurerNav";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import type { ValidRole } from "@/config/roles";
import { useAuth } from "@/hooks/useAuth";
import { useGetProfileQuery } from "@/redux/api/authApi";
import type { InsurerProfile } from "@/types/profile";
import { useCallback, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { SharedDashboardLayout } from "../SharedDashboardLayout";

export interface InsurerDashboardLayoutProps {
	role: ValidRole;
}

export function InsurerDashboardLayout({ role }: InsurerDashboardLayoutProps) {
	const { user } = useAuth();

	// Only fetch profile when we have a valid user ID
	const { data: userProfileDataResponse, refetch: refetchUserProfile } =
		useGetProfileQuery(user?.id?.toString() || "", {
			skip: !user?.id,
		});

	const portalRoot = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		// Create portal root for the overlay if it doesn't exist
		const root = document.createElement("div");
		root.id = "onboarding-portal";
		document.body.appendChild(root);
		portalRoot.current = root;

		return () => {
			const portalElement = document.getElementById("onboarding-portal");
			if (portalElement) {
				document.body.removeChild(portalElement);
			}
		};
	}, []);

	const handleOnboardingComplete = useCallback(() => {
		refetchUserProfile(); // Refetch user profile after onboarding completes
	}, [refetchUserProfile]);

	const location = useLocation();
	const pathSegments = location.pathname.split("/").filter(Boolean);
	let breadcrumbPageContent = "Home";

	const isQuotationDetailsPage =
		pathSegments.includes("quotations") && pathSegments.length > 2;

	if (isQuotationDetailsPage) {
		breadcrumbPageContent = "Quotation Details";
	} else if (pathSegments.includes("quotations")) {
		breadcrumbPageContent = "Quotations";
	} else if (pathSegments.includes("profile")) {
		breadcrumbPageContent = "Profile";
	} else if (pathSegments.includes("settings")) {
		breadcrumbPageContent = "Settings";
	} else if (pathSegments.includes("dashboard")) {
		breadcrumbPageContent = "Dashboard";
	}

	// Show loading spinner while profile is loading
	if (!userProfileDataResponse?.data) {
		return <LoadingSpinner />;
	}

	// Show onboarding stepper if user has a temporary password or incomplete profile
	const showOnboardingStepper =
		!userProfileDataResponse?.data?.insurer?.profile_complete;

	return (
		<>
			{showOnboardingStepper && (
				<div className="fixed inset-0 z-50">
					<InsurerOnboardingStepper
						onOnboardingComplete={handleOnboardingComplete}
					/>
				</div>
			)}
			<SharedDashboardLayout
				role={role}
				breadcrumbPageContent={breadcrumbPageContent}
				footerContent={
					<InsurerNav
						user={
							{
								id: String(userProfileDataResponse.data.id) || "",
								role: "insurer",
								companyName:
									userProfileDataResponse.data.insurer?.name || "Insurer Name",
								email:
									userProfileDataResponse.data.email || "Insurer@example.com",
								description:
									userProfileDataResponse.data.insurer?.description || "",
								contactEmail:
									userProfileDataResponse.data.insurer?.contact_email || "",
								contactPhone:
									userProfileDataResponse.data.insurer?.contact_phone || "",
								logo_url:
									userProfileDataResponse.data.insurer?.logo_url instanceof Blob
										? URL.createObjectURL(
												userProfileDataResponse.data.insurer.logo_url,
											)
										: userProfileDataResponse.data.insurer?.logo_url || null,
								profile_complete:
									userProfileDataResponse.data.insurer?.profile_complete,
							} as InsurerProfile
						}
					/>
				}
			/>
		</>
	);
}
