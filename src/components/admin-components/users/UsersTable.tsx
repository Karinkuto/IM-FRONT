import type { ColumnDef } from "@tanstack/react-table";
import { CheckCircle2, XCircle, ZapIcon, Info, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import {
	useGetUsersQuery,
	useCreateUserMutation,
	useUpdateUserMutation,
} from "@/redux/apis/userApi";
import type { User } from "@/types/user";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FormModal } from "@/components/ui/FormModal";
import * as z from "zod";
import { Combobox } from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
	FormField,
	FormItem,
	FormLabel,
	FormControl,
	FormMessage,
} from "@/components/ui/form";
import type { UseFormReturn } from "react-hook-form";
import { SmartForm, SmartFormField } from "@/components/smart-form";
import UserDialog from "./UserDialog";
import { Dialog, DialogContent } from "@/components/ui/dialog";

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
	const [editUserInitial, setEditUserInitial] = useState<any>(null);
	const [editUserId, setEditUserId] = useState<string | number | null>(null);
	const [createUser, { isLoading: isCreating }] = useCreateUserMutation();
	const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();
	const [formError, setFormError] = useState<string | null>(null);

	const handleAddUser = async (values: UserFormValues) => {
		setFormError(null);
		try {
			await createUser({
				email: values.email,
				phone_number: values.phone_number,
				role: values.role,
			}).unwrap();
			setOpenAddUser(false);
		} catch (err: any) {
			setFormError(err?.data?.message || "Failed to create user");
		}
	};

	const handleEditUser = (user: any) => {
		setEditUserInitial({ email: user.email, phone_number: user.phone_number });
		setEditUserId(user.id);
		setOpenEditUser(true);
	};

	const handleUpdateUser = async (values: any) => {
		setFormError(null);
		if (!editUserId) return;
		try {
			await updateUser({
				id: editUserId,
				email: values.email,
				phone_number: values.phone_number,
			}).unwrap();
			setOpenEditUser(false);
		} catch (err: any) {
			setFormError(err?.data?.message || "Failed to update user");
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
					return value.map((role: any) => role.name).join(", ");
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
			header: () => null,
			cell: ({ row }) => {
				const user = row.original;
				return (
					<Button
						size="icon"
						variant="ghost"
						onClick={() => handleEditUser(user)}
					>
						<Pencil className="w-4 h-4 text-primary" />
					</Button>
				);
			},
		},
	];

	if (isLoading) return <div>Loading...</div>;
	if (error) return <div>Error loading users</div>;

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
				open={openAddUser}
				onOpenChange={setOpenAddUser}
				onSubmit={handleAddUser}
				isLoading={isCreating}
				mode="create"
			/>
			<UserDialog
				open={openEditUser}
				onOpenChange={setOpenEditUser}
				onSubmit={handleUpdateUser}
				isLoading={isUpdating}
				mode="edit"
				initialValues={editUserInitial}
			/>
			{formError && <div className="text-red-500 text-sm p-2">{formError}</div>}
		</>
	);
}
