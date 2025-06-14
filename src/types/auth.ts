
export type UserRole = "admin" | "customer" | "insurer";

export type User = {
  temporary_password: any;
  id: number;
  email?: string | null;
  phone_number?: string | null;
  fin?: string | null;
  verified: boolean;
  roles: Array<{
    id: number;
    name: UserRole;
    created_at: string;
    updated_at: string;
  }>;
  // For backward compatibility
  role?: UserRole;
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
