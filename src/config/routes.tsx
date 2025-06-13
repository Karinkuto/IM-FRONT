import type { ReactNode } from "react";
import type { ValidRole } from "./roles";

import AdminPolicies from "@/pages/admin/AdminPolicies";
import AdminProducts from "@/pages/admin/AdminProducts";
import AdminQuotations from "@/pages/admin/AdminQuotations";
import Settings from "@/pages/settings/settings.tsx";

interface RouteConfig {
	path: string;
	element: ReactNode;
	isIndex?: boolean;
}

export const roleSpecificRoutes: Record<ValidRole, RouteConfig[]> = {
	admin: [
		// Super admin dashboard routes go here in the future
	],
	customer: [
		// Define customer routes here. Example:
		// { path: "profile", element: <CustomerProfilePage />, isIndex: true },
	],
	insurer: [
		{ path: "products", element: <AdminProducts />, isIndex: true },
		{ path: "quotation-requests", element: <AdminQuotations /> },
		{ path: "policies", element: <AdminPolicies /> },
		{ path: "settings/*", element: <Settings /> },
	],
};

export const defaultRoleRedirects: Record<ValidRole, string> = {
	admin: "/admin", // For future super admin
	customer: "/customer/home",
	insurer: "/insurer/products",
};

// All unauthenticated users would be redirected to the login page by default
export const defaultAppRedirect = "/login";
