import type { Row } from "@tanstack/react-table";
import { Edit, MoreHorizontal } from "lucide-react";
import type { FC } from "react";
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
import type { InsuranceProduct } from "@/types/product";

interface ProductsTableProps {
	products: InsuranceProduct[];
	onEditProduct: (productId: string) => void;
	onDeleteProduct: (productId: string) => void;
	toolbarActionsPrefix?: React.ReactNode;
	coverageTypesMap?: Record<
		string,
		{ coverageTypeName: string; insuranceTypeName: string }
	>;
}

// Backend-aligned columns
const columns = (
	onEditProduct: (id: string) => void,
	coverageTypesMap?: Record<
		string,
		{ coverageTypeName: string; insuranceTypeName: string }
	>,
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
			const variant = status === "active" ? "status-approved" : undefined;
			return <Badge variant={variant}>{status}</Badge>;
		},
	},
	{
		id: "actions",
		header: () => <div className="text-center">Actions</div>,
		cell: ({ row }: { row: Row<InsuranceProduct> }) => {
			const product = row.original;
			return (
				<div className="text-center">
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="ghost" className="h-8 w-8 p-0">
								<span className="sr-only">Open menu</span>
								<MoreHorizontal className="h-4 w-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuLabel>Actions</DropdownMenuLabel>
							<DropdownMenuItem onClick={() => onEditProduct(product.id)}>
								<Edit className="mr-2 h-4 w-4" />
								Edit
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			);
		},
	},
];

export const ProductsTable: FC<ProductsTableProps> = ({
	products,
	onEditProduct,
	onDeleteProduct,
	toolbarActionsPrefix,
	coverageTypesMap,
}) => {
	return (
		<DataTable
			columns={columns(onEditProduct, coverageTypesMap)}
			data={products}
			toolbarActionsPrefix={toolbarActionsPrefix}
			meta={{
				onEditProduct,
				onDeleteProduct,
			}}
		/>
	);
};
