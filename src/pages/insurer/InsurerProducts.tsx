import { PlusCircle } from "lucide-react";
import type React from "react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ProductDialog } from "@/components/insurer-components/products/modals/ProductDialog";
import { ProductsTable } from "@/components/insurer-components/products/ProductsTable";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
	useCreateProductMutation,
	useDeleteProductMutation,
	useGetInsuranceTypesQuery,
	useGetProductsQuery,
	useUpdateProductMutation,
} from "@/redux/apis/productApi";
import type {
	CreateInsuranceProductPayload,
	InsuranceProduct,
	Product,
} from "@/types/product";

const AdminProducts: React.FC = () => {
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
	const [selectedProductForEdit, setSelectedProductForEdit] =
		useState<Product | null>(null);

	// RTK Query hooks
	const { data, isLoading, error, refetch } = useGetProductsQuery({});
	const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();
	const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();
	const [deleteProduct] = useDeleteProductMutation();
	const {
		data: insuranceTypesData,
		isLoading: isLoadingInsuranceTypes,
		error: insuranceTypesError,
	} = useGetInsuranceTypesQuery();

	const handleCreateProduct = async (
		newProduct: Product | Omit<Product, "id">
	) => {
		try {
			// Map the Product type to CreateInsuranceProductPayload
			const payload: CreateInsuranceProductPayload = {
				name: newProduct.name,
				description: newProduct.description || "",
				estimated_price: Number(newProduct.pricing) || 0,
				customer_rating: 0, // Default value
				status: "active", // Default value
				coverage_type_id: newProduct.coverageType || "",
			};
			await createProduct(payload).unwrap();
			setIsCreateDialogOpen(false);
			refetch();
		} catch {
			toast.error("Failed to create product");
		}
	};

	// Add mapping function
	function mapInsuranceProductToProduct(
		p: InsuranceProduct
	): Product & { status?: string; customer_rating?: number | null } {
		return {
			id: p.id,
			name: p.name,
			insuranceType: p.coverage_type?.insurance_type?.id
				? String(p.coverage_type.insurance_type.id)
				: "",
			coverageType: p.coverage_type?.id ? String(p.coverage_type.id) : "",
			description: p.description || "",
			pricing: Number(p.estimated_price) || 0, // Ensure pricing is always a number
			status: p.status,
			customer_rating: p.customer_rating,
		};
	}

	const handleEditProduct = (productId: string) => {
		const insuranceProduct = data?.data.find((p) => p.id === productId) || null;
		const productToEdit = insuranceProduct
			? mapInsuranceProductToProduct(insuranceProduct)
			: null;
		setSelectedProductForEdit(productToEdit);
		setIsEditDialogOpen(true);
	};

	const handleProductUpdate = async (
		product:
			| (Product & { status?: string; customer_rating?: number | null })
			| Omit<Product, "id">
	) => {
		// If product has no id, do nothing (should not happen in edit mode)
		if (!("id" in product)) return;

		// Find the original product data to get the status and rating
		const originalProduct = data?.data.find((p) => p.id === product.id);

		const payload = {
			id: product.id,
			name: product.name,
			description: product.description,
			estimated_price: Number(product.pricing),
			// Use the original product's status and rating, or fallback to defaults
			status: product.status || originalProduct?.status || "draft",
			// Convert null to undefined to match the API's expected type
			customer_rating:
				(product.customer_rating ?? originalProduct?.customer_rating ?? 0) ||
				undefined,
			coverage_type_id: product.coverageType,
		};

		try {
			await updateProduct(payload).unwrap();
			refetch();
			setIsEditDialogOpen(false);
		} catch {
			toast.error("Failed to update product");
		}
	};

	const handleDeleteProduct = async (productId: string) => {
		try {
			await deleteProduct(productId).unwrap();
			refetch();
		} catch {
			toast.error("Failed to delete product");
		}
	};

	// Build coverageTypeId -> { coverageTypeName, insuranceTypeName } map
	const coverageTypesMap = useMemo(() => {
		if (!insuranceTypesData?.data) return {};
		const map: Record<
			string,
			{ coverageTypeName: string; insuranceTypeName: string }
		> = {};
		for (const insuranceType of insuranceTypesData.data) {
			if (insuranceType.coverage_types) {
				for (const coverageType of insuranceType.coverage_types) {
					const coverageTypeId =
						"id" in coverageType ? coverageType.id : String(coverageType);
					const coverageTypeName =
						"name" in coverageType ? coverageType.name : "Unknown";
					map[coverageTypeId] = {
						coverageTypeName,
						insuranceTypeName: insuranceType.name,
					};
				}
			}
		}
		return map;
	}, [insuranceTypesData]);

	if (isLoading || isLoadingInsuranceTypes) {
		return <LoadingSpinner />;
	}

	if (error || insuranceTypesError) {
		return (
			<div className="flex h-full min-h-[calc(100vh-80px)] items-center justify-center text-red-500">
				<p className="font-medium text-lg">
					{(() => {
						const getErrorStatus = (err: unknown) => {
							if (err && typeof err === "object") {
								const status = (err as { status?: unknown }).status;
								if (status !== null && status !== undefined) {
									return String(status);
								}
							}
							return null;
						};

						const errorStatus = error ? getErrorStatus(error) : null;
						const insuranceErrorStatus = insuranceTypesError
							? getErrorStatus(insuranceTypesError)
							: null;

						return `Error: ${errorStatus || insuranceErrorStatus || "Unknown error"}`;
					})()}
				</p>
			</div>
		);
	}

	const products = data?.data || [];

	return (
		<div className="container mx-auto">
			<div className="mb-6 flex items-start justify-between">
				<div>
					<h1 className="font-bold text-3xl">Manage Products</h1>
					<p className="text-muted-foreground text-sm">
						Create, edit, and delete insurance products offered to customers.
					</p>
				</div>
			</div>

			<ProductsTable
				coverageTypesMap={coverageTypesMap}
				onDeleteProduct={handleDeleteProduct}
				onEditProduct={handleEditProduct}
				products={products}
				toolbarActionsPrefix={
					<Button onClick={() => setIsCreateDialogOpen(true)}>
						<PlusCircle className="mr-2 h-4 w-4" /> Create Product
					</Button>
				}
			/>

			<ProductDialog
				isLoading={isCreating}
				isOpen={isCreateDialogOpen}
				mode="create"
				onOpenChange={setIsCreateDialogOpen}
				onSubmit={handleCreateProduct}
			/>

			<ProductDialog
				isLoading={isUpdating}
				isOpen={isEditDialogOpen}
				mode="edit"
				onOpenChange={setIsEditDialogOpen}
				onSubmit={handleProductUpdate}
				product={selectedProductForEdit}
			/>

			{products.length === 0 && (
				<p className="mt-4 text-center text-gray-500">
					No products found. Click "Create Product" to add one.
				</p>
			)}
		</div>
	);
};

export default AdminProducts;
