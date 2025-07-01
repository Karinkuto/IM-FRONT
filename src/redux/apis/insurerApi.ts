import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "@/lib/axiosBaseQuery";
import type { Insurer } from "@/types/insurer";

// Define tag types for API
const TAG_TYPES = {
	Insurer: "Insurer",
	User: "User",
} as const;

// Defining the insurer API slice
export const insurerApi = createApi({
	reducerPath: "insurerApi",
	baseQuery: axiosBaseQuery(),
	tagTypes: Object.values(TAG_TYPES),
	endpoints: (builder) => ({
		onboardInsurer: builder.mutation<Insurer, FormData>({
			query: (formData) => ({
				url: "/insurers",
				method: "POST",
				data: formData,
				headers: {
					"Content-Type": "multipart/form-data",
				},
			}),
			invalidatesTags: [{ type: TAG_TYPES.User }],
		}),
		getInsurer: builder.query<Insurer, string | number>({
			query: (id) => ({
				url: `/insurers/${id}`,
				method: "GET",
			}),
			transformResponse: (response: any) => response.data,
			providesTags: (result, error, id) => [{ type: TAG_TYPES.Insurer, id }],
		}),
		patchInsurer: builder.mutation<
			Insurer,
			{ id: string | number; data: FormData }
		>({
			query: ({ id, data }) => ({
				url: `/insurers/${id}`,
				method: "PATCH",
				data,
				headers: {
					"Content-Type": "multipart/form-data",
				},
			}),
			transformResponse: (response: any) => response.data,
			invalidatesTags: (result, error, { id }) => [
				{ type: TAG_TYPES.Insurer, id },
			],
		}),
	}),
});

export const {
	useOnboardInsurerMutation,
	useGetInsurerQuery,
	usePatchInsurerMutation,
} = insurerApi;
