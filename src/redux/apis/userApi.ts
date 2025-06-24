import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "@/lib/axiosBaseQuery";
import type { User } from "@/types/auth";

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
			providesTags: ["User"],
		}),
		getUserById: builder.query<User, string>({
			query: (id) => ({
				url: `/users/${id}`,
				method: "GET",
			}),
			transformResponse: (response: { data: User }) => response.data,
			providesTags: ["User"],
		}),
		// Add more endpoints (create, update, delete) as needed
	}),
});

export const { useGetUsersQuery, useGetUserByIdQuery } = userApi;
