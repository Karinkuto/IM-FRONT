import { ProductsTable } from "@/components/admin-components/products/ProductsTable.tsx";
import { CreateProductDialog } from "@/components/admin-components/products/modals/CreateProductDialog";
import { EditProductDialog } from "@/components/admin-components/products/modals/EditProductDialog";
import type { Product } from "@/components/admin-components/products/product-data-types";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  useCreateProductMutation,
  useDeleteProductMutation,
  useGetInsuranceTypesQuery,
  useGetProductsQuery,
  useUpdateProductMutation,
} from "@/redux/api/productsApi";
import { PlusCircle } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

interface InsuranceTypeApi {
  id: number;
  name: string;
  description: string;
}

const AdminProducts: React.FC = () => {
  const {
    data: products = [],
    isLoading,
    error,
    refetch,
  } = useGetProductsQuery();
  const { data: insuranceTypes = [], isLoading: isLoadingInsuranceTypes } =
    useGetInsuranceTypesQuery();
  const [createProduct] = useCreateProductMutation();
  const [updateProduct] = useUpdateProductMutation();
  const [deleteProduct] = useDeleteProductMutation();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedProductForEdit, setSelectedProductForEdit] =
    useState<Product | null>(null);

  const handleCreateProduct = async (newProduct: Omit<Product, "id">) => {
    try {
      await createProduct(newProduct).unwrap();
      toast.success("Product created successfully");
      setIsCreateDialogOpen(false);
      refetch();
    } catch (error) {
      console.error("Failed to create product:", error);
      toast.error("Failed to create product");
    }
  };

  const handleUpdateProduct = async (updatedProduct: Product) => {
    if (!updatedProduct.id) return;

    try {
      await updateProduct(updatedProduct).unwrap();
      toast.success("Product updated successfully");
      setIsEditDialogOpen(false);
      setSelectedProductForEdit(null);
      refetch();
    } catch (error) {
      console.error("Failed to update product:", error);
      toast.error("Failed to update product");
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      await deleteProduct(productId).unwrap();
      toast.success("Product deleted successfully");
      refetch();
    } catch (error) {
      console.error("Failed to delete product:", error);
      toast.error("Failed to delete product");
    }
  };

  const handleEditClick = (productId: string) => {
    const productToEdit = products.find((p: Product) => p.id === productId);
    if (productToEdit) {
      setSelectedProductForEdit(productToEdit);
      setIsEditDialogOpen(true);
    }
  };

  const productsWithInsuranceTypeNames = useMemo(() => {
    return products.map((product: Product) => {
      const insuranceType = insuranceTypes.find(
        (type: InsuranceTypeApi) =>
          type.id.toString() === product.insuranceTypeId
      );
      return {
        ...product,
        insuranceType: insuranceType
          ? insuranceType.name
          : product.insuranceType,
      };
    });
  }, [products, insuranceTypes]);

  if (isLoading || isLoadingInsuranceTypes) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-500">
        Error loading products. Please try again later.
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Insurance Products</h1>
      </div>

      <ProductsTable
        products={productsWithInsuranceTypeNames}
        onEdit={handleEditClick}
        onDelete={handleDeleteProduct}
        toolbarActionsPrefix={
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" /> Create Product
          </Button>
        }
      />

      <CreateProductDialog
        isOpen={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onProductCreate={handleCreateProduct}
      />

      {selectedProductForEdit && (
        <EditProductDialog
          isOpen={isEditDialogOpen}
          onOpenChange={(openState) => {
            setIsEditDialogOpen(openState);
            if (!openState) setSelectedProductForEdit(null);
          }}
          onProductUpdate={handleUpdateProduct}
          product={selectedProductForEdit}
        />
      )}

      {products.length === 0 && (
        <p className="text-center text-gray-500 mt-4">
          No products found. Click "Create Product" to add one.
        </p>
      )}
    </div>
  );
};

export default AdminProducts;
