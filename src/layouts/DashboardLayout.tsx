import { InsurerNav } from "@/components/shared/InsurerNav";
import { ModeToggle } from "@/components/shared/mode-toggle";
import { footerNavigation, navigationData } from "@/config/navigation";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "@/redux/slices/authSlice";
import type { RootState } from "@/redux/store";
import type { InsurerProfile } from "@/types/insurer";
import { useCallback, useEffect, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { profileService, type UserProfile } from "@/services/profileService";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { InsurerOnboardingStepper } from "@/components/admin-components/products/InsurerOnboardingStepper";

import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator as BreadcrumbSeparatorUI,
} from "@/components/ui/breadcrumb";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarInset,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarProvider,
	SidebarRail,
	SidebarSeparator,
	SidebarTrigger,
} from "@/components/ui/sidebar";
import type { ValidRole } from "@/config/roles";

interface AppSidebarProps {
	role: ValidRole;
	logout: () => void;
	currentPath: string;
	userProfile: UserProfile | null;
	user: RootState["auth"]["user"];
}

function AppSidebar({
	role,
	user,
	logout,
	currentPath,
	userProfile,
}: AppSidebarProps) {
	const navigate = useNavigate();
	const navSections = navigationData[role] || [];

	const handleLogout = async () => {
		logout();
		navigate("/login");
	};

	return (
		<Sidebar variant="inset">
			<SidebarHeader className="p-4">
				<div className="flex items-center gap-3">
					<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							fill="currentColor"
							className="h-6 w-6"
							aria-hidden="true"
						>
							<path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
						</svg>
					</div>
					<div>
						<div className="font-semibold text-lg">Tila</div>
						<div className="text-xs text-muted-foreground">
							Insurance Platform
						</div>
					</div>
				</div>
			</SidebarHeader>
			<SidebarContent className="flex-1 px-3 py-4">
				{navSections.map((section) => (
					<SidebarGroup key={section.title} className="mb-4">
						<SidebarGroupLabel className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
							{section.title}
						</SidebarGroupLabel>
						<SidebarGroupContent>
							<SidebarMenu>
								{section.items.map((item) => (
									<SidebarMenuItem key={item.link}>
										<SidebarMenuButton
											asChild
											isActive={currentPath.startsWith(item.link)}
											className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-muted-foreground"
										>
											<Link to={item.link}>
												<item.icon className="h-5 w-5" />
												<span>{item.label}</span>
											</Link>
										</SidebarMenuButton>
									</SidebarMenuItem>
								))}
							</SidebarMenu>
						</SidebarGroupContent>
					</SidebarGroup>
				))}
			</SidebarContent>
			<SidebarFooter className="p-4 mt-auto">
				<SidebarMenu>
					{footerNavigation.map((item) => (
						<SidebarMenuItem key={item.link}>
							{item.link === "/logout" ? (
								<SidebarMenuButton
									className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-muted-foreground"
									onClick={handleLogout}
								>
									<item.icon className="h-5 w-5" />
									<span>{item.label}</span>
								</SidebarMenuButton>
							) : (
								<SidebarMenuButton
									asChild
									className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-muted-foreground"
								>
									<Link to={item.link}>
										<item.icon className="h-5 w-5" />
										<span>{item.label}</span>
									</Link>
								</SidebarMenuButton>
							)}
						</SidebarMenuItem>
					))}
				</SidebarMenu>
				<SidebarSeparator className="my-4" />{" "}
				{/* Added separator for visual distinction */}
				{userProfile && (
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
				)}
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	);
}

export interface DashboardLayoutProps {
	role: ValidRole;
}

export function DashboardLayout({ role }: DashboardLayoutProps) {
	const user = useSelector((state: RootState) => state.auth.user);
	const dispatch = useDispatch();
	const location = useLocation();
	const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
	const [isLoadingProfile, setIsLoadingProfile] = useState(true);
	const navigate = useNavigate();

	useEffect(() => {
		const fetchProfile = async () => {
			try {
				const data = await profileService.fetchProfile();
				setUserProfile(data);
			} catch (error) {
				console.error(
					"Failed to fetch user profile in DashboardLayout:",
					error,
				);
			} finally {
				setIsLoadingProfile(false);
			}
		};
		fetchProfile();
	}, []);

	const handleOnboardingComplete = useCallback((profile: InsurerProfile) => {
		// Update the userProfile state to reflect the completed onboarding
		setUserProfile((prev) =>
			prev ? { ...prev, ...profile, profile_complete: true } : profile,
		);
		// Optionally navigate away from /admin to the home route if needed,
		// but for now, we'll let it stay on the current route
	}, []);

	const pathSegments = location.pathname.split("/").filter(Boolean);
	let breadcrumbPageContent = "Home";

	// Check if the path is a quotation details page (e.g., /admin/quotation-requests/123)
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

	return (
		<SidebarProvider defaultOpen={true}>
			<AppSidebar
				role={role}
				user={user}
				logout={() => dispatch(logout())}
				currentPath={location.pathname}
				userProfile={userProfile}
			/>
			<SidebarInset>
				<div className="flex h-16 items-center justify-between px-6">
					<Breadcrumb>
						<BreadcrumbList>
							<BreadcrumbItem>
								<BreadcrumbPage>Dashboard</BreadcrumbPage>
							</BreadcrumbItem>
							{breadcrumbPageContent !== "Home" && (
								<>
									<BreadcrumbSeparatorUI />
									<BreadcrumbItem>
										<BreadcrumbPage>{breadcrumbPageContent}</BreadcrumbPage>
									</BreadcrumbItem>
								</>
							)}
						</BreadcrumbList>
					</Breadcrumb>
					<ModeToggle />
				</div>
				<div className="container mx-auto px-6 py-8">
					<Outlet />
				</div>
			</SidebarInset>
			{userProfile && !userProfile.profile_complete && (
				<InsurerOnboardingStepper
					onOnboardingComplete={handleOnboardingComplete}
				/>
			)}
		</SidebarProvider>
	);
}
