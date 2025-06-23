import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "@/lib/axiosBaseQuery";
import type { Insurer } from "@/types/insurer";

// Defining the insurer API slice
export const insurerApi = createApi({
	reducerPath: "insurerApi",
	baseQuery: axiosBaseQuery(),
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
		}),
	}),
});

export const { useOnboardInsurerMutation } = insurerApi;
