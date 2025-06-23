import type { ColumnDef } from "@tanstack/react-table";
import { CheckCircle2, XCircle, ZapIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { useGetUsersQuery } from "@/redux/apis/userApi";
import type { User } from "@/types/user";

const renderValue = (value: string | null | undefined | string[] | boolean) => {
	if (
		value === null ||
		value === undefined ||
		value === "" ||
		(Array.isArray(value) && value.length === 0)
	) {
		return <span style={{ color: "#aaa" }}>-</span>;
	}
	return value as React.ReactNode;
};

const columns: ColumnDef<User>[] = [
	{
		accessorKey: "email",
		header: "Email",
		cell: ({ row }) => renderValue(row.getValue("email")),
	},
	{
		accessorKey: "phone_number",
		header: "Phone",
		cell: ({ row }) => renderValue(row.getValue("phone_number")),
	},
	{
		accessorKey: "verified",
		header: "Verified",
		cell: ({ row }) => {
			const verified = row.getValue("verified");
			return verified ? (
				<Badge variant="outline">
					<CheckCircle2
						className="-ms-0.5 opacity-60 text-green-500"
						size={12}
						aria-hidden="true"
					/>
					Verified
				</Badge>
			) : (
				<Badge variant="outline">
					<XCircle
						className="-ms-0.5 opacity-60 text-red-500"
						size={12}
						aria-hidden="true"
					/>
					Not Verified
				</Badge>
			);
		},
	},
	{
		accessorKey: "temporary_password",
		header: "Password Type",
		cell: ({ row }) => {
			const temp = row.getValue("temporary_password");
			return temp ? (
				<Badge variant="outline">
					<ZapIcon
						className="-ms-0.5 opacity-60 text-yellow-500"
						size={12}
						aria-hidden="true"
					/>
					Temporary
				</Badge>
			) : (
				<Badge variant="outline">Changed</Badge>
			);
		},
	},
	{
		accessorKey: "roles",
		header: "Roles",
		cell: ({ row }) => {
			const value = row.getValue("roles");
			if (!value || (Array.isArray(value) && value.length === 0)) {
				return <span style={{ color: "#aaa" }}>-</span>;
			}
			// roles is string[]
			if (Array.isArray(value)) {
				return (value as string[]).join(", ");
			}
			return String(value);
		},
	},
	{
		accessorKey: "created_at",
		header: "Created At",
		cell: ({ row }) => {
			const value = row.getValue("created_at");
			if (!value) return <span style={{ color: "#aaa" }}>-</span>;
			const date = new Date(value as string);
			return (
				<span className="font-mono text-sm text-muted-foreground dark:text-foreground">
					{date.toISOString().slice(0, 10)}
				</span>
			);
		},
	},
	{
		id: "actions",
		header: () => <div className="text-center">Actions</div>,
		cell: () => <span style={{ color: "#aaa" }}>—</span>, // Placeholder for future actions
	},
];

export default function UsersTable() {
	const { data: users, isLoading, error } = useGetUsersQuery();

	if (isLoading) return <div>Loading...</div>;
	if (error) return <div>Error loading users</div>;

	return <DataTable columns={columns} data={users || []} />;
}
