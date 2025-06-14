import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ThemeProvider } from "@/components/shared/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { VALID_ROLES } from "./config/roles";
import {
	defaultAppRedirect,
	defaultRoleRedirects,
	roleSpecificRoutes,
} from "./config/routes.tsx";
import { RoleLayout } from "./layouts/RoleLayout";
import LoginPage from "./pages/Auth/LoginPage";

export default function App() {
	return (
		<ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
			<ErrorBoundary>
				<BrowserRouter>
					<Routes>
						<Route
							path="/"
							element={<Navigate to={defaultAppRedirect} replace />}
						/>
						<Route path="/login" element={<LoginPage />} />

						{VALID_ROLES.map((role) => {
							const routesForRole = roleSpecificRoutes[role];
							const defaultRouteForRole =
								routesForRole.find((r) => r.isIndex)?.path ||
								defaultRoleRedirects[role];

							return (
								<Route key={role} path={`/${role}`} element={<RoleLayout />}>
									<Route
										index
										element={<Navigate to={defaultRouteForRole} replace />}
									/>
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
					</Routes>
				</BrowserRouter>
			</ErrorBoundary>
			<Toaster />
		</ThemeProvider>
	);
}
