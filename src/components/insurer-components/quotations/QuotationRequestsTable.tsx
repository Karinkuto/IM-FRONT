import type { ColumnDef } from "@tanstack/react-table";
import { CheckCircle, Eye, MoreHorizontal, XCircle } from "lucide-react";
import type { FC } from "react";
import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { QuotationRequest, QuotationStatus } from "@/types/quotation";
import QuotationDetailsDialog from "./modals/QuotationDetailsDialog.tsx";

export interface QuotationRequestsTableProps {
	quotations: QuotationRequest[];
	onViewDetails?: (quotationId: number) => void;
	onStatusChange: (
		id: number,
		newStatus: QuotationStatus
	) => void | Promise<void>;
	toolbarActionsPrefix?: React.ReactNode;
}

export const QuotationRequestsTable: FC<QuotationRequestsTableProps> = ({
	quotations,
	onStatusChange: onStatusChangeProp,
	toolbarActionsPrefix,
}) => {
	const [selectedQuotationId, setSelectedQuotationId] = useState<number | null>(
		null
	);

	const onViewDetails = (id: string | number) => {
		setSelectedQuotationId(Number(id));
	};

	// Handle status change with string ID for DataTable compatibility
	const handleStatusChange = (id: string, status: QuotationStatus) => {
		return onStatusChangeProp(Number(id), status);
	};

	// Prepare meta object for DataTable with proper typing
	const meta = {
		onViewDetails: (id: string) => onViewDetails(id),
		onStatusChange: (id: string, status: QuotationStatus) =>
			handleStatusChange(id, status),
	} as const;

	const columns: ColumnDef<QuotationRequest, unknown>[] = [
		{
			id: "user",
			accessorFn: (row) => row.user.customer.full_name,
			header: "User",
			cell: ({
				row: {
					original: {
						user: { customer, phone_number },
					},
				},
			}) => {
				const fullName = [
					customer.first_name,
					customer.middle_name,
					customer.last_name,
				]
					.filter(Boolean)
					.join(" ");
				const initials = fullName
					.split(" ")
					.map((n) => n[0])
					.join("")
					.toUpperCase();

				return (
					<div className="flex items-center gap-2">
						<Avatar className="h-10 w-10 rounded-md">
							<AvatarFallback>{initials}</AvatarFallback>
						</Avatar>
						<div className="flex flex-col">
							<span className="font-medium">{fullName}</span>
							<span className="text-muted-foreground text-sm">
								{phone_number}
							</span>
						</div>
					</div>
				);
			},
		},
		{
			id: "requestType",
			accessorFn: (row) => row.request_summary.request_type,
			header: "Request Type",
			cell: ({ row }) => (
				<Badge variant="outline">
					{row.original.request_summary.request_type}
				</Badge>
			),
		},
		{
			id: "vehicle",
			header: "Vehicle",
			cell: ({ row }) => {
				const entity = row.original.insured_entity.entity;
				return (
					<div className="flex flex-col">
						<span className="font-medium">
							{entity.make} {entity.model} ({entity.year_of_manufacture})
						</span>
						<span className="font-mono text-muted-foreground text-sm">
							{entity.plate_number}
						</span>
					</div>
				);
			},
		},
		{
			id: "estimatedValue",
			header: "Estimated Value",
			cell: ({ row }) => {
				const value = Number.parseFloat(
					row.original.request_summary.estimated_value
				);
				return <div className="font-medium">ETB {value.toLocaleString()}</div>;
			},
		},
		{
			id: "insurer",
			accessorFn: (row) => row.insurance_product.insurer.name,
			header: "Insurer",
			cell: ({ row }) => {
				const insurer = row.original.insurance_product.insurer;
				return (
					<div className="flex flex-col">
						<span className="font-medium">{insurer.name}</span>
						<span className="text-muted-foreground text-sm">
							ETB{" "}
							{Number.parseFloat(
								row.original.insurance_product.estimated_price
							).toLocaleString()}
						</span>
					</div>
				);
			},
		},
		{
			id: "riskProfile",
			accessorFn: (row) => row.request_summary.user_risk_profile.total_entities,
			header: "Risk Profile",
			cell: ({ row }) => {
				const riskProfile = row.original.request_summary.user_risk_profile;
				return (
					<div className="flex flex-col text-sm">
						<span>Entities: {riskProfile.total_entities}</span>
						<span>Policies: {riskProfile.total_policies}</span>
						<span
							className={
								riskProfile.verified_status ? "text-green-600" : "text-red-600"
							}
						>
							{riskProfile.verified_status ? "Verified" : "Unverified"}
						</span>
					</div>
				);
			},
		},
		{
			id: "requestAge",
			accessorFn: (row) => row.request_summary.request_age_days,
			header: "Age",
			cell: ({ row }) => {
				const ageDays = row.original.request_summary.request_age_days;
				return (
					<div className="text-sm">
						{ageDays === 0
							? "Today"
							: `${ageDays} day${ageDays > 1 ? "s" : ""}`}
					</div>
				);
			},
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
					onStatusChange: (
						id: string,
						status: QuotationStatus
					) => void | Promise<void>;
				};

				return (
					<div className="text-center">
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button className="h-8 w-8 p-0" variant="ghost">
									<span className="sr-only">Open menu</span>
									<MoreHorizontal className="h-4 w-4" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end">
								<DropdownMenuLabel>Actions</DropdownMenuLabel>
								<DropdownMenuItem
									onClick={() => onViewDetails(quotation.id.toString())}
								>
									<Eye className="mr-2 h-4 w-4" />
									View Details
								</DropdownMenuItem>
								<DropdownMenuSeparator />
								{quotation.status === "pending" && (
									<>
										<DropdownMenuItem
											className="text-green-600"
											onClick={() =>
												onStatusChange(quotation.id.toString(), "approved")
											}
										>
											<CheckCircle className="mr-2 h-4 w-4" />
											Approve
										</DropdownMenuItem>
										<DropdownMenuItem
											className="text-red-600"
											onClick={() =>
												onStatusChange(quotation.id.toString(), "rejected")
											}
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

	return (
		<div className="space-y-4">
			<div className="flex flex-col gap-4">
				<DataTable
					columns={columns}
					data={quotations}
					meta={meta}
					toolbarActionsPrefix={toolbarActionsPrefix}
				/>
			</div>

			{selectedQuotationId !== null && (
				<QuotationDetailsDialog quotationId={selectedQuotationId.toString()} />
			)}
		</div>
	);
};
