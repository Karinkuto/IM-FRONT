import {
	createContext,
	type ReactNode,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";
import { loginUser, logoutUser, mockUser } from "@/services/authService";
import type { AuthContextType, LoginCredentials, User } from "@/types/auth";

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [isAuthenticated, setIsAuthenticated] = useState(false);

	const displayUser = useMemo(() => {
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
			case "customer":
				// For customer, we are not showing the name on this dashboard.
				name = "Customer"; // Fallback name, though won't be displayed in NavUser
				break;
			default:
				name = "User";
		}

		return {
			name: name,
			role: user.role,
		};
	}, [user]);

	useEffect(() => {
		const initializeAuth = async () => {
			// For development: bypass authentication and set a mock user
			setUser(mockUser);
			setIsAuthenticated(true);
		};
		initializeAuth();
	}, []);

	const login = async (userData: LoginCredentials) => {
		try {
			const loggedInUser = await loginUser(userData);
			setUser(loggedInUser);
			setIsAuthenticated(true);
			console.log("Login successful:", loggedInUser);
		} catch (error) {
			console.error("Login failed:", error);
			throw error; // Re-throw to allow components to handle login errors
		}
	};

	const logout = async () => {
		try {
			await logoutUser();
			setUser(null);
			setIsAuthenticated(false);
			console.log("Logout successful");
		} catch (error) {
			console.error("Logout failed:", error);
			throw error;
		}
	};

	return (
		<AuthContext.Provider
			value={{ user, login, logout, isAuthenticated, displayUser }}
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
