import { axiosBaseQuery } from "@/lib/axiosBaseQuery";
import type { User } from "@/types/auth";
import { createApi } from "@reduxjs/toolkit/query/react";

// Define the API response type
interface UsersResponse {
	data: User[];
	meta?: {
		total: number;
		page: number;
		per_page: number;
	};
}

export const usersApi = createApi({
	reducerPath: "usersApi",
	baseQuery: axiosBaseQuery(),
	tagTypes: ["User"],
	endpoints: (builder) => ({
		getAllUsers: builder.query<User[], void>({
			query: () => ({
				url: "/users",
				method: "GET",
			}),
			transformResponse: (response: UsersResponse) => {
				// Return the data array from the response
				return response.data;
			},
			providesTags: ["User"],
		}),
	}),
});

export const { useGetAllUsersQuery } = usersApi;
