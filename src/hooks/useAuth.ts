import { useContext } from "react";
import { AuthContext } from "@/context/AuthContext";
import type { AuthContextType } from "@/types/auth";

export const useAuth = (): NonNullable<AuthContextType> => {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error(
			"useAuth must be used within an AuthProvider. Make sure you have wrapped your application with <AuthProvider>.",
		);
	}
	return context;
};

export default useAuth;
