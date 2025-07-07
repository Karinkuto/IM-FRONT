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

import type { LoginCredentials } from "@/types/auth";

export const loginUser = (userData: LoginCredentials) => {
	return new Promise<User>((resolve, reject) => {
		setTimeout(() => {
			if (
				userData.email === "admin@example.com" &&
				userData.password === "password"
			) {
				resolve({
					...mockUser,
					name: userData.email || "Admin",
					role: "admin",
				});
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
