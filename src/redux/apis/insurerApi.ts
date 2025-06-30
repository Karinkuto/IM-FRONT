import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "@/lib/axiosBaseQuery";
import type { Insurer } from "@/types/insurer";

// Define tag types for API
const TAG_TYPES = {
  Insurer: 'Insurer',
  User: 'User',
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
	}),
});

export const { useOnboardInsurerMutation } = insurerApi;
