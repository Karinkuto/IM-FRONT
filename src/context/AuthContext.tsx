import {
  createContext,
  type ReactNode,
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
import type {
  AuthContextType,
  User as AuthUser,
  LoginCredentials,
} from "@/types/auth";
import type { User as ApiUser } from "@/types/user";
import { mapApiUserToAuthUser } from "@/utils/authUtils";
import {
  getSessionItem,
  removeSessionItem,
  setSessionItem,
} from "@/utils/sessionStorage";

// Create and export the AuthContext
export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const dispatch = useDispatch();

  const [loginMutation, { isLoading: isLoggingIn }] = useLoginMutation();
  // Use a type assertion to handle the API response
  const { refetch } = useGetUserByIdQuery(user?.id || "", {
    skip: !user?.id, // Skip if no user ID is available
  });

  const refetchUser = async () => {
    try {
      const response = await refetch();
      // Use type assertion to handle the API response
      return response.data as unknown as ApiUser | undefined;
    } catch (error) {
      console.error("Error refetching user:", error);
      return;
    }
  };

  // Restore auth state from sessionStorage on mount
  useEffect(() => {
    // Initialize auth state from session storage
    const initializeAuth = async () => {
      try {
        const session = await getSessionItem("auth");
        if (session) {
          const parsed = JSON.parse(session);
          if (parsed?.user && parsed?.access_token) {
            setUser(parsed.user);
            setIsAuthenticated(true);

            // Restore tokens to localStorage for axios interceptor
            localStorage.setItem("access_token", parsed.access_token);
            if (parsed.refresh_token) {
              localStorage.setItem("refresh_token", parsed.refresh_token);
            }

            dispatch(
              setCredentials({
                user: parsed.user,
                access_token: parsed.access_token,
              })
            );
          }
        }
      } catch (error) {
        console.error("Error initializing auth state:", error);
      } finally {
        setIsLoading(false);
      }
    };

    void initializeAuth();
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
      name,
      role: user.role,
      isTemporaryPassword: user.temporary_password,
      insurer: user.insurer, // Include the insurer data
    };
  }, [user]);

  const login = async (userData: LoginCredentials) => {
    try {
      const result = await loginMutation(userData).unwrap();

      if (!(result.data && result.data.user)) {
        toast.error("Login failed: User data not received from server.");
        console.error(
          "Login failed: User data is undefined or missing in API response.",
          result
        );
        throw new Error("User data missing from login response.");
      }

      // Use type assertion to handle the API response
      const apiUser = result.data.user as unknown as ApiUser;
      console.log("API User data received from backend:", apiUser);

      // Map API user to AuthUser type using our utility function
      const loggedInUser = mapApiUserToAuthUser(apiUser);

      console.log("Frontend determined user role:", loggedInUser.role);

      const newAccessToken = (result.data as { access_token: string })
        .access_token;
      const newRefreshToken = (result.data as { refresh_token?: string })
        .refresh_token;

      dispatch(
        setCredentials({
          user: loggedInUser,
          access_token: newAccessToken,
        })
      );
      setUser(loggedInUser);
      setIsAuthenticated(true);

      // Store tokens in localStorage for axios interceptor
      localStorage.setItem("access_token", newAccessToken);
      if (newRefreshToken) {
        localStorage.setItem("refresh_token", newRefreshToken);
      }

      // Persist to sessionStorage for app state
      await setSessionItem(
        "auth",
        JSON.stringify({
          user: loggedInUser,
          access_token: newAccessToken,
          ...(newRefreshToken && { refresh_token: newRefreshToken }),
        })
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

      const data = await refetchUser();
      if (data) {
        // Ensure the data is properly typed before mapping
        const typedData = data as unknown as ApiUser;
        const updatedUser = mapApiUserToAuthUser(typedData);
        setUser(updatedUser);

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
              })
            );

            // Update Redux store with the new user data
            dispatch(
              setCredentials({
                user: updatedUser,
                access_token: parsed.access_token,
              })
            );

            return updatedUser;
          } catch (error) {
            console.error(
              "Failed to update session storage with new user data:",
              error
            );
            throw error;
          }
        }
      }
      return null;
    } catch (error) {
      console.error("Failed to refresh user data:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await logoutUser();
      setUser(null);
      setIsAuthenticated(false);

      // Clear tokens from localStorage
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");

      // Clear session storage
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

// Export the useAuth hook
export { useAuth } from "@/hooks/useAuth";
