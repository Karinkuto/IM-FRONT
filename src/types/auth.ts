export type UserRole = "admin" | "customer" | "insurer";

export interface Role {
	id: number;
	name: UserRole;
	created_at: string;
	updated_at: string;
}

export interface CustomerBase {
	id: number;
	created_at: string;
	updated_at: string;
	// Add other common customer fields here
}

export interface Customer extends CustomerBase {
	// Add specific customer fields here
	user_id?: number;
	// Add other customer-specific fields as needed
}

export interface InsurerBase {
	id: number;
	created_at: string;
	updated_at: string;
	// Add other common insurer fields here
}

export interface Insurer extends InsurerBase {
	// Add specific insurer fields here
	user_id?: number;
	name?: string;
	description?: string;
	contact_email?: string;
	contact_phone?: string;
	api_endpoint?: string;
	api_key?: string;
	logo_url?: string;
	profile_complete?: boolean;
	// Add other insurer-specific fields as needed
}

export interface User {
	id: number;
	email: string;
	verified: boolean;
	phone_number: string | null;
	fin: string | null;
	temporary_password: boolean;
	roles: Role[];
	created_at: string;
	updated_at: string;
	customer: Customer | null;
	insurer: Insurer | null;
	// For backward compatibility
	role?: UserRole;
}

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
