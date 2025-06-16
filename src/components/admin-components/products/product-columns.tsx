import type { ColumnDef } from "@tanstack/react-table";
import { Edit, MoreHorizontal, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Product } from "./product-data-types.ts"; // Assuming Product type is here

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.

export const columns: ColumnDef<Product>[] = [
	{
		accessorKey: "coverageType",
		header: "Title (Coverage Type)",
		cell: ({ row }) => (
			<div className="font-medium">{row.getValue("coverageType")}</div>
		),
	},
	{
		accessorKey: "insuranceType",
		header: "Insurance Type",
		cell: ({ row }) => {
			const insuranceType = row.getValue("insuranceType") as string;
			return <Badge>{insuranceType}</Badge>;
		},
	},
	{
		accessorKey: "description",
		header: "Description",
	},
	{
		accessorKey: "pricing",
		header: () => <div className="text-right">Pricing</div>,
		cell: ({ row }) => {
			const amount = Number.parseFloat(row.getValue("pricing"));
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
		accessorKey: "status",
		header: "Status",
		cell: ({ row }) => {
			const status = row.getValue("status") as string;
			const variant = status === "active" ? "status-approved" : "status-draft";
			return <Badge variant={variant}>{status}</Badge>;
		},
	},
	{
		id: "actions",
		header: () => <div className="text-center">Actions</div>,
		cell: ({ row, table }) => {
			const product = row.original;
			// Access onEditProduct and onDeleteProduct from table meta
			const { onEditProduct, onDeleteProduct } = table.options.meta as {
				onEditProduct: (productId: string) => void;
				onDeleteProduct: (productId: string) => void;
			};

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
							<DropdownMenuSeparator />
							<DropdownMenuItem
								onClick={() => onDeleteProduct(product.id)}
								className="text-red-600"
							>
								<Trash2 className="mr-2 h-4 w-4" />
								Delete
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			);
		},
	},
];
