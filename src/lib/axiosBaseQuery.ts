import type { BaseQueryFn } from "@reduxjs/toolkit/query";
import type { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";
import axios from "axios";
import { logout, setCredentials } from "@/redux/slices/authSlice";
import type { RootState } from "@/redux/store";

const api = axios.create({
	baseURL: import.meta.env.VITE_BACKEND_URL,
	withCredentials: true, // Important for sending cookies
	timeout: 10000,
});

// Flag to prevent multiple simultaneous refresh attempts
let isRefreshing = false;
let failedQueue: Array<{
	resolve: (value: unknown) => void;
	reject: (error: unknown) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
	failedQueue.forEach((prom) => {
		if (error) {
			prom.reject(error);
		} else {
			prom.resolve(token);
		}
	});
	failedQueue = [];
};

export const axiosBaseQuery = (): BaseQueryFn<
	{
		url: string;
		method: AxiosRequestConfig["method"];
		data?: AxiosRequestConfig["data"];
		params?: AxiosRequestConfig["params"];
		headers?: AxiosRequestConfig["headers"];
		meta?: Record<string, unknown>;
	},
	unknown,
	unknown
> => {
	return async (args, { getState, dispatch }) => {
		const state = getState() as RootState;
		const token = state.auth?.access_token;

		// Set up request config
		const config: AxiosRequestConfig = {
			url: args.url,
			method: args.method,
			data: args.data,
			params: args.params,
			headers: {
				...args.headers,
				...(token ? { Authorization: `Bearer ${token}` } : {}),
			},
			withCredentials: true,
		};

		try {
			const result = await api(config);
			return { data: result.data };
		} catch (error) {
			const axiosError = error as AxiosError;
			const status = axiosError.response?.status;

			// If unauthorized and this is not a refresh token request
			if (status === 401 && !args.url.includes("/auth/refresh")) {
				const originalRequest = { ...config };

				// If already refreshing, add to queue
				if (isRefreshing) {
					return new Promise((resolve, reject) => {
						failedQueue.push({ resolve, reject });
					})
						.then(() => {
							return api(originalRequest);
						})
						.then((response: AxiosResponse) => {
							return { data: response.data };
						});
				}

				isRefreshing = true;

				try {
					// Try to refresh the token
					const refreshResponse = await api.post("/auth/refresh");
					const { access_token, user } = refreshResponse.data.data;

					// Update the store with new token
					dispatch(setCredentials({ access_token, user }));

					// Update the token for the original request
					originalRequest.headers = {
						...originalRequest.headers,
						Authorization: `Bearer ${access_token}`,
					};

					// Process queued requests
					processQueue(null, access_token);

					// Retry the original request
					const result = await api(originalRequest);
					return { data: result.data };
				} catch (refreshError) {
					// If refresh fails, log the user out
					processQueue(new Error("Failed to refresh token"));
					dispatch(logout());
					return {
						error: {
							status: 401,
							data: "Session expired. Please log in again.",
						},
					};
				} finally {
					isRefreshing = false;
				}
			}

			// For other errors, return the error
			return {
				error: {
					status: status,
					data: axiosError.response?.data || axiosError.message,
				},
			};
		}
	};
};
