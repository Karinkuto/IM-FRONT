import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { defaultRoleRedirects } from "@/config/paths";
import { VALID_ROLES, type ValidRole } from "@/config/roles";
import type { RootState } from "@/redux/store";
import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";
import { AdminDashboardLayout } from "./dashboards/AdminDashboardLayout";
import { InsurerDashboardLayout } from "./dashboards/InsurerDashboardLayout";

export function RoleLayout() {
	const location = useLocation();
	const pathRole = location.pathname.split("/")[1];
	const { isAuthenticated, user } = useSelector(
		(state: RootState) => state.auth,
	);
	const isLoading = false; // Assuming auth state is immediately available after login

	// Display a loading spinner while authentication is in progress
	if (isLoading) {
		return <LoadingSpinner />;
	}

	// If not authenticated, redirect to login page
	if (!isAuthenticated) {
		return <Navigate to="/login" replace />;
	}

	// If the user's actual role doesn't match the path role, redirect to their default dashboard
	// Or if the path role itself is not a valid role (e.g., /invalid-role)
	if (
		user &&
		(user.role !== (pathRole as ValidRole) ||
			!VALID_ROLES.includes(pathRole as ValidRole))
	) {
		const userDefaultPath = defaultRoleRedirects[user.role];
		return <Navigate to={userDefaultPath} replace />;
	}

	// At this point, isAuthenticated is true, and user is not null (due to setCredentials logic)

	// Render the appropriate dashboard layout based on the user's role
	// We know user exists and user.role matches pathRole here (or we've redirected)
	const currentRole = user?.role as ValidRole; // user is not null here

	if (currentRole === "admin") {
		return <AdminDashboardLayout role={currentRole} />;
	}
	if (currentRole === "insurer" || currentRole === "customer") {
		return <InsurerDashboardLayout role={currentRole} />;
	}

	// This part should ideally not be reached if VALID_ROLES covers all possibilities
	// and the redirects are handled correctly. Fallback to login for unexpected states.
	console.warn(
		"Unexpected state in RoleLayout: No matching layout found for user role.",
	);
	return <Navigate to="/login" replace />;
}
