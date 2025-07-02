import type { BaseQueryFn } from "@reduxjs/toolkit/query";
import type { AxiosError, AxiosRequestConfig } from "axios";
import axios from "axios";

// Authentication is handled via localStorage and redirects

// Create a custom axios instance with interceptors
const api = axios.create({
	baseURL: import.meta.env.VITE_BACKEND_URL,
	headers: {
		"Content-Type": "application/json",
		Accept: "application/json",
	},
	withCredentials: true,
});

// Queue for requests that need to wait for token refresh
let isRefreshing = false;
let failedQueue: Array<{
	resolve: (token: string) => void;
	reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
	failedQueue.forEach((prom) => {
		if (error) {
			prom.reject(error);
		} else if (token) {
			prom.resolve(token);
		} else {
			prom.reject(new Error("No token provided"));
		}
	});
	failedQueue = [];
};

// Add a request interceptor to include the token in each request
api.interceptors.request.use(
	(config) => {
		const token = localStorage.getItem("access_token");
		if (token && config.headers) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

// Add a response interceptor to handle token refresh
api.interceptors.response.use(
	(response) => response,
	async (error) => {
		const originalRequest = error.config;

		// If the error status is 401 and we haven't already tried to refresh
		if (error.response?.status === 401 && !originalRequest._retry) {
			if (isRefreshing) {
				// If we're already refreshing, queue the request
				return new Promise((resolve, reject) => {
					failedQueue.push({ resolve, reject });
				})
					.then((token) => {
						originalRequest.headers.Authorization = `Bearer ${token}`;
						return api(originalRequest);
					})
					.catch((err) => {
						return Promise.reject(err);
					});
			}

			originalRequest._retry = true;
			isRefreshing = true;

			try {
				// Try to refresh the token
				const refreshResponse = await api.post("/auth/refresh");
				const { access_token } = refreshResponse.data.data;

				// Store the new token in localStorage
				localStorage.setItem("access_token", access_token);

				// Update the token for the original request
				if (originalRequest.headers) {
					originalRequest.headers.Authorization = `Bearer ${access_token}`;
				}

				// Process queued requests
				processQueue(null, access_token);

				// Retry the original request
				return api(originalRequest);
			} catch (refreshError) {
				// If refresh fails, clear the queue and log the user out
				processQueue(refreshError, null);
				localStorage.removeItem("access_token");
				window.location.href = "/login";
				return Promise.reject(refreshError);
			} finally {
				isRefreshing = false;
			}
		}

		return Promise.reject(error);
	}
);

export const axiosBaseQuery = (): BaseQueryFn<
	{
		url: string;
		method: AxiosRequestConfig["method"];
		data?: AxiosRequestConfig["data"];
		params?: AxiosRequestConfig["params"];
		headers?: AxiosRequestConfig["headers"];
	},
	unknown,
	unknown
> => {
	return async ({ url, method, data, params, headers = {} }) => {
		try {
			const result = await api({
				url,
				method,
				data,
				params,
				headers: {
					...headers,
				},
			});
			return { data: result.data };
		} catch (axiosError) {
			const err = axiosError as AxiosError;
			return {
				error: {
					status: err.response?.status,
					data: err.response?.data || err.message,
				},
			};
		}
	};
};
