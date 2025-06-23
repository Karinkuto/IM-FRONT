"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { CheckCircle, Eye, MoreHorizontal, XCircle } from "lucide-react";
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
import type { QuotationRequest, QuotationStatus } from "@/types/quotation";

export const columns: ColumnDef<QuotationRequest>[] = [
	{
		id: "userPhoneNumber",
		accessorFn: (row) => row.user.phone_number,
		header: "Phone Number",
		cell: ({ row }) => (
			<div className="font-mono">{row.original.user.phone_number}</div>
		),
	},
	{
		id: "userFin",
		accessorFn: (row) => row.user.fin,
		header: "TIN (FIN)",
		cell: ({ row }) => <div className="font-mono">{row.original.user.fin}</div>,
	},
	{
		id: "insuranceType",
		accessorFn: (row) => row.insurance_type.name,
		header: "Insurance Type",
		cell: ({ row }) => {
			const insuranceType = row.original.insurance_type.name;
			return <Badge>{insuranceType}</Badge>;
		},
	},
	{
		id: "coverageType",
		accessorFn: (row) => row.coverage_type.name,
		header: "Coverage Type",
		cell: ({ row }) => {
			const coverageType = row.original.coverage_type.name;
			return <Badge variant="secondary">{coverageType}</Badge>;
		},
	},
	{
		id: "plateNumber",
		accessorFn: (row) => row.vehicle.plate_number,
		header: "Plate Number",
		cell: ({ row }) => (
			<div className="font-mono">{row.original.vehicle.plate_number}</div>
		),
	},
	{
		accessorKey: "status",
		header: "Status",
		cell: ({ row }) => {
			const status = row.getValue("status") as QuotationStatus;
			return (
				<Badge
					variant={
						`status-${status}` as
							| "status-draft"
							| "status-pending"
							| "status-approved"
							| "status-rejected"
					}
				>
					{status.charAt(0).toUpperCase() + status.slice(1)}
				</Badge>
			);
		},
	},
	{
		id: "actions",
		header: () => <div className="text-center">Actions</div>,
		cell: ({ row, table }) => {
			const quotation = row.original;
			const { onViewDetails, onStatusChange } = table.options.meta as {
				onViewDetails: (id: string) => void;
				onStatusChange: (id: string, status: QuotationStatus) => void;
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
							<DropdownMenuItem onClick={() => onViewDetails(quotation.id)}>
								<Eye className="mr-2 h-4 w-4" />
								View Details
							</DropdownMenuItem>
							<DropdownMenuSeparator />
							{quotation.status === "pending" && (
								<>
									<DropdownMenuItem
										onClick={() => onStatusChange(quotation.id, "approved")}
										className="text-green-600"
									>
										<CheckCircle className="mr-2 h-4 w-4" />
										Approve
									</DropdownMenuItem>
									<DropdownMenuItem
										onClick={() => onStatusChange(quotation.id, "rejected")}
										className="text-red-600"
									>
										<XCircle className="mr-2 h-4 w-4" />
										Reject
									</DropdownMenuItem>
								</>
							)}
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			);
		},
	},
];
