import { axiosBaseQuery } from "@/lib/axiosBaseQuery";
import type { LoginCredentials, User } from "@/types/auth";
import { createApi } from "@reduxjs/toolkit/query/react";

export interface RegisterCredentials {
  email: string;
  password: string;
  password_confirmation: string;
  role: string;
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
          password_confirmation: credentials.password_confirmation || credentials.password,
        },
			}),
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
		getProfile: builder.query<User, void>({
			query: () => ({
				url: "/profile",
				method: "GET",
			}),
		}),
	}),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useRefreshMutation,
  useGetProfileQuery,
} = authApi;
