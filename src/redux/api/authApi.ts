import { axiosBaseQuery } from "@/lib/axiosBaseQuery";
import type { LoginCredentials, User } from "@/types/auth";
import type { InsurerProfile } from "@/types/profile";
import { createApi } from "@reduxjs/toolkit/query/react";

export interface RegisterCredentials {
	email: string;
	password: string;
	password_confirmation: string;
	role: string;
}

export interface VerifyEmailCredentials {
	token: string;
}

export interface ChangePasswordCredentials {
	new_password: string;
	new_password_confirmation: string;
	current_password?: string;
}

export interface InsurerProfilePayload {
	name: string;
	description: string;
	contact_email: string;
	contact_phone: string;
	api_endpoint: string;
	api_key: string;
	logo?: File;
}

export interface UpdateUserProfilePayload {
	email?: string;
	phone_number?: string;
	fin?: string;
	password?: string;
	password_confirmation?: string;
	logo?: File | null;
	companyName?: string;
	description?: string;
	contactEmail?: string;
	contactPhone?: string;
}

export const authApi = createApi({
	reducerPath: "authApi",
	baseQuery: axiosBaseQuery(),
	endpoints: (builder) => ({
		register: builder.mutation<{ message: string }, RegisterCredentials>({
			query: (credentials) => ({
				url: "/auth/register",
				method: "POST",
				data: {
					...credentials,
					password_confirmation:
						credentials.password_confirmation || credentials.password,
				},
			}),
		}),
		customerRegister: builder.mutation<
			{ message: string },
			RegisterCredentials
		>({
			query: (credentials) => ({
				url: "/auth/customer_register",
				method: "POST",
				data: credentials,
			}),
		}),
		verifyOtp: builder.mutation<
			{ access_token: string; user: User },
			VerifyOtpCredentials
		>({
			query: (credentials) => ({
				url: "/auth/verify_otp",
				method: "POST",
				data: credentials,
			}),
		}),
		verifyEmail: builder.mutation<{ message: string }, VerifyEmailCredentials>({
			query: (credentials) => ({
				url: "/auth/verify_email",
				method: "POST",
				data: credentials,
			}),
		}),
		changePassword: builder.mutation<
			{ message: string },
			ChangePasswordCredentials
		>({
			query: (credentials) => ({
				url: "/auth/change_password",
				method: "POST",
				data: credentials,
			}),
		}),
		createInsurerProfile: builder.mutation<
			InsurerProfile,
			FormData // Expect FormData directly
		>({
			query: (payload) => {
				console.log(
					"authApi - createInsurerProfile: Received payload:",
					payload,
				);
				if (payload instanceof FormData) {
					console.log(
						"authApi - createInsurerProfile: Payload is FormData. Contents:",
					);
					for (const pair of payload.entries()) {
						console.log(`  Key: ${pair[0]}, Value:`, pair[1]);
					}
				} else {
					console.log(
						"authApi - createInsurerProfile: Payload is NOT FormData.",
					);
				}
				return {
					url: "/insurers",
					method: "POST",
					data: payload, // Pass FormData directly
					headers: {
						// Let the browser set the correct Content-Type with boundary
						// 'Content-Type': 'multipart/form-data',
					},
				};
			},
		}),
		updateInsurerProfile: builder.mutation<InsurerProfile, { id: string; payload: FormData }>({
			query: ({ id, payload }) => {
				// Log the FormData contents for debugging
				console.log(`authApi - updateInsurerProfile: Sending PATCH request to /insurers/${id}`);
				console.log("FormData contents:");
				
				// Log all entries in the FormData
				for (const [key, value] of payload.entries()) {
					if (value instanceof File) {
						console.log(`  ${key}: [File] ${value.name} (${value.type}, ${value.size} bytes)`);
					} else {
						console.log(`  ${key}:`, value);
					}
				}

				return {
					url: `/insurers/${id}`,
					method: "PATCH",
					data: payload,
					headers: {
						// Let the browser set the correct Content-Type with boundary
						'Accept': 'application/json'
					},
				};
			},
		}),
		login: builder.mutation<
			{ access_token: string; user: User },
			LoginCredentials
		>({
			query: (credentials) => ({
				url: "/auth/login",
				method: "POST",
				data: credentials,
			}),
		}),
		refresh: builder.mutation<{ access_token: string }, void>({
			query: () => ({
				url: "/auth/refresh",
				method: "POST",
			}),
		}),
		getProfile: builder.query<User, string | number>({
			query: (id) => ({
				url: `/users/${id}`,
				method: "GET",
			}),
		}),
		updateUserProfile: builder.mutation<User, FormData>({
			query: (formData) => {
				console.log("authApi - updateUserProfile: Received FormData:");
				if (formData instanceof FormData) {
					for (const pair of formData.entries()) {
						console.log(`  Key: ${pair[0]}, Value:`, pair[1]);
					}
				}
				return {
					url: "/profile",
					method: "PATCH",
					data: formData,
				};
			},
		}),
	}),
});

export const {
	useRegisterMutation,
	useLoginMutation,
	useRefreshMutation,
	useGetProfileQuery,
	useChangePasswordMutation,
	useCreateInsurerProfileMutation,
	useUpdateInsurerProfileMutation,
	useVerifyOtpMutation,
	useVerifyEmailMutation,
	useCustomerRegisterMutation,
	useUpdateUserProfileMutation,
} = authApi;
