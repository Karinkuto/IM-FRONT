import { InsurerOnboardingStepper } from "@/components/admin-components/products/InsurerOnboardingStepper.tsx";
import { ProductsTable } from "@/components/admin-components/products/ProductsTable.tsx";
import { CreateProductDialog } from "@/components/admin-components/products/modals/CreateProductDialog";
import { EditProductDialog } from "@/components/admin-components/products/modals/EditProductDialog";
import type { Product } from "@/components/admin-components/products/product-data-types";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
	createProduct,
	deleteProduct,
	fetchProducts,
	updateProduct,
} from "@/services/productService";
import type React from "react";
import { useEffect, useState } from "react";

const AdminProducts: React.FC = () => {
	const [products, setProducts] = useState<Product[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
	const [selectedProductForEdit, setSelectedProductForEdit] =
		useState<Product | null>(null);
	const [showOnboarding, setShowOnboarding] = useState(true);

	useEffect(() => {
		const getProducts = async () => {
			setIsLoading(true);
			setError(null);
			try {
				const fetchedProducts = await fetchProducts();
				setProducts(fetchedProducts);
			} catch (err) {
				setError(err as Error);
			} finally {
				setIsLoading(false);
			}
		};
		// Only fetch products if the onboarding stepper is not shown
		if (!showOnboarding) {
			getProducts();
		}
	}, [showOnboarding]);

	const handleCreateProduct = async (newProduct: Product) => {
		const createdProduct = await createProduct(newProduct);
		setProducts((prevProducts) => [...prevProducts, createdProduct]);
		console.log("Creating product:", createdProduct);
	};

	const handleEditProduct = (productId: string) => {
		const productToEdit = products.find((p) => p.id === productId);
		if (productToEdit) {
			setSelectedProductForEdit(productToEdit);
			setIsEditDialogOpen(true);
		}
	};

	const handleProductUpdate = async (updatedProduct: Product) => {
		try {
			const result = await updateProduct(updatedProduct);
			setProducts((prevProducts) =>
				prevProducts.map((p) => (p.id === result.id ? result : p)),
			);
			console.log("Updating product:", result);
		} catch (err) {
			console.error("Failed to update product:", err);
		}
	};

	const handleDeleteProduct = async (productId: string) => {
		const success = await deleteProduct(productId);
		if (success) {
			setProducts((prevProducts) =>
				prevProducts.filter((p) => p.id !== productId),
			);
			console.log("Deleting product:", productId);
		}
	};

	const handleOnboardingComplete = () => {
		setShowOnboarding(false);
	};

	if (showOnboarding) {
		return (
			<InsurerOnboardingStepper
				onOnboardingComplete={handleOnboardingComplete}
			/>
		);
	}

	if (isLoading) {
		return <LoadingSpinner />;
	}

	if (error) {
		return (
			<div className="flex justify-center items-center h-full min-h-[calc(100vh-80px)] text-red-500">
				<p className="text-lg font-medium">Error: {error.message}</p>
			</div>
		);
	}

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
				toolbarActionsPrefix={
					<CreateProductDialog
						isOpen={isCreateDialogOpen}
						onOpenChange={setIsCreateDialogOpen}
						onProductCreate={handleCreateProduct}
					/>
				}
			/>

			<EditProductDialog
				isOpen={isEditDialogOpen}
				onOpenChange={setIsEditDialogOpen}
				onProductUpdate={handleProductUpdate}
				product={selectedProductForEdit}
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
