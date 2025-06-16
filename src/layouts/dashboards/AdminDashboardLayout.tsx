import { AdminNav } from "@/components/shared/AdminNav";
import type { ValidRole } from "@/config/roles";
import type { RootState } from "@/redux/store";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { SharedDashboardLayout } from "../SharedDashboardLayout";

export interface AdminDashboardLayoutProps {
	role: ValidRole;
}

export function AdminDashboardLayout({ role }: AdminDashboardLayoutProps) {
	const location = useLocation();
	const user = useSelector((state: RootState) => state.auth.user);

	const pathSegments = location.pathname.split("/").filter(Boolean);
	let breadcrumbPageContent = "Home";

	if (location.pathname === "/admin/users") {
		breadcrumbPageContent = "User Management";
	} else if (pathSegments.length > 1) {
		breadcrumbPageContent = pathSegments[pathSegments.length - 1]
			.replace(/-/g, " ")
			.replace(/\b\w/g, (char) => char.toUpperCase());
	}

	return (
		<SharedDashboardLayout
			role={role}
			breadcrumbPageContent={breadcrumbPageContent}
			footerContent={user ? <AdminNav user={user} /> : null}
		/>
	);
}
