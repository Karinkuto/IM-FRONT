import type { User } from "@/types/auth";

export const mockUser: User = {
	id: "mock-user-123",
	name: "Insurer User",
	email: "insurer@example.com",
	role: "insurer",
};

export const fetchUser = () => {
	return new Promise<User>((resolve) => {
		setTimeout(() => {
			resolve(mockUser);
		}, 500); // Simulate network delay
	});
};

export interface LoginCredentials {
	username: string;
	password: string;
}

export const loginUser = (userData: LoginCredentials) => {
	return new Promise<User>((resolve, reject) => {
		setTimeout(() => {
			if (userData.username === "admin" && userData.password === "password") {
				resolve({ ...mockUser, name: userData.username });
			} else {
				reject(new Error("Invalid credentials"));
			}
		}, 500);
	});
};

export const logoutUser = () => {
	return new Promise<boolean>((resolve) => {
		setTimeout(() => {
			resolve(true);
		}, 500);
	});
};
