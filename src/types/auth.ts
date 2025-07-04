export type User = {
	role: "admin" | "customer" | "insurer";
	id: string;
	name?: string;
	email?: string;
	phone_number?: string;
	fin?: string;
	temporary_password?: boolean;
	customer?: {
		first_name?: string;
		middle_name?: string;
		last_name?: string;
	};
	insurer?: {
		id: string | number;
		name: string;
	};
	roles?: {
		id: number;
		name: "admin" | "customer" | "insurer";
		[key: string]: unknown;
	}[];
};

export type LoginCredentials = {
	email?: string;
	phone_number?: string;
	password: string;
};

export type AuthResponse = {
	success: boolean;
	data: {
		access_token: string;
		user: User;
	};
};

export type AuthContextType = {
	user: User | null;
	currentUserData: {
		name: string;
		role: string;
		isTemporaryPassword?: boolean;
		insurer?: {
			id: string | number;
			name: string;
			logo_url?: string;
		};
	} | null;
	login: (credentials: LoginCredentials) => Promise<void>;
	logout: () => Promise<void>;
	refreshUser: () => Promise<User | null>;
	isAuthenticated: boolean;
	isLoading: boolean;
};
