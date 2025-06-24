import type { ColumnDef } from "@tanstack/react-table";
import { CheckCircle, Eye, MoreHorizontal, XCircle } from "lucide-react";
import type { FC } from "react";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Dialog } from "@/components/ui/dialog";
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
	onViewDetails?: (quotationId: string) => void;
	onStatusChange: (
		id: string,
		newStatus: QuotationStatus,
	) => void | Promise<void>;
	toolbarActionsPrefix?: React.ReactNode;
}

export const QuotationRequestsTable: FC<QuotationRequestsTableProps> = ({
	quotations,
	onStatusChange,
	toolbarActionsPrefix,
}) => {
	const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
	const [selectedQuotationId, setSelectedQuotationId] = useState<string | null>(
		null,
	);

	const onViewDetails = (quotationId: string) => {
		setSelectedQuotationId(quotationId);
		setIsDetailsDialogOpen(true);
	};

	// Helper to get full name from customer
	const getCustomerFullName = (customer?: {
		first_name: string;
		middle_name: string;
		last_name: string;
	}) => {
		if (!customer) return "-";
		return [customer.first_name, customer.middle_name, customer.last_name]
			.filter(Boolean)
			.join(" ");
	};

	const columns: ColumnDef<QuotationRequest>[] = [
		{
			id: "customerAvatar",
			header: "",
			cell: ({ row }) => {
				const customer = row.original.user.customer;
				const fullName = customer
					? [customer.first_name, customer.middle_name, customer.last_name]
							.filter(Boolean)
							.join(" ")
					: "-";
				const avatarUrl = customer?.avatar;
				const initials = fullName
					.split(" ")
					.map((n) => n[0])
					.join("")
					.toUpperCase()
					.slice(0, 2);
				return (
					<Avatar className="h-9 w-9 mr-2 rounded-md">
						{avatarUrl ? (
							<AvatarImage src={avatarUrl} alt={fullName} />
						) : (
							<AvatarFallback>{initials}</AvatarFallback>
						)}
					</Avatar>
				);
			},
			enableSorting: false,
			enableHiding: false,
		},
		{
			id: "customerFullName",
			header: "Full Name",
			accessorFn: (row) => getCustomerFullName(row.user.customer),
			cell: ({ row }) => (
				<div className="font-medium">
					{getCustomerFullName(row.original.user.customer)}
				</div>
			),
		},
		{
			id: "userPhoneNumber",
			header: "Phone Number",
			accessorFn: (row) => row.user.phone_number,
			cell: ({ row }) => (
				<div className="font-mono">{row.original.user.phone_number}</div>
			),
		},
		{
			id: "insuranceProduct",
			header: "Insurance Product",
			accessorFn: (row) => row.insurance_product?.name ?? "-",
			cell: ({ row }) => {
				const product = row.original.insurance_product;
				const insuranceType =
					row.original.insurance_product?.coverage_type?.insurance_type?.name;
				const coverageType = row.original.coverage_type?.name;
				return (
					<div>
						<div className="font-semibold">{product?.name ?? "-"}</div>
						{insuranceType && coverageType && (
							<div className="text-xs text-muted-foreground mt-0.5">
								{insuranceType} - {coverageType}
							</div>
						)}
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

	return (
		<>
			<DataTable
				columns={columns}
				data={quotations}
				toolbarActionsPrefix={toolbarActionsPrefix}
				meta={{
					onViewDetails,
					onStatusChange,
				}}
			/>
			<Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
				{/* DialogTrigger is not needed here as we are controlling the open state programmatically */}
				{selectedQuotationId && (
					<QuotationDetailsDialog quotationId={selectedQuotationId} />
				)}
			</Dialog>
		</>
	);
};
