import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "@/lib/axiosBaseQuery";
import type {
	CreateInsuranceProductPayload,
	InsuranceProduct,
} from "@/types/product";
import type { InsuranceType } from "@/types/quotation";

export interface UpdateProductPayload extends Partial<CreateInsuranceProductPayload> {
  id: string;
}

interface ProductsResponse {
	data: InsuranceProduct[];
	meta: {
		total_pages: number;
		current_page: number;
		total_count: number;
	};
}

interface InsuranceTypesResponse {
	data: InsuranceType[];
}

export const productApi = createApi({
	reducerPath: "productApi",
	baseQuery: axiosBaseQuery(),
	tagTypes: ["Product"],
	endpoints: (builder) => ({
		createProduct: builder.mutation<
			InsuranceProduct,
			CreateInsuranceProductPayload
		>({
			query: (payload: CreateInsuranceProductPayload) => ({
				url: "/insurance_products",
				method: "POST",
				data: { payload },
			}),
			invalidatesTags: ["Product"],
		}),
		getProducts: builder.query<
			ProductsResponse,
			{
				page?: number;
				per_page?: number;
				name?: string;
				status?: string;
				coverage_type_id?: string;
			}
		>({
			query: (params: {
				page?: number;
				per_page?: number;
				name?: string;
				status?: string;
				coverage_type_id?: string;
			}) => ({
				url: "/insurance_products",
				method: "GET",
				params,
			}),
			providesTags: ["Product"],
		}),
		getProductById: builder.query<InsuranceProduct, string>({
			query: (id: string) => ({
				url: `/insurance_products/${id}`,
				method: "GET",
			}),
			providesTags: (_result, _error, id) => [{ type: "Product", id }],
		}),
		updateProduct: builder.mutation<
			InsuranceProduct,
			UpdateProductPayload
		>({
			query: ({
				id,
				...payload
			}: UpdateProductPayload) => ({
				url: `/insurance_products/${id}`,
				method: "PUT",
				data: payload,
			}),
			invalidatesTags: (_result, _error, { id }) => [{ type: "Product", id }],
		}),
		deleteProduct: builder.mutation<void, string>({
			query: (id: string) => ({
				url: `/insurance_products/${id}`,
				method: "DELETE",
			}),
			invalidatesTags: ["Product"],
		}),
		getInsuranceTypes: builder.query<InsuranceTypesResponse, void>({
			query: () => ({
				url: "/insurance_types",
				method: "GET",
			}),
		}),
		getAllInsuranceTypes: builder.query<{ data: InsuranceType[] }, void>({
			query: () => ({
				url: "/insurance_types",
				method: "GET",
			}),
		}),
	}),
});

export const {
	useCreateProductMutation,
	useGetProductsQuery,
	useGetProductByIdQuery,
	useUpdateProductMutation,
	useDeleteProductMutation,
	useGetInsuranceTypesQuery,
	useGetAllInsuranceTypesQuery,
} = productApi;
