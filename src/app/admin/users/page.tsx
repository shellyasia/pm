"use client";

import { useState } from "react";
import { ActionRow, Column, DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Pencil } from "lucide-react";
import EditUserDialog from "@/app/admin/users/edit-user-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { User } from "@/lib/db/table_user";

export default function UsersPage() {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Save user function (handles both create and update)
  const saveUser = async (userData: Partial<User>) => {
    try {
      const isUpdate = editUser?.email; // If we have an existing user, it's an update
      const method = isUpdate ? "PUT" : "POST";
      const action = isUpdate ? "update" : "create";

      const response = await fetch("/api/users", {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${action} user: ${response.statusText}`);
      }

      const savedUser = await response.json();

      // Trigger refresh to reload the data
      setRefreshTrigger((prev) => prev + 1);

      return savedUser;
    } catch (error) {
      throw error;
    }
  };

  // Define table columns
  const columns: Column<User>[] = [
    {
      key: "email",
      title: "Email",
      sortable: true,
      searchable: true,
      render: (_value: unknown, record: User) => (
        <div className="max-w-xs">
          <div className="font-medium text-sm">
            {record.email || "No email"}
          </div>
          <div className="text-xs text-muted-foreground truncate mt-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <span className="cursor-pointer hover:underline text-blue-600">
                  Actions
                </span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem
                  onClick={() => navigator.clipboard.writeText(record.email)}
                >
                  Copy Email
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    window.open(`mailto:${record.email}`, "_blank")}
                >
                  Send Email
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      ),
    },
    {
      key: "name",
      title: "Name",
      sortable: true,
      searchable: true,
      render: (value: unknown) => (
        <span className="font-medium">{String(value) || "No name"}</span>
      ),
    },
    {
      key: "role",
      title: "Role",
      sortable: true,
      render: (value: unknown) => {
        const roleColors: Record<string, string> = {
          "admin": "bg-red-100 text-red-800 border-red-200",
          "editor": "bg-blue-100 text-blue-800 border-blue-200",
          "viewer": "bg-gray-100 text-gray-800 border-gray-200",
        };
        return (
          <Badge
            variant="outline"
            className={roleColors[String(value)?.toLowerCase()] ||
              "bg-gray-100 text-gray-800 border-gray-200"}
          >
            {String(value) || "Unknown"}
          </Badge>
        );
      },
    },
    {
      key: "company",
      title: "Company",
      sortable: true,
      searchable: true,
      render: (value: unknown) => (
        <span className="text-sm">
          {String(value) || "No company"}
        </span>
      ),
    },

    {
      key: "created_at",
      title: "Created",
      sortable: true,
      render: (value: unknown) => {
        if (!value) return <span className="text-muted-foreground">N/A</span>;
        const date = new Date(String(value));
        return (
          <div className="text-sm">
            <div className="font-medium">{date.toLocaleDateString()}</div>
            <div className="text-xs text-muted-foreground">
              {date.toLocaleTimeString()}
            </div>
          </div>
        );
      },
    },
    {
      key: "updated_at",
      title: "Last Updated",
      sortable: true,
      render: (value: unknown) => {
        if (!value) return <span className="text-muted-foreground">N/A</span>;
        const date = new Date(String(value));
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        return (
          <div className="text-sm">
            <div className="font-medium">{date.toLocaleDateString()}</div>
            <div className="text-xs text-muted-foreground">
              {diffDays === 0
                ? "Today"
                : diffDays === 1
                ? "Yesterday"
                : `${diffDays} days ago`}
            </div>
          </div>
        );
      },
    },
  ];

  // Define row actions
  const actionsRow: ActionRow<User>[] = [
    {
      label: <Pencil className="h-4 w-4" />,
      onClick: (user: User) => {
        setEditUser(user);
        setEditDialogOpen(true);
      },
      className: "text-green-600 hover:text-green-800",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Users Table */}
      <DataTable
        fetchURL="/api/users"
        columns={columns}
        actionsRow={actionsRow}
        refreshTrigger={refreshTrigger}
        searchPlaceholder="Search users by email, name, or company..."
        emptyMessage="No users found. Click 'Add User' to create your first user."
        initialPageSize={200}
      />

      {/* Edit User Dialog */}
      <EditUserDialog
        open={editDialogOpen}
        initialData={editUser || undefined}
        onClose={() => {
          setEditDialogOpen(false);
          setEditUser(null);
        }}
        onSave={async (userData) => {
          try {
            await saveUser(userData);
            setEditDialogOpen(false);
            setEditUser(null);
          } catch (error) {
            console.error("Failed to save user:", error);
          }
        }}
      />
    </div>
  );
}
