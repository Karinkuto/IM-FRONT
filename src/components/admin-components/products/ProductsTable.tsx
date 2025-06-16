import { DataTable } from "@/components/ui/data-table"; // Import the new DataTable
import type { FC } from "react";
import { columns } from "./product-columns.tsx"; // Import the column definitions
import type { Product } from "./product-data-types.ts";

interface ProductsTableProps {
	products: Product[];
	onEdit: (productId: string) => void;
	onDelete: (productId: string) => void;
	toolbarActionsPrefix?: React.ReactNode; // Add the new prop here
}

export const ProductsTable: FC<ProductsTableProps> = ({
	products,
	onEdit,
	onDelete,
	toolbarActionsPrefix,
}) => {
	return (
		<DataTable
			columns={columns}
			data={products}
			toolbarActionsPrefix={toolbarActionsPrefix} // Pass it down to DataTable
			meta={{
				onEditProduct: onEdit,
				onDeleteProduct: onDelete,
			}}
		/>
	);
};
