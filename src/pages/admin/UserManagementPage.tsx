import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { useGetAllUsersQuery } from "@/redux/api/usersApi";
import type { User } from "@/types/auth";
import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const columns: ColumnDef<User>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => row.original.email || "N/A",
  },
  {
    accessorKey: "phone_number",
    header: "Phone Number",
    cell: ({ row }) => row.original.phone_number || "N/A",
  },
  {
    accessorKey: "fin",
    header: "FIN",
    cell: ({ row }) => row.original.fin || "N/A",
  },
  {
    accessorKey: "verified",
    header: "Verified",
    cell: ({ row }) => (row.original.verified ? "Yes" : "No"),
  },
  {
    accessorKey: "temporary_password",
    header: "Password Type",
    cell: ({ row }) => (
      <Badge variant={row.original.temporary_password ? "status-pending" : "status-approved"}>
        {row.original.temporary_password ? "Temporary" : "Changed"}
      </Badge>
    ),
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
      const roles = row.original.roles;
      return roles?.[0]?.name || 'N/A';
    },
  },
];

export default function UserManagementPage() {
  const { data: users = [], isLoading, error } = useGetAllUsersQuery();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="text-destructive">
        Failed to load users: {"error" in error ? error.error : "Unknown error"}
      </div>
    );
  }

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-full min-h-[calc(100vh-80px)] text-red-500">
        <p className="text-lg font-medium">
          Error: {"error" in error ? error.error : "Failed to load users"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-muted-foreground text-sm">
            View and manage all system users and their permissions
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>
      
      <DataTable
        columns={columns}
        data={users}
      />
    </div>
  );
}
