import { ModeToggle } from "@/components/shared/mode-toggle";
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
} from "@/components/ui/sidebar";
import { footerNavigation, navigationData } from "@/config/navigation";
import type { ValidRole } from "@/config/roles";
import { logout } from "@/redux/slices/authSlice";
import type { RootState } from "@/redux/store";
import type { ReactNode } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";

interface AppSidebarProps {
	role: ValidRole;
	logout: () => void;
	currentPath: string;
	user: RootState["auth"]["user"];
	footerContent?: ReactNode;
}

function AppSidebar({
	role,
	user,
	logout,
	currentPath,
	footerContent,
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
				{footerContent}
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	);
}

interface SharedDashboardLayoutProps {
	role: ValidRole;
	breadcrumbPageContent: string;
	footerContent?: ReactNode; // Optional prop for role-specific footer content
}

export function SharedDashboardLayout({
	role,
	breadcrumbPageContent,
	footerContent,
}: SharedDashboardLayoutProps) {
	const user = useSelector((state: RootState) => state.auth.user);
	const dispatch = useDispatch();
	const location = useLocation();

	if (!user) {
		// Should theoretically be handled by RoleLayout, but as a fallback
		return null; // Or a loading spinner, depending on desired behavior
	}

	return (
		<SidebarProvider defaultOpen={true}>
			<AppSidebar
				role={role}
				user={user}
				logout={() => dispatch(logout())}
				currentPath={location.pathname}
				footerContent={footerContent}
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
		</SidebarProvider>
	);
}
