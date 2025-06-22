import type { FC } from "react";
import { DataTable } from "@/components/ui/data-table"; // Import the new DataTable
import { columns } from "./product-columns.tsx"; // Import the column definitions
import type { Product } from "./product-data-types.ts";

interface ProductsTableProps {
	products: Product[];
	onEditProduct: (productId: string) => void;
	onDeleteProduct: (productId: string) => void;
	toolbarActionsPrefix?: React.ReactNode; // Add the new prop here
}

export const ProductsTable: FC<ProductsTableProps> = ({
	products,
	onEditProduct,
	onDeleteProduct,
	toolbarActionsPrefix,
}) => {
	return (
		<DataTable
			columns={columns}
			data={products}
			toolbarActionsPrefix={toolbarActionsPrefix} // Pass it down to DataTable
			meta={{
				onEditProduct,
				onDeleteProduct,
			}}
		/>
	);
};
