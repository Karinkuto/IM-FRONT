import type { Row } from "@tanstack/react-table";
import { Edit, MoreHorizontal, Power } from "lucide-react";
import { type FC, useCallback } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Rating } from "@/components/ui/rating";
import { useInsuranceTypes } from "@/hooks/useInsuranceTypes";
import { useUpdateProductMutation } from "@/redux/apis/productApi";
import type { InsuranceProduct } from "@/types/product";

interface ProductsTableProps {
	products: InsuranceProduct[];
	onEditProduct: (productId: string) => void;
	onStatusChange?: () => void;
	toolbarActionsPrefix?: React.ReactNode;
}

// Action cell component for the table
const ActionCell: FC<{
	row: Row<InsuranceProduct>;
	onEdit: (id: string) => void;
	onStatusChange: (id: string, currentStatus: string) => void;
}> = ({ row, onEdit, onStatusChange }) => {
	const product = row.original;
	const isActive = product.status === "active";

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button className="h-8 w-8 p-0" variant="ghost">
					<span className="sr-only">Open menu</span>
					<MoreHorizontal className="h-4 w-4" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				<DropdownMenuLabel>Actions</DropdownMenuLabel>
				<DropdownMenuItem onClick={() => onEdit(product.id)}>
					<Edit className="mr-2 h-4 w-4" />
					Edit
				</DropdownMenuItem>
				<DropdownMenuItem
					className="flex items-center"
					onClick={() => onStatusChange(product.id, product.status)}
				>
					<Power
						className={`mr-2 h-4 w-4 ${isActive ? "text-destructive" : "text-green-600"}`}
					/>
					{isActive ? "Deactivate" : "Activate"}
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};

// Backend-aligned columns
const columns = (
	onEditProduct: (id: string) => void,
	onStatusChange: (id: string, currentStatus: string) => void,
	coverageTypesMap: Record<string, { coverageTypeName: string; insuranceTypeName: string }>
) => [
	{
		accessorKey: "name",
		header: "Product Name",
		cell: ({ row }: { row: Row<InsuranceProduct> }) => (
			<div className="font-medium">{row.getValue("name")}</div>
		),
	},
	{
		id: "coverage_type",
		header: "Coverage Type",
		cell: ({ row }: { row: Row<InsuranceProduct> }) => {
			const product = row.original;
			const map = coverageTypesMap || {};
			const coverageTypeId =
				product.coverage_type_id || product.coverage_type?.id;
			const coverageTypeName = coverageTypeId
				? map[coverageTypeId]?.coverageTypeName || coverageTypeId
				: "-";
			return <div>{coverageTypeName}</div>;
		},
	},
	{
		id: "insurance_type",
		header: "Insurance Type",
		cell: ({ row }: { row: Row<InsuranceProduct> }) => {
			const product = row.original;
			const map = coverageTypesMap || {};
			const coverageTypeId =
				product.coverage_type_id || product.coverage_type?.id;
			const insuranceTypeName = coverageTypeId
				? map[coverageTypeId]?.insuranceTypeName || "-"
				: "-";
			return <span>{insuranceTypeName}</span>;
		},
	},
	{
		accessorKey: "description",
		header: "Description",
	},
	{
		accessorKey: "estimated_price",
		header: () => <div className="text-right">Estimated Price</div>,
		cell: ({ row }: { row: Row<InsuranceProduct> }) => {
			const amount = Number.parseFloat(row.getValue("estimated_price"));
			const formatted = new Intl.NumberFormat("en-US", {
				style: "currency",
				currency: "ETB",
			}).format(amount);
			return (
				<div className="text-right font-medium font-mono">{formatted}</div>
			);
		},
	},
	{
		accessorKey: "customer_rating",
		header: "Rating",
		cell: ({ row }: { row: Row<InsuranceProduct> }) => {
			const rating = row.original.customer_rating;
			if (rating === null || rating === undefined) {
				return <span className="text-gray-400">No ratings yet</span>;
			}
			return <Rating rating={rating} showValue size="sm" />;
		},
	},
	{
		accessorKey: "status",
		header: "Status",
		cell: ({ row }: { row: Row<InsuranceProduct> }) => {
			const status = row.getValue("status") as string;
			const variant =
				status === "active" ? "status-approved" : "status-rejected";
			return <Badge variant={variant}>{status}</Badge>;
		},
	},
	{
		id: "actions",
		enableHiding: false,
		header: () => <div className="text-center">Actions</div>,
		cell: ({ row }: { row: Row<InsuranceProduct> }) => (
			<ActionCell
				onEdit={onEditProduct}
				onStatusChange={onStatusChange}
				row={row}
			/>
		),
	},
];

export const ProductsTable: FC<ProductsTableProps> = ({
	products,
	onEditProduct,
	onStatusChange,
	toolbarActionsPrefix,
}) => {
	const { coverageTypesMap } = useInsuranceTypes();
	const [updateProduct] = useUpdateProductMutation();

	const handleStatusChange = useCallback(
		async (id: string, currentStatus: string) => {
			try {
				const newStatus = currentStatus === "active" ? "inactive" : "active";
				await updateProduct({
					id,
					status: newStatus,
				}).unwrap();

				toast.success(
					`Product ${newStatus === "active" ? "activated" : "deactivated"} successfully`
				);
				onStatusChange?.();
			} catch (error) {
				toast.error("Failed to update product status", {
					description:
						error instanceof Error
							? error.message
							: "An unknown error occurred",
				});
			}
		},
		[updateProduct, onStatusChange]
	);
	return (
		<DataTable
			columns={columns(onEditProduct, handleStatusChange, coverageTypesMap)}
			data={products}
			meta={{
				onEditProduct,
			}}
			toolbarActionsPrefix={toolbarActionsPrefix}
		/>
	);
};
