import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "@/lib/axiosBaseQuery";
import type { User } from "@/types/user";

export const userApi = createApi({
	reducerPath: "userApi",
	baseQuery: axiosBaseQuery(),
	tagTypes: ["User"],
	endpoints: (builder) => ({
		getUsers: builder.query<User[], void>({
			query: () => ({
				url: "/users",
				method: "GET",
			}),
			transformResponse: (response: { data: User[] }) => response.data,
			providesTags: (result) =>
				result
					? [
							...result.map(({ id }) => ({ type: "User" as const, id })),
							{ type: "User", id: "LIST" },
						]
					: [{ type: "User", id: "LIST" }],
		}),
		getUserById: builder.query<User, string>({
			query: (id) => ({
				url: `/users/${id}`,
				method: "GET",
			}),
			transformResponse: (response: { data: User }) => response.data,
			providesTags: (_result, _error, id) => [{ type: "User", id }],
			// Add retry configuration to prevent infinite retries on auth errors
			extraOptions: {
				maxRetries: 0, // Disable automatic retries
			},
		}),
		createUser: builder.mutation<User, Partial<User> & { role: string }>({
			query: (payload) => ({
				url: "/auth/register",
				method: "POST",
				data: payload,
			}),
			invalidatesTags: ["User"],
		}),
		updateUser: builder.mutation<
			User,
			{ id: string | number; email?: string; phone_number?: string }
		>({
			query: ({ id, ...patch }) => ({
				url: `/users/${id}`,
				method: "PATCH",
				data: { payload: patch },
			}),
			invalidatesTags: (_result, _error, { id }) => [
				{ type: "User", id },
				{ type: "User", id: "LIST" },
			],
		}),
		// Add more endpoints (create, update, delete) as needed
	}),
});

export const {
	useGetUsersQuery,
	useGetUserByIdQuery,
	useCreateUserMutation,
	useUpdateUserMutation,
} = userApi;
