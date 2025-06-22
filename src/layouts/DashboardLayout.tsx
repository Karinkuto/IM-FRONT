"use client";
import { useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { ModeToggle } from "@/components/shared/mode-toggle";
import { NavUser } from "@/components/shared/NavUser";
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
import { footerNavigation, navigationData } from "@/config/navigation"; // Added footerNavigation back
import type { ValidRole } from "@/config/routes";
import { useAuth } from "@/context/AuthContext"; // Import useAuth hook

interface AppSidebarProps {
	role: ValidRole;
	logout: ReturnType<typeof useAuth>["logout"];
	currentPath: string; // Add currentPath to props
	displayUser: ReturnType<typeof useAuth>["displayUser"]; // Add displayUser to props
}

function AppSidebar({
	role,
	displayUser,
	logout,
	currentPath, // Destructure currentPath
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
				{displayUser && (
					<NavUser
						user={{
							name: displayUser.name,
							email: "", // Email is not shown, provide an empty string or remove if not strictly needed by NavUser's prop
							role: displayUser.role,
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
	const { logout, displayUser } = useAuth();
	const location = useLocation();

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
				displayUser={displayUser}
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
							{isQuotationDetailsPage && (
								<>
									<BreadcrumbSeparatorUI className="hidden md:block" />
									<BreadcrumbItem className="hidden md:block">
										<Link to={`/${role}/quotation-requests`}>
											<BreadcrumbPage>Quotation Requests</BreadcrumbPage>
										</Link>
									</BreadcrumbItem>
								</>
							)}
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
				</main>
			</SidebarInset>
		</SidebarProvider>
	);
}
