import type { BaseQueryFn } from "@reduxjs/toolkit/query";
import { createApi } from "@reduxjs/toolkit/query/react";
import type { AxiosError, AxiosRequestConfig } from "axios";
import { axiosBaseQuery } from "@/lib/axiosBaseQuery";
import { logout, setCredentials } from "@/redux/slices/authSlice";
import type { RootState } from "@/redux/store";
import type { AuthResponse, LoginCredentials, User } from "@/types/auth";

const baseQuery = axiosBaseQuery();

const baseQueryWithReauth: BaseQueryFn<
	{
		url: string;
		method: AxiosRequestConfig["method"];
		data?: AxiosRequestConfig["data"];
		params?: AxiosRequestConfig["params"];
		headers?: AxiosRequestConfig["headers"];
	},
	unknown,
	unknown
> = async (args, api, extraOptions) => {
	let result = await baseQuery(args, api, extraOptions);

	if (result.error && (result.error as AxiosError).response?.status === 401) {
		// try to get a new token
		const refreshResult = await baseQuery(
			{ url: "/refresh_token", method: "POST" },
			api,
			extraOptions,
		);
		if (refreshResult.data) {
			const newAccessToken = (refreshResult.data as AuthResponse).access_token;
			api.dispatch(
				setCredentials({
					access_token: newAccessToken,
					user: (api.getState() as RootState).auth.user as User,
				}),
			);
			// retry the original query with new access token
			result = await baseQuery(args, api, extraOptions);
		} else {
			api.dispatch(logout());
		}
	}
	return result;
};

export const authApi = createApi({
	reducerPath: "authApi",
	baseQuery: baseQueryWithReauth,
	endpoints: (builder) => ({
		login: builder.mutation<AuthResponse, LoginCredentials>({
			query: (credentials) => ({
				url: "/auth/login",
				method: "POST",
				data: credentials,
			}),
		}),
		registerCustomer: builder.mutation<void, FormData>({
			query: (data) => ({
				url: "/auth/customer_register",
				method: "POST",
				data,
			}),
		}),
		registerInsurer: builder.mutation<void, FormData>({
			query: (data) => ({
				url: "/auth/register",
				method: "POST",
				data: { ...data, role: "insurer" },
			}),
		}),
		verifyOtp: builder.mutation<
			AuthResponse,
			{ phone_number: string; otp: string }
		>({
			query: (data) => ({
				url: "/auth/verify_otp",
				method: "POST",
				data,
			}),
		}),
		verifyEmail: builder.mutation<void, { token: string }>({
			query: (data) => ({
				url: "/auth/verify_email",
				method: "GET",
				params: data,
			}),
		}),
		refreshToken: builder.mutation<AuthResponse, void>({
			query: () => ({
				url: "/auth/refresh",
				method: "POST",
			}),
		}),
		logout: builder.mutation<void, void>({
			query: () => ({
				url: "/auth/logout",
				method: "POST",
			}),
		}),
		forgotPassword: builder.mutation<void, { email: string }>({
			query: (data) => ({
				url: "/auth/forgot_password",
				method: "POST",
				data,
			}),
		}),
		resetPassword: builder.mutation<
			void,
			{ token: string; password: string; password_confirmation: string }
		>({
			query: (data) => ({
				url: "/auth/reset_password",
				method: "POST",
				data,
			}),
		}),
		resendVerificationEmail: builder.mutation<void, { email: string }>({
			query: (data) => ({
				url: "/auth/resend_verification_email",
				method: "POST",
				data,
			}),
		}),
		changePassword: builder.mutation<
			void,
			{ new_password: string; new_password_confirmation: string }
		>({
			query: (data) => ({
				url: "/auth/change_password",
				method: "POST",
				data,
			}),
		}),
	}),
});

export const {
	useLoginMutation,
	useRegisterCustomerMutation,
	useRegisterInsurerMutation,
	useVerifyOtpMutation,
	useVerifyEmailMutation,
	useRefreshTokenMutation,
	useLogoutMutation,
	useForgotPasswordMutation,
	useResetPasswordMutation,
	useResendVerificationEmailMutation,
	useChangePasswordMutation,
} = authApi;
