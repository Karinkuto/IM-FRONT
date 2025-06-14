import type { RootState } from "@/redux/store";
import type { BaseQueryFn } from "@reduxjs/toolkit/query";
import axios from "axios";
import type { AxiosError, AxiosRequestConfig } from "axios";

const api = axios.create({
	baseURL: import.meta.env.VITE_BACKEND_URL,
	withCredentials: true,
});

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
		if (token) {
			headers = headers || {};
			headers.Authorization = `Bearer ${token}`;
		}

		try {
			const result = await api({ url, method, data, params, headers });
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
