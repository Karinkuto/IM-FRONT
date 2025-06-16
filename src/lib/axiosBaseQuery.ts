import type { RootState } from "@/redux/store";
import type { BaseQueryFn } from "@reduxjs/toolkit/query";
import axios from "axios";
import type { AxiosError, AxiosRequestConfig } from "axios";

const api = axios.create({
	baseURL: import.meta.env.VITE_BACKEND_URL,
	withCredentials: true,
});

// Function to get CSRF token from meta tag
const getCsrfToken = () => {
	const tokenMeta = document.querySelector('meta[name="csrf-token"]');
	return tokenMeta ? tokenMeta.getAttribute("content") : null;
};

export const axiosBaseQuery =
	(): BaseQueryFn<
		{
			url: string;
			method: AxiosRequestConfig["method"];
			data?: AxiosRequestConfig["data"];
			params?: AxiosRequestConfig["params"];
			headers?: AxiosRequestConfig["headers"];
		},
		unknown,
		unknown,
		{ arg?: unknown; baseQueryApi: { getState: () => RootState } }
	> =>
	async ({ url, method, data, params, headers }, { getState }) => {
		const state = getState();
		const token = state.auth.token;
		const user = state.auth.user;

		if (token) {
			headers = headers || {};
			headers.Authorization = `Bearer ${token}`;
		}

		// Add CSRF token for non-GET requests
		const csrfToken = getCsrfToken();
		if (
			csrfToken &&
			method &&
			["POST", "PUT", "PATCH", "DELETE"].includes(method.toUpperCase())
		) {
			headers = headers || {};
			headers["X-CSRF-Token"] = csrfToken;
		}

		try {
			const result = await api({
				url,
				method,
				data,
				params,
				headers,
				// Add response type to handle different response formats
				responseType: "json",
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
