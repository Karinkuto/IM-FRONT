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
import { useAuth } from "@/context/AuthContext"; // Import useAuth hook

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
					{footerNavigation.map((item) => {
						let link = item.link;
						if (link.includes(":role")) {
							link = link.replace(":role", role);
						}
						return (
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
							name: currentUserData.name,
							email: user?.email || "", // Get email from the user object
							role: currentUserData.role,
							avatar: currentUserData.insurer?.logo_url,
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

export function DashboardLayout({ role }: DashboardLayoutProps) {
	const { logout, user, currentUserData } = useAuth();
	const location = useLocation();

	const isTemporaryPassword = currentUserData?.isTemporaryPassword;
	const hasInsurerProfile = Boolean(user?.insurer);

	const [showOnboarding, setShowOnboarding] = useState(false);

	useEffect(() => {
		// Show onboarding if the user has an insurer role AND (has a temporary password OR does not have an insurer profile)
		setShowOnboarding(
			role === "insurer" &&
				(Boolean(isTemporaryPassword) || !hasInsurerProfile),
		);
	}, [role, isTemporaryPassword, hasInsurerProfile]);

	const handleCloseOnboarding = () => {
		setShowOnboarding(false);
	};

	const pathSegments = location.pathname.split("/").filter(Boolean);
	let breadcrumbPageContent = "Home";

	// Check if the path is a quotation details page (e.g., /admin/quotation-requests/123)
	const isQuotationDetailsPage =
		pathSegments.length >= 3 &&
		pathSegments[pathSegments.length - 2] === "quotation-requests" &&
		/^\d+$/.test(pathSegments[pathSegments.length - 1]);

	if (isQuotationDetailsPage) {
		const quotationId = pathSegments[pathSegments.length - 1];
		breadcrumbPageContent = `Request #${quotationId}`;
	} else {
		// Existing logic for other pages
		breadcrumbPageContent = pathSegments.pop()?.replace(/-/g, " ") || "Home";
	}

	// Update document title when breadcrumbPageContent changes
	useEffect(() => {
		document.title = `Tila | ${breadcrumbPageContent.charAt(0).toUpperCase() + breadcrumbPageContent.slice(1)}`;
	}, [breadcrumbPageContent]);

	return (
		<SidebarProvider>
			<AppSidebar
				role={role}
				currentUserData={currentUserData}
				user={user}
				logout={logout}
				currentPath={location.pathname}
			/>
			<SidebarInset>
				<header className="flex h-16 shrink-0 items-center gap-2 px-4 border-b">
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
				<main className="flex flex-1 flex-col gap-4 py-4 px-8">
					<Outlet />
					{showOnboarding && (
						<InsurerOnboarding
							role={role}
							isTemporaryPassword={isTemporaryPassword}
							hasInsurerProfile={hasInsurerProfile}
							onClose={handleCloseOnboarding}
						/>
					)}
				</main>
			</SidebarInset>
		</SidebarProvider>
	);
}
