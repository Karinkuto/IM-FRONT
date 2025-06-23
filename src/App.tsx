import {
	BrowserRouter,
	Navigate,
	Outlet,
	Route,
	Routes,
} from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ThemeProvider } from "@/components/shared/theme-provider";
import {
	defaultRoleRedirects,
	roleSpecificRoutes,
	VALID_ROLES,
} from "./config/routes.tsx";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { RoleLayout } from "./layouts/RoleLayout";
import LoginPage from "./pages/Auth/LoginPage";

export default function App() {
	return (
		<ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
			<AuthProvider>
				<ErrorBoundary>
					<BrowserRouter>
						<Routes>
							<Route path="/login" element={<LoginPage />} />
							<Route element={<ProtectedRoute />}>
								{/* Redirect root path to the authenticated user's default role path */}
								<Route path="/" element={<HomeRedirectByRole />} />

								{VALID_ROLES.map((role) => {
									const routesForRole = roleSpecificRoutes[role];
									const defaultRouteForRole = routesForRole.find(
										(r) => r.isIndex,
									)?.path;

									return (
										<Route
											key={role}
											path={`/${role}`}
											element={<RoleLayout />}
										>
											{defaultRouteForRole && (
												<Route
													index
													element={
														<Navigate to={defaultRouteForRole} replace />
													}
												/>
											)}
											{routesForRole.map((routeConfig) => (
												<Route
													key={routeConfig.path}
													path={routeConfig.path}
													element={routeConfig.element}
												/>
											))}
											<Route
												path="*"
												element={<Navigate to={`/${role}`} replace />}
											/>
										</Route>
									);
								})}
							</Route>
						</Routes>
					</BrowserRouter>
				</ErrorBoundary>
			</AuthProvider>
		</ThemeProvider>
	);
}

function ProtectedRoute() {
	const { isAuthenticated, isLoading } = useAuth();

	if (isLoading) {
		// Or a loading spinner component
		return null;
	}

	if (!isAuthenticated) {
		return <Navigate to="/login" replace />;
	}

	return <Outlet />;
}

function HomeRedirectByRole() {
	const { user } = useAuth();

	// This component will only render if isAuthenticated is true due to ProtectedRoute
	const redirectTo = user?.role ? defaultRoleRedirects[user.role] : "/login"; // Fallback, though should be covered by isAuthenticated

	return <Navigate to={redirectTo} replace />;
}
