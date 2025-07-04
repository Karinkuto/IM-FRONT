import type { ColumnDef } from "@tanstack/react-table";
import { CheckCircle2, Pencil, XCircle } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import {
	useCreateUserMutation,
	useGetUsersQuery,
	useUpdateUserMutation,
} from "@/redux/apis/userApi";
import type { User, UserRole } from "@/types/user";
import type { UserFormValues } from "./UserDialog";
import UserDialog from "./UserDialog";

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

export default function UsersTable() {
	const { data: users, isLoading, error } = useGetUsersQuery();
	const [openAddUser, setOpenAddUser] = useState(false);
	const [openEditUser, setOpenEditUser] = useState(false);
	const [editUserInitial, setEditUserInitial] =
		useState<Partial<UserFormValues> | null>(null);
	const [editUserId, setEditUserId] = useState<string | number | null>(null);
	const [createUser] = useCreateUserMutation();
	const [updateUser] = useUpdateUserMutation();
	const [formError, setFormError] = useState<string | null>(null);

	const handleAddUser = async (values: UserFormValues) => {
		setFormError(null);
		try {
			await createUser({
				email: values.email,
				phone_number: values.phone_number,
				role: values.role ?? "insurer",
			}).unwrap();
			setOpenAddUser(false);
		} catch (err: unknown) {
			setFormError(
				(err as { data?: { message?: string } })?.data?.message ||
					"Failed to create user"
			);
		}
	};

	const handleEditUser = (user: User) => {
		setEditUserInitial({
			email: user.email ?? "",
			phone_number: user.phone_number ?? undefined,
			...(user.role ? { role: user.role } : {}),
		});
		setEditUserId(user.id);
		setOpenEditUser(true);
	};

	const handleUpdateUser = async (values: UserFormValues) => {
		setFormError(null);
		if (!editUserId) {
			return;
		}
		try {
			await updateUser({
				id: editUserId,
				email: values.email,
				phone_number: values.phone_number,
			}).unwrap();
			setOpenEditUser(false);
		} catch (err: unknown) {
			setFormError(
				(err as { data?: { message?: string } })?.data?.message ||
					"Failed to update user"
			);
		}
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
					<Badge
						icon={
							<CheckCircle2
								aria-hidden="true"
								className="text-green-500 opacity-60"
								size={12}
							/>
						}
						variant="outline"
					>
						Verified
					</Badge>
				) : (
					<Badge
						icon={
							<XCircle
								aria-hidden="true"
								className="text-red-500 opacity-60"
								size={12}
							/>
						}
						variant="outline"
					>
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
					<Badge variant="status-pending">Temporary</Badge>
				) : (
					<Badge variant="status-approved">Changed</Badge>
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
				if (Array.isArray(value)) {
					return value
						.map(
							(
								role:
									| string
									| { id: number; name: UserRole; [key: string]: unknown }
							) => (typeof role === "string" ? role : role.name)
						)
						.join(", ");
				}
				return String(value);
			},
		},
		{
			accessorKey: "created_at",
			header: "Created At",
			cell: ({ row }) => {
				const value = row.getValue("created_at");
				if (!value) {
					return <span style={{ color: "#aaa" }}>-</span>;
				}
				const date = new Date(value as string);
				return (
					<span className="font-mono text-muted-foreground text-sm dark:text-foreground">
						{date.toISOString().slice(0, 10)}
					</span>
				);
			},
		},
		{
			id: "actions",
			header: () => null,
			cell: ({ row }) => {
				const user = row.original;
				return (
					<Button
						onClick={() => handleEditUser(user)}
						size="icon"
						variant="ghost"
					>
						<Pencil className="h-4 w-4 text-primary" />
					</Button>
				);
			},
		},
	];

	if (isLoading) {
		return <div>Loading...</div>;
	}
	if (error) {
		return <div>Error loading users</div>;
	}

	return (
		<>
			<DataTable
				columns={columns}
				data={users || []}
				toolbarActionsPrefix={
					<Button onClick={() => setOpenAddUser(true)} variant="default">
						Add User
					</Button>
				}
			/>
			<UserDialog
				mode="create"
				onOpenChange={setOpenAddUser}
				onSubmit={handleAddUser}
				open={openAddUser}
			/>
			<UserDialog
				initialValues={editUserInitial ?? undefined}
				mode="edit"
				onOpenChange={setOpenEditUser}
				onSubmit={handleUpdateUser}
				open={openEditUser}
			/>
			{formError && <div className="p-2 text-red-500 text-sm">{formError}</div>}
		</>
	);
}
