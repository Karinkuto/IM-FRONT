import { PlusCircle } from "lucide-react";
import type React from "react";
import { useMemo, useState } from "react";
import { ProductDialog } from "@/components/admin-components/products/modals/ProductDialog";
import { ProductsTable } from "@/components/admin-components/products/ProductsTable";
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
		newProduct: CreateInsuranceProductPayload,
	) => {
		try {
			await createProduct(newProduct).unwrap();
			refetch();
		} catch (err) {
			// handle error (show toast, etc)
			console.error("Failed to create product:", err);
		}
	};

	// Add mapping function
	function mapInsuranceProductToProduct(p: InsuranceProduct): Product {
		console.log("[MAP] Raw InsuranceProduct:", p);
		return {
			id: p.id,
			name: p.name,
			insuranceType: p.coverage_type?.insurance_type_id
				? String(p.coverage_type.insurance_type_id)
				: "",
			coverageType: p.coverage_type?.id ? String(p.coverage_type.id) : "",
			description: p.description,
			pricing: p.estimated_price,
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
		updatedProduct: Partial<InsuranceProduct> & { id: string },
	) => {
		try {
			await updateProduct({
				id: updatedProduct.id,
				payload: updatedProduct,
			}).unwrap();
			refetch();
		} catch (err) {
			// handle error (show toast, etc)
			console.error("Failed to update product:", err);
		}
	};

	const handleDeleteProduct = async (productId: string) => {
		try {
			await deleteProduct(productId).unwrap();
			refetch();
		} catch (err) {
			// handle error (show toast, etc)
			console.error("Failed to delete product:", err);
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
			for (const coverageType of insuranceType.coverage_types) {
				map[coverageType.id] = {
					coverageTypeName: coverageType.name,
					insuranceTypeName: insuranceType.name,
				};
			}
		}
		return map;
	}, [insuranceTypesData]);

	if (isLoading || isLoadingInsuranceTypes) {
		return <LoadingSpinner />;
	}

	if (error || insuranceTypesError) {
		return (
			<div className="flex justify-center items-center h-full min-h-[calc(100vh-80px)] text-red-500">
				<p className="text-lg font-medium">
					Error:{" "}
					{"status" in (error || insuranceTypesError)
						? (error as { status?: string })?.status ||
							(insuranceTypesError as { status?: string })?.status
						: "Unknown error"}
				</p>
			</div>
		);
	}

	const products = data?.data || [];

	return (
		<div className="container mx-auto">
			<div className="flex justify-between items-start mb-6">
				<div>
					<h1 className="text-3xl font-bold">Manage Products</h1>
					<p className="text-muted-foreground text-sm">
						Create, edit, and delete insurance products offered to customers.
					</p>
				</div>
			</div>

			<ProductsTable
				products={products}
				onEditProduct={handleEditProduct}
				onDeleteProduct={handleDeleteProduct}
				coverageTypesMap={coverageTypesMap}
				toolbarActionsPrefix={
					<Button onClick={() => setIsCreateDialogOpen(true)}>
						<PlusCircle className="mr-2 h-4 w-4" /> Create Product
					</Button>
				}
			/>

			<ProductDialog
				mode="create"
				isOpen={isCreateDialogOpen}
				onOpenChange={setIsCreateDialogOpen}
				onSubmit={handleCreateProduct}
				isLoading={isCreating}
			/>

			<ProductDialog
				mode="edit"
				isOpen={isEditDialogOpen}
				onOpenChange={setIsEditDialogOpen}
				onSubmit={handleProductUpdate}
				product={selectedProductForEdit}
				isLoading={isUpdating}
			/>

			{products.length === 0 && (
				<p className="text-center text-gray-500 mt-4">
					No products found. Click "Create Product" to add one.
				</p>
			)}
		</div>
	);
};

export default AdminProducts;
