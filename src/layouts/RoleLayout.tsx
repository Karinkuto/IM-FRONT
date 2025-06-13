import { defaultRoleRedirects } from "@/config/paths";
import { VALID_ROLES, type ValidRole } from "@/config/roles";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import { Navigate, useLocation } from "react-router-dom";
import { DashboardLayout } from "./DashboardLayout";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export function RoleLayout() {
	const location = useLocation();
	const role = location.pathname.split("/")[1];
	const { isAuthenticated, user } = useSelector(
		(state: RootState) => state.auth,
	);
	// If you have a loading state in Redux, you can use it here
	// const isLoading = useSelector((state: RootState) => state.auth.isLoading);
	const isLoading = false; // Set to false if you don't have a loading state

	// Display a loading spinner while authentication is in progress
	if (isLoading) {
		return <LoadingSpinner />;
	}

	// If not authenticated, redirect to login page
	if (!isAuthenticated) {
		return <Navigate to="/login" replace />;
	}

	// If authenticated, but the route's role doesn't match the user's role, redirect to the user's default role path.
	if (user && user.role !== (role as ValidRole)) {
		const userDefaultPath = defaultRoleRedirects[user.role];
		return <Navigate to={userDefaultPath} replace />;
	}

	// If authenticated, but role is invalid for the route, redirect to admin if admin, or login
	if (!VALID_ROLES.includes(role as ValidRole)) {
		return user?.role === "admin" ? (
			<Navigate to="/admin" replace />
		) : (
			<Navigate to="/login" replace />
		);
	}

	return <DashboardLayout role={role as ValidRole} />;
}
