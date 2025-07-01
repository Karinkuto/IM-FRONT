import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "@/lib/axiosBaseQuery";
import type { AuthResponse, LoginCredentials } from "@/types/auth";

// Define tag types for API
const TAG_TYPES = {
	User: "User",
	Auth: "Auth",
} as const;

export const authApi = createApi({
	reducerPath: "authApi",
	tagTypes: Object.values(TAG_TYPES),
	baseQuery: axiosBaseQuery(),
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
			{
				current_password?: string;
				new_password: string;
				new_password_confirmation: string;
			}
		>({
			query: (data) => ({
				url: "/auth/change_password",
				method: "POST",
				data,
			}),
			invalidatesTags: ["User"],
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
