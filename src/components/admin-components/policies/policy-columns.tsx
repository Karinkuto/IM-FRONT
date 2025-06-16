import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { Policy, PolicyStatus } from "@/types/policy";
import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";

export const columns: ColumnDef<Policy>[] = [
	{
		accessorKey: "insuredEntity",
		header: "Insured Entity",
		cell: ({ row }) => {
			const insuredEntity = row.getValue("insuredEntity") as string;
			const initials = insuredEntity
				.split(" ")
				.map((n) => n[0])
				.join("")
				.toUpperCase();
			return (
				<div className="flex items-center gap-2">
					<Avatar className="h-10 w-10 rounded-md">
						<AvatarFallback>{initials}</AvatarFallback>
					</Avatar>
					<span>{insuredEntity}</span>
				</div>
			);
		},
	},
	{
		accessorKey: "userPhoneNumber",
		header: "User Phone Number",
	},
	{
		accessorKey: "policyNumber",
		header: "Policy Number",
		cell: ({ row }) => (
			<Badge className="font-mono">{row.getValue("policyNumber")}</Badge>
		),
	},
	{
		accessorKey: "coverageType",
		header: "Coverage Type",
		cell: ({ row }) => {
			const coverageType = row.getValue("coverageType") as string;
			return <Badge variant="secondary">{coverageType}</Badge>;
		},
	},
	{
		accessorKey: "status",
		header: "Status",
		cell: ({ row }) => {
			const status = row.getValue("status") as PolicyStatus;
			const statusVariant = {
				active: "status-approved",
				expired: "status-pending",
				cancelled: "status-rejected",
			}[status] as "status-approved" | "status-pending" | "status-rejected";
			return (
				<Badge variant={statusVariant}>
					{status.charAt(0).toUpperCase() + status.slice(1)}
				</Badge>
			);
		},
	},
	{
		accessorKey: "startDate",
		header: "Start Date",
		cell: ({ row }) => {
			const date = new Date(row.getValue("startDate"));
			return format(date, "dd MMM yyyy");
		},
	},
	{
		accessorKey: "endDate",
		header: "End Date",
		cell: ({ row }) => {
			const date = new Date(row.getValue("endDate"));
			return format(date, "dd MMM yyyy");
		},
	},
	{
		accessorKey: "premiumAmount",
		header: () => <div className="text-right">Premium Amount</div>,
		cell: ({ row }) => {
			const amount = Number.parseFloat(row.getValue("premiumAmount"));
			const formatted = new Intl.NumberFormat("en-US", {
				style: "currency",
				currency: "ETB",
			}).format(amount);

			return (
				<div className="text-right font-medium font-mono">{formatted}</div>
			);
		},
	},
];
