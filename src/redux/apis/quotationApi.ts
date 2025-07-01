import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "@/lib/axiosBaseQuery";
import type { QuotationRequest } from "@/types/quotation";

interface QuotationsResponse {
	data: QuotationRequest[];
	meta: {
		total_pages: number;
		current_page: number;
		total_count: number;
	};
}

export const quotationApi = createApi({
	reducerPath: "quotationApi",
	baseQuery: axiosBaseQuery(),
	tagTypes: ["Quotation"],
	endpoints: (builder) => ({
		createQuotationRequest: builder.mutation<QuotationRequest, FormData>({
			query: (payload) => ({
				url: "/quotation_requests",
				method: "POST",
				data: payload,
				headers: {
					"Content-Type": "multipart/form-data",
				},
			}),
			invalidatesTags: ["Quotation"],
		}),
		getQuotationRequests: builder.query<
			QuotationsResponse,
			{
				page?: number;
				per_page?: number;
				status?: string;
				insurance_type?: string;
				coverage_type?: string;
				vehicle_type?: string;
				region?: string;
			}
		>({
			query: (params) => ({
				url: "/quotation_requests",
				method: "GET",
				params,
			}),
			providesTags: ["Quotation"],
		}),
		getQuotationRequestById: builder.query<QuotationRequest, number>({
			query: (id) => ({
				url: `/quotation_requests/${id}`,
				method: "GET",
			}),
			transformResponse: (response: {
				success: boolean;
				data: QuotationRequest;
			}) => response.data,
			providesTags: (_result, _error, id) => [{ type: "Quotation", id }],
		}),
		updateQuotationRequest: builder.mutation<
			QuotationRequest,
			{ id: number; payload: Partial<QuotationRequest> }
		>({
			query: ({ id, payload }) => ({
				url: `/quotation_requests/${id}`,
				method: "PUT",
				data: { payload },
			}),
			invalidatesTags: (_result, _error, { id }) => [{ type: "Quotation", id }],
		}),
		deleteQuotationRequest: builder.mutation<void, number>({
			query: (id) => ({
				url: `/quotation_requests/${id}`,
				method: "DELETE",
			}),
			invalidatesTags: ["Quotation"],
		}),
	}),
});

export const {
	useCreateQuotationRequestMutation,
	useGetQuotationRequestsQuery,
	useGetQuotationRequestByIdQuery,
	useUpdateQuotationRequestMutation,
	useDeleteQuotationRequestMutation,
} = quotationApi;
