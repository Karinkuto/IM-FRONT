import {
	createContext,
	type ReactNode,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";
import { logoutUser } from "@/services/authService";
import type { AuthContextType, LoginCredentials, User } from "@/types/auth";
import { toast } from "sonner";
import { useLoginMutation } from "@/redux/apis/authApi";
import { setCredentials } from "@/redux/slices/authSlice";
import { useDispatch } from "react-redux";

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [isLoading, setIsLoading] = useState(true);

	const dispatch = useDispatch();

	const [loginMutation, { isLoading: isLoggingIn }] = useLoginMutation();

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
		};
	}, [user]);

	useEffect(() => {

		setIsLoading(false);

		// In a real application, you might try to load a persisted user from storage
		// and set isAuthenticated based on that.
	}, []);

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

			// Ensure user data is correctly extracted and formatted
			const loggedInUser: User = {
				...apiUser,
				role: (apiUser.roles?.[0]?.name || "customer") as
					| "admin"
					| "customer"
					| "insurer",
				id: apiUser.id || "",
				name: apiUser.name || apiUser.email || apiUser.phone_number || "User",
				email: apiUser.email || "",
				phone_number: apiUser.phone_number || "",
				fin: apiUser.fin || "",
				temporary_password: apiUser.temporary_password || false,
				customer: apiUser.customer,
				insurer: apiUser.insurer,
			};

			dispatch(
				setCredentials({
					user: loggedInUser,
					access_token: result.data.access_token,
				}),
			);
			setUser(loggedInUser);
			setIsAuthenticated(true);
			toast.success("Login successful!");

		} catch (error: any) {
			const errorMessage =
				error?.data?.message || "Login failed. Please check your credentials.";
			toast.error(errorMessage);
			console.error("Login failed:", error);
			throw error; // Re-throw to allow components to handle login errors
		}
	};

	const logout = async () => {
		try {
			await logoutUser();
			setUser(null);
			setIsAuthenticated(false);
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
