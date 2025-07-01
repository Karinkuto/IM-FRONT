import {
	createContext,
	type ReactNode,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import { useLoginMutation } from "@/redux/apis/authApi";
import { useGetUserByIdQuery } from "@/redux/apis/userApi";
import { setCredentials } from "@/redux/slices/authSlice";
import { logoutUser } from "@/services/authService";
import type { AuthContextType, LoginCredentials, User } from "@/types/auth";
import {
	setItem as setSessionItem,
	getItem as getSessionItem,
	removeItem as removeSessionItem,
} from "@/lib/secureSessionStorage";

const AuthContext = createContext<AuthContextType | null>(null);

// Utility function to map user.ts User to auth.ts User
function mapUserToAuthUser(
	user: import("@/types/user").User,
): import("@/types/auth").User {
	return {
		id: String(user.id),
		role: (user.role ?? "customer") as "admin" | "customer" | "insurer",
		name: user.name,
		email: user.email,
		phone_number: user.phone_number ?? undefined,
		fin: user.fin ?? undefined,
		temporary_password:
			typeof user.temporary_password === "boolean"
				? user.temporary_password
				: undefined,
		customer: user.customer
			? {
					first_name: user.customer.first_name,
					middle_name: user.customer.middle_name,
					last_name: user.customer.last_name,
				}
			: undefined,
		insurer: user.insurer ? { name: user.insurer.name } : undefined,
		roles: Array.isArray(user.roles)
			? user.roles.map((r: any) => ({
					id: r.id,
					name: r.name as "admin" | "customer" | "insurer",
				}))
			: undefined,
	};
}

export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [isLoading, setIsLoading] = useState(true);

	const dispatch = useDispatch();

	const [loginMutation, { isLoading: isLoggingIn }] = useLoginMutation();
	const { refetch: refetchUser } = useGetUserByIdQuery(user?.id || "", {
		skip: !user?.id, // Skip if no user ID is available
	});

	// Restore auth state from sessionStorage on mount
	useEffect(() => {
		(async () => {
			const stored = await getSessionItem("auth");
			if (stored) {
				try {
					const parsed = JSON.parse(stored);
					if (parsed && parsed.user && parsed.access_token) {
						setUser(parsed.user);
						setIsAuthenticated(true);
						dispatch(
							setCredentials({
								user: parsed.user,
								access_token: parsed.access_token,
							}),
						);
					}
				} catch {}
			}
			setIsLoading(false);
		})();
	}, [dispatch]);

	const currentUserData = useMemo(() => {
		if (!user) {
			return null;
		}

		let name = "";
		switch (user.role) {
			case "admin":
				name = user.email || "Admin User"; // Use email for admin, fallback to 'Admin User'
				break;
			case "insurer":
				name = user.insurer?.name || "Insurer";
				break;
			default:
				name = "User";
		}

		return {
			name: name,
			role: user.role,
			isTemporaryPassword: user.temporary_password,
			insurer: user.insurer, // Include the insurer data
		};
	}, [user]);

	const login = async (userData: LoginCredentials) => {
		try {
			const result = await loginMutation(userData).unwrap();

			if (!result.data || !result.data.user) {
				toast.error("Login failed: User data not received from server.");
				console.error(
					"Login failed: User data is undefined or missing in API response.",
					result,
				);
				throw new Error("User data missing from login response.");
			}

			const apiUser = result.data.user;
			console.log("API User data received from backend:", apiUser);

			// Ensure user data is correctly extracted and formatted
			const loggedInUser: User = {
				...apiUser,
				role:
					apiUser.roles && apiUser.roles.length > 0
						? (apiUser.roles[0].name as "admin" | "customer" | "insurer")
						: "customer",
				id: apiUser.id || "",
				name: apiUser.name || apiUser.email || apiUser.phone_number || "User",
				email: apiUser.email || "",
				phone_number: apiUser.phone_number || "",
				fin: apiUser.fin || "",
				temporary_password: apiUser.temporary_password || false,
				customer: apiUser.customer,
				insurer: apiUser.insurer,
			};

			console.log("Frontend determined user role:", loggedInUser.role);

			const newAccessToken = (result.data as { access_token: string })
				.access_token;

			dispatch(
				setCredentials({
					user: loggedInUser,
					access_token: newAccessToken,
				}),
			);
			setUser(loggedInUser);
			setIsAuthenticated(true);
			// Persist to sessionStorage
			await setSessionItem(
				"auth",
				JSON.stringify({ user: loggedInUser, access_token: newAccessToken }),
			);
			toast.success("Login successful!");
		} catch (error: unknown) {
			let errorMessage = "Login failed. Please check your credentials.";
			if (
				typeof error === "object" &&
				error !== null &&
				"data" in error &&
				typeof (error as { data?: { message?: unknown } }).data?.message ===
					"string"
			) {
				errorMessage = (error as { data: { message: string } }).data.message;
			}
			toast.error(errorMessage);
			console.error("Login failed:", error);
			throw error;
		}
	};

	const refreshUser = async () => {
		try {
			if (!user?.id) return null;

			const { data } = await refetchUser();
			if (data) {
				const updatedUser = data;
				setUser(updatedUser);
				dispatch(
					setCredentials({
						user: updatedUser,
						// The token is already in the store, no need to update it
						access_token: "",
					}),
				);
				// Update sessionStorage with new user info (keep access_token)
				const stored = await getSessionItem("auth");
				if (stored) {
					try {
						const parsed = JSON.parse(stored);
						await setSessionItem(
							"auth",
							JSON.stringify({
								user: updatedUser,
								access_token: parsed.access_token,
							}),
						);
					} catch {}
				}
				return updatedUser;
			}
		} catch (error) {
			console.error("Failed to refresh user data:", error);
		}
		return null;
	};

	const logout = async () => {
		try {
			await logoutUser();
			setUser(null);
			setIsAuthenticated(false);
			await removeSessionItem("auth");
			toast.success("Logged out successfully!");
			console.log("Logout successful");
		} catch (error) {
			toast.error("Logout failed.");
			console.error("Logout failed:", error);
			throw error;
		}
	};

	return (
		<AuthContext.Provider
			value={{
				user,
				login,
				logout,
				refreshUser,
				isAuthenticated,
				currentUserData,
				isLoading: isLoading || isLoggingIn,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
}

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
};
