import type { ReactNode } from "react";
import type { ValidRole } from "./roles";

import AdminPolicies from "@/pages/admin/AdminPolicies";
import AdminProducts from "@/pages/admin/AdminProducts";
import AdminQuotations from "@/pages/admin/AdminQuotations";
import DetailedView from "@/pages/admin/DetailedView";
import UserManagementPage from "@/pages/admin/UserManagementPage";
import Settings from "@/pages/settings/settings.tsx";

interface RouteConfig {
  path: string;
  element: ReactNode;
  isIndex?: boolean;
}

export const roleSpecificRoutes: Record<ValidRole, RouteConfig[]> = {
  admin: [
    { path: "users", element: <UserManagementPage />, isIndex: true },
    // Future super admin dashboard routes can go here
  ],
  customer: [
    // Define customer routes here. Example:
    // { path: "profile", element: <CustomerProfilePage />, isIndex: true },
  ],
  insurer: [
    { path: "products", element: <AdminProducts />, isIndex: true },
    { path: "quotation-requests", element: <AdminQuotations /> },
    { path: "quotation-requests/:id", element: <DetailedView /> },
    { path: "policies", element: <AdminPolicies /> },
    { path: "settings/*", element: <Settings /> },
  ],
};

export const defaultRoleRedirects: Record<ValidRole, string> = {
  admin: "/admin/users",
  customer: "/customer/home",
  insurer: "/insurer/products",
};

// All unauthenticated users would be redirected to the login page by default
export const defaultAppRedirect = "/login";
