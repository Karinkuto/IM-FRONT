import type { InsurerProfile } from "./insurer";

export type User = {
	role: "admin" | "customer" | "insurer";
	id: string;
	name: string;
	email?: string;
};

export type AuthContextType = {
	user: User | null;
	login: (userData: LoginCredentials) => Promise<void>;
	logout: () => Promise<void>;
	isAuthenticated: boolean;
	isLoading: boolean;
};

export type LoginCredentials = {
	email?: string;
	phone_number?: string;
	password: string;
};
