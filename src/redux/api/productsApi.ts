import type { Product } from "@/components/admin-components/products/product-data-types";
import { axiosBaseQuery } from "@/lib/axiosBaseQuery";
import { createApi } from "@reduxjs/toolkit/query/react";

// Define types for insurance and coverage types
export interface InsuranceType {
	id: string;
	name: string;
	description?: string;
}

export interface CoverageType {
	id: string;
	name: string;
	insurance_type_id: string;
	description?: string;
}

interface Insurer {
	id: number;
	name: string;
	description?: string;
	contact_email?: string;
	contact_phone?: string;
	api_endpoint?: string;
	api_key?: string;
	logo_url?: string;
	profile_complete?: boolean;
}

// New interface to represent the raw product structure from the backend
interface BackendProductRaw {
	id: number;
	name: string;
	description: string;
	estimated_price: string;
	customer_rating: number | null;
	status: string;
	coverage_type: {
		id: number;
		insurance_type_id: number;
		name: string;
		description: string;
		created_at: string;
		updated_at: string;
		insurance_type?: {
			id: number;
			name: string;
			description: string;
		};
	};
	insurer: Insurer; // Use Insurer interface here
}

// Define the API response type
interface ProductsResponse {
	data: BackendProductRaw[]; // Use BackendProductRaw here
	meta?: {
		total: number;
		page: number;
		per_page: number;
	};
}

export const productsApi = createApi({
	reducerPath: "productsApi",
	baseQuery: axiosBaseQuery(),
	tagTypes: ["Product", "InsuranceType", "CoverageType"],
	endpoints: (builder) => ({
		getProducts: builder.query<Product[], void>({
			query: () => ({
				url: "/insurance_products",
				method: "GET",
			}),
			transformResponse: (response: ProductsResponse) => {
				// Transform the response to match the frontend Product type
				return response.data.map((product) => {
					return {
						id: product.id.toString(),
						insuranceType: "", // Set to empty string, will be enriched by AdminProducts.tsx
						insuranceTypeId:
							product.coverage_type?.insurance_type_id?.toString() || "",
						coverageType: product.coverage_type?.name || "",
						coverageTypeId: product.coverage_type?.id?.toString() || "",
						description: product.description,
						pricing: Number.parseFloat(product.estimated_price) || 0,
						status: product.status || "",
					};
				});
			},
			providesTags: ["Product"],
		}),

		getProductById: builder.query<Product, string>({
			query: (id) => ({
				url: `/insurance_products/${id}`,
				method: "GET",
			}),
			transformResponse: (response: { data: BackendProductRaw }) => {
				const product = response.data;
				return {
					id: product.id.toString(),
					insuranceType: "", // Set to empty string, will be enriched by AdminProducts.tsx
					insuranceTypeId:
						product.coverage_type?.insurance_type_id?.toString() || "",
					coverageType: product.coverage_type?.name || "",
					coverageTypeId: product.coverage_type?.id?.toString() || "",
					description: product.description,
					pricing: Number.parseFloat(product.estimated_price) || 0,
					status: product.status || "",
				};
			},
			providesTags: (result, error, id) => [{ type: "Product", id }],
		}),

		createProduct: builder.mutation<{ data: Product }, Partial<Product>>({
			query: (productData) => ({
				url: "/insurance_products",
				method: "POST",
				data: {
					payload: {
						name: productData.coverageType, // Using coverageType as name
						description: productData.description,
						estimated_price: productData.pricing,
						coverage_type_id: productData.coverageType, // This should be the ID in a real app
						status: "active",
					},
				},
			}),
			invalidatesTags: ["Product"],
		}),

		updateProduct: builder.mutation<{ data: Product }, Partial<Product>>({
			query: ({ id, ...updates }) => ({
				url: `/insurance_products/${id}`,
				method: "PUT",
				data: {
					payload: {
						name: updates.coverageType,
						description: updates.description,
						estimated_price: updates.pricing,
						coverage_type_id: updates.coverageTypeId,
						status: updates.status || "active",
					},
				},
			}),
			invalidatesTags: (result, error, { id }) => [
				{ type: "Product", id },
				{ type: "Product" },
			],
		}),

		deleteProduct: builder.mutation<void, string>({
			query: (id) => ({
				url: `/insurance_products/${id}`,
				method: "DELETE",
			}),
			invalidatesTags: ["Product"],
		}),

		// Get all insurance types
		getInsuranceTypes: builder.query<InsuranceType[], void>({
			query: () => ({
				url: "/insurance_types",
				method: "GET",
			}),
			transformResponse: (response: { data: InsuranceType[] }) => response.data,
			providesTags: ["InsuranceType"],
		}),

		// Get coverage types by insurance type ID
		getCoverageTypes: builder.query<CoverageType[], string>({
			query: (insuranceTypeId) => ({
				url: `/insurance_types/${insuranceTypeId}/coverage_types`,
				method: "GET",
			}),
			transformResponse: (response: { data: CoverageType[] }) => response.data,
			providesTags: (result, error, insuranceTypeId) => [
				{ type: "CoverageType", id: insuranceTypeId },
			],
		}),
	}),
});

export const {
	useGetProductsQuery,
	useGetProductByIdQuery,
	useCreateProductMutation,
	useUpdateProductMutation,
	useDeleteProductMutation,
	useGetInsuranceTypesQuery,
	useGetCoverageTypesQuery,
} = productsApi;
