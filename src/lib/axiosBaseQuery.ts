import type { BaseQueryFn } from "@reduxjs/toolkit/query";
import type { AxiosError, AxiosRequestConfig } from "axios";
import axios from "axios";
import { logout } from "@/redux/slices/authSlice";
import type { RootState } from "@/redux/store";

const api = axios.create({
	baseURL: import.meta.env.VITE_API_URL,
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
		unknown,
		{ getState: () => RootState }
	> =>
	async ({ url, method, data, params, headers }, { getState, dispatch }) => {
		const state = getState() as RootState;
		const token = state.auth?.access_token;

		if (token) {
			headers = headers || {};
			headers.Authorization = `Bearer ${token}`;
		}

		try {
			const result = await api({
				url,
				method,
				data,
				params,
				headers,
				responseType: "json",
			});
			return { data: result.data };
		} catch (axiosError) {
			const err = axiosError as AxiosError;
			if (err.response?.status === 401) {
				dispatch(logout());
			}
			return {
				error: {
					status: err.response?.status,
					data: err.response?.data || err.message,
				},
			};
		}
	};
