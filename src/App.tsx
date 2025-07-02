import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
	BrowserRouter,
	Navigate,
	Outlet,
	Route,
	Routes,
} from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/ui/theme-provider.tsx";
import {
	defaultRoleRedirects,
	roleSpecificRoutes,
	VALID_ROLES,
} from "./config/routes.tsx";
import { AuthProvider } from "./context/AuthContext";
import { useAuth } from "./hooks/useAuth";
import { RoleLayout } from "./layouts/RoleLayout";
import LoginPage from "./pages/Auth/LoginPage";

const queryClient = new QueryClient();

export default function App() {
	return (
		<QueryClientProvider client={queryClient}>
			<ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
				<AuthProvider>
					<ErrorBoundary>
						<BrowserRouter>
							<Toaster />
							<Routes>
								<Route element={<LoginPage />} path="/login" />
								<Route element={<ProtectedRoute />}>
									{/* Redirect root path to the authenticated user's default role path */}
									<Route element={<HomeRedirectByRole />} path="/" />

									{VALID_ROLES.map((role) => {
										const routesForRole = roleSpecificRoutes[role];
										const defaultRouteForRole = routesForRole.find(
											(r) => r.isIndex
										)?.path;

										return (
											<Route
												element={<RoleLayout />}
												key={role}
												path={`/${role}`}
											>
												{defaultRouteForRole && (
													<Route
														element={
															<Navigate replace to={defaultRouteForRole} />
														}
														index
													/>
												)}
												{routesForRole.map((routeConfig) => (
													<Route
														element={routeConfig.element}
														key={routeConfig.path}
														path={routeConfig.path}
													/>
												))}
												<Route
													element={<Navigate replace to={`/${role}`} />}
													path="*"
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
		</QueryClientProvider>
	);
}

function ProtectedRoute() {
	const { isAuthenticated, isLoading } = useAuth();

	if (isLoading) {
		// Or a loading spinner component
		return null;
	}

	if (!isAuthenticated) {
		return <Navigate replace to="/login" />;
	}

	return <Outlet />;
}

function HomeRedirectByRole() {
	const { user } = useAuth();

	// This component will only render if isAuthenticated is true due to ProtectedRoute
	const redirectTo = user?.role ? defaultRoleRedirects[user.role] : "/login"; // Fallback, though should be covered by isAuthenticated

	return <Navigate replace to={redirectTo} />;
}
