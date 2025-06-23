import type { ReactNode } from "react";
import UserManagementPage from "@/pages/admin/UserManagementPage";
import InsurerPolicies from "@/pages/insurer/InsurerPolicies";
import InsurerProducts from "@/pages/insurer/InsurerProducts";
import InsurerQuotations from "@/pages/insurer/InsurerQuotations";

export const VALID_ROLES = ["admin", "customer", "insurer"] as const;
export type ValidRole = (typeof VALID_ROLES)[number];

interface RouteConfig {
	path: string;
	element: ReactNode;
	isIndex?: boolean;
}

export const roleSpecificRoutes: Record<ValidRole, RouteConfig[]> = {
	insurer: [
		// Define admin routes here. Example:
		// { path: "dashboard", element: <AdminDashboardPage />, isIndex: true },
		{ path: "products", element: <InsurerProducts />, isIndex: true },
		{
			path: "quotation-requests",
			element: <InsurerQuotations />,
		},
		{ path: "policies", element: <InsurerPolicies /> },
	],
	customer: [
		// Define customer routes here. Example:
		// { path: "profile", element: <CustomerProfilePage />, isIndex: true },
	],
	admin: [
		// Define insurer routes here. Example:
		// { path: "home", element: <AdminHome />, isIndex: true },
		// { path: "listings", element: <AdminUserManagement /> },
		{ path: "users", element: <UserManagementPage />, isIndex: true },
	],
};

export const defaultRoleRedirects: Record<ValidRole, string> = {
	admin: "/admin/users", // Adjusted to redirect to the user management page
	customer: "/customer", // Adjusted to match a potential "home" path for customer
	insurer: "/insurer",
};

// This can be dynamic based on logged-in user's role in a real app
// For now, defaulting to insurer. You might want to change this or handle it based on auth context.
export const defaultAppRedirect = defaultRoleRedirects.insurer;
