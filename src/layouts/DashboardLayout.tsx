import { useEffect, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { InsurerOnboarding } from "@/components/insurer-components/onboarding/InsurerOnboarding"; // Import the new dialog component
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator as BreadcrumbSeparatorUI,
} from "@/components/ui/breadcrumb";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { NavUser } from "@/components/ui/NavUser";
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
import { footerNavigation, navigationData } from "@/config/navigation"; // Added footerNavigation back
import type { ValidRole } from "@/config/routes";
import { useAuth } from "@/hooks/useAuth";
import { useGetInsurerQuery } from "@/redux/apis/insurerApi";

interface AppSidebarProps {
	role: ValidRole;
	logout: ReturnType<typeof useAuth>["logout"];
	currentPath: string; // Add currentPath to props
	currentUserData: ReturnType<typeof useAuth>["currentUserData"]; // Renamed from displayUser to currentUserData
	user: ReturnType<typeof useAuth>["user"]; // Add user prop
}

function AppSidebar({
	role,
	currentUserData,
	user,
	logout,
	currentPath,
}: AppSidebarProps) {
	const navigate = useNavigate();

	// Fetch live insurer data for logo_url if user is insurer
	const insurerId =
		user?.insurer && "id" in user.insurer ? String(user.insurer.id) : undefined;
	const { data: liveInsurer } = useGetInsurerQuery(insurerId || "", {
		skip: !insurerId,
	});

	const navSections = navigationData[role] || [];
	// currentPath is now passed as a prop

	const handleLogout = async () => {
		await logout();
		navigate("/login");
	};

	return (
		<Sidebar variant="inset">
			<SidebarHeader className="p-4">
				<div className="flex items-center gap-3">
					<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
						{/* You can replace this with an actual SVG logo if you have one */}
						<svg
							aria-hidden="true"
							className="h-6 w-6"
							fill="currentColor"
							viewBox="0 0 24 24"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
						</svg>
					</div>
					<div>
						<div className="font-semibold text-lg">Tila</div>
						<div className="text-muted-foreground text-xs">
							Insurance Platform
						</div>
					</div>
				</div>
			</SidebarHeader>
			<SidebarContent className="flex-1 px-3 py-4">
				{navSections.map((section) => (
					<SidebarGroup className="mb-4" key={section.title}>
						<SidebarGroupLabel className="px-3 py-2 font-semibold text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400">
							{section.title}
						</SidebarGroupLabel>
						<SidebarGroupContent>
							<SidebarMenu>
								{section.items.map((item) => (
									<SidebarMenuItem key={item.link}>
										<SidebarMenuButton
											asChild
											className="flex items-center gap-3 rounded-lg px-4 py-3 font-medium text-muted-foreground text-sm"
											isActive={currentPath.startsWith(item.link)}
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
			<SidebarFooter className="mt-auto p-4">
				<SidebarMenu>
					{footerNavigation.map((item) => {
						let link = item.link;
						if (link.includes(":role")) {
							link = link.replace(":role", role);
						}
						const isActive = currentPath.startsWith(link);

						return (
							<SidebarMenuItem key={item.link}>
								{item.link === "/logout" ? (
									<SidebarMenuButton
										className="flex items-center gap-3 rounded-lg px-4 py-3 font-medium text-muted-foreground text-sm"
										onClick={handleLogout}
									>
										<item.icon className="h-5 w-5" />
										<span>{item.label}</span>
									</SidebarMenuButton>
								) : (
									<SidebarMenuButton
										asChild
										className="flex items-center gap-3 rounded-lg px-4 py-3 font-medium text-muted-foreground text-sm"
										isActive={isActive}
									>
										<Link to={link}>
											<item.icon className="h-5 w-5" />
											<span>{item.label}</span>
										</Link>
									</SidebarMenuButton>
								)}
							</SidebarMenuItem>
						);
					})}
				</SidebarMenu>
				<SidebarSeparator className="my-4" />{" "}
				{/* Added separator for visual distinction */}
				{currentUserData && (
					<NavUser
						user={{
							name:
								user?.role === "insurer"
									? liveInsurer?.name || currentUserData.name
									: currentUserData.name,
							email: user?.email || "",
							role: currentUserData.role,
							avatar:
								user?.role === "insurer"
									? liveInsurer?.logo_url || currentUserData.insurer?.logo_url
									: currentUserData.insurer?.logo_url,
						}}
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

// Move regex to top-level scope for performance
const DASH_REGEX = /-/g;
const DIGITS_REGEX = /^\d+$/;

export function DashboardLayout({ role }: DashboardLayoutProps) {
	const { logout, user, currentUserData } = useAuth();
	const location = useLocation();

	const isTemporaryPassword = currentUserData?.isTemporaryPassword;
	const hasInsurerProfile = Boolean(user?.insurer);

	const [showOnboarding, setShowOnboarding] = useState(false);

	useEffect(() => {
		// Show onboarding if the user has an insurer role AND has a temporary password
		setShowOnboarding(role === "insurer" && Boolean(isTemporaryPassword));
	}, [role, isTemporaryPassword]);

	const handleCloseOnboarding = () => {
		setShowOnboarding(false);
	};

	const pathSegments = location.pathname.split("/").filter(Boolean);
	let breadcrumbPageContent = "Home";

	// Check if the path is a quotation details page (e.g., /admin/quotation-requests/123)
	const isQuotationDetailsPage =
		pathSegments.length >= 3 &&
		pathSegments.at(-2) === "quotation-requests" &&
		DIGITS_REGEX.test(pathSegments.at(-1) ?? "");

	if (isQuotationDetailsPage) {
		const quotationId = pathSegments.at(-1);
		breadcrumbPageContent = `Request #${quotationId}`;
	} else {
		// Existing logic for other pages
		const lastSegment = pathSegments.pop() ?? "Home";
		breadcrumbPageContent = lastSegment.replace(DASH_REGEX, " ") || "Home";
	}

	// Update document title when breadcrumbPageContent changes
	useEffect(() => {
		document.title = `Tila | ${breadcrumbPageContent.charAt(0).toUpperCase() + breadcrumbPageContent.slice(1)}`;
	}, [breadcrumbPageContent]);

	return (
		<SidebarProvider>
			<AppSidebar
				currentPath={location.pathname}
				currentUserData={currentUserData}
				logout={logout}
				role={role}
				user={user}
			/>
			<SidebarInset>
				<header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
					<SidebarTrigger className="-ml-1" />
					<Breadcrumb>
						<BreadcrumbList>
							<BreadcrumbItem className="hidden md:block">
								<BreadcrumbPage>
									{role.charAt(0).toUpperCase() + role.slice(1)}
								</BreadcrumbPage>
							</BreadcrumbItem>
							<BreadcrumbSeparatorUI className="hidden md:block" />
							<BreadcrumbItem>
								<BreadcrumbPage className="capitalize">
									{breadcrumbPageContent}
								</BreadcrumbPage>
							</BreadcrumbItem>
						</BreadcrumbList>
					</Breadcrumb>
					<div className="ml-auto">
						<ModeToggle />
					</div>
				</header>
				<main className="flex flex-1 flex-col gap-4 px-8 py-4">
					<Outlet />
					{showOnboarding && (
						<InsurerOnboarding
							hasInsurerProfile={hasInsurerProfile}
							isTemporaryPassword={isTemporaryPassword}
							onClose={handleCloseOnboarding}
							role={role}
						/>
					)}
				</main>
			</SidebarInset>
		</SidebarProvider>
	);
}
