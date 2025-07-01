// Simple sessionStorage wrapper with TypeScript support

type StorageValue = string | number | boolean | object;

export const getSessionItem = (key: string): string | null => {
	if (typeof window === "undefined") return null;
	try {
		return sessionStorage.getItem(key);
	} catch (error) {
		console.error("Error accessing sessionStorage:", error);
		return null;
	}
};

export const setSessionItem = (key: string, value: string): void => {
	if (typeof window === "undefined") return;
	try {
		sessionStorage.setItem(key, value);
	} catch (error) {
		console.error("Error setting sessionStorage item:", error);
	}
};

export const removeSessionItem = (key: string): void => {
	if (typeof window === "undefined") return;
	try {
		sessionStorage.removeItem(key);
	} catch (error) {
		console.error("Error removing sessionStorage item:", error);
	}
};

// Helper functions for JSON data
export const getJsonItem = <T>(key: string): T | null => {
	const item = getSessionItem(key);
	if (!item) return null;
	try {
		return JSON.parse(item) as T;
	} catch (error) {
		console.error("Error parsing sessionStorage JSON:", error);
		return null;
	}
};

export const setJsonItem = (key: string, value: StorageValue): void => {
	try {
		setSessionItem(key, JSON.stringify(value));
	} catch (error) {
		console.error("Error stringifying value for sessionStorage:", error);
	}
};
