import type { ColumnDef } from "@tanstack/react-table";
import { CheckCircle2, XCircle } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { useCreateUserMutation, useGetUsersQuery } from "@/redux/apis/userApi";
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
  const [createUser] = useCreateUserMutation();
  const [formError, setFormError] = useState<string | null>(null);

  const handleAddUser = async (values: UserFormValues) => {
    setFormError(null);
    try {
      await createUser({
        email: values.email,
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

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => renderValue(row.getValue("email")),
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
      {formError && <div className="p-2 text-red-500 text-sm">{formError}</div>}
    </>
  );
}
