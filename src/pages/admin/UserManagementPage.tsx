import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { useGetAllUsersQuery } from "@/redux/api/usersApi";
import type { User } from "@/types/auth";
import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useRegisterMutation } from "@/redux/api/authApi";
import { CreateUserDialog } from "@/components/admin-components/users/CreateUserDialog";
// Remove unused dispatch import

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
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { data: users = [], isLoading, isError, error, refetch } = useGetAllUsersQuery();
  const [registerUser] = useRegisterMutation();
  // Dispatch can be added here when needed for future features

  const handleCreateUser = async (values: { email: string }) => {
    try {
      // Always create an insurer user with auto-generated password
      await registerUser({
        email: values.email,
        role: 'insurer'
      }).unwrap();
      
      toast.success("Insurer user created successfully");
      refetch();
      return true;
    } catch (error) {
      const errorMessage = error?.data?.message || "Failed to create insurer user";
      toast.error(errorMessage);
      return false;
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isError) {
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
      <div>
        <h1 className="text-2xl font-bold">User Management</h1>
        <p className="text-muted-foreground text-sm">
          View and manage all system users and their permissions
        </p>
      </div>
      
      <DataTable
        columns={columns}
        data={users}
        toolbarActionsPrefix={
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        }
      />
      
      <CreateUserDialog
        isOpen={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onUserCreate={handleCreateUser}
      />
    </div>
  );
}
