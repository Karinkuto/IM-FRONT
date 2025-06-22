export type User = {
	role: "admin" | "customer" | "insurer";
	id: string;
	name: string;
	email?: string;
	phone_number?: string;
	fin?: string;
};

export type LoginCredentials = {
	email?: string;
	phone_number?: string;
	password: string;
};

export type AuthResponse = {
	access_token: string;
	user: User;
};
