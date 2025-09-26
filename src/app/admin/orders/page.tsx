"use client";

import { useState } from "react";
import {
  ActionRow,
  ActionTable,
  Column,
  DataTable,
} from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { FileSpreadsheet, Package, Pencil, Plus, Trash2 } from "lucide-react";
import { Order } from "@/lib/db/table_order";
import { ExcelImportDialog } from "@/app/admin/orders/import-dialog";
import { EditDialog } from "./edit-dialog";
import CreateOrderDialog from "./create-dialog";
import { useProductOptions } from "@/contexts/use-products";

export default function OrdersPage() {
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [productOptions] = useProductOptions();

  // Handle order deletion
  const handleDelete = async (order: Order) => {
    if (!confirm(`Are you sure you want to delete order "${order.id}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/orders/${order.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete order");
      }
      setRefreshTrigger((prev) => prev + 1);
    } catch (error) {
      alert(
        error instanceof Error ? error.message : "Failed to delete order",
      );
    }
  };

  // Handle order edit
  const handleEdit = (order: Order) => {
    setSelectedOrder(order);
    setShowEditDialog(true);
  };

  // Handle Excel import
  const handleImport = async (
    orders: Array<{
      id?: string;
      name: string;
      quantity: number;
      batch: string;
      factory: string;
      date?: string;
      remark?: string;
    }>,
  ) => {
    try {
      const response = await fetch("/api/orders/bulk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orders }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to import orders");
      }

      const result = await response.json();

      // Build success message with warnings
      let message = `Successfully imported ${result.created} orders!`;

      if (result.warnings) {
        const warningParts = [];

        if (result.warnings.unmatchedProducts?.length > 0) {
          warningParts.push(
            `${result.warnings.unmatchedProducts.length} products could not be matched`,
          );
        }

        if (result.warnings.skippedOrders?.length > 0) {
          warningParts.push(
            `${result.warnings.skippedOrders.length} orders skipped (already exist)`,
          );
        }

        if (warningParts.length > 0) {
          message += `\n\nWarnings:\n- ${warningParts.join("\n- ")}`;
        }
      }

      alert(message);

      // Reload orders
      setRefreshTrigger((prev) => prev + 1);
    } catch (error) {
      throw error; // Re-throw to be handled by the dialog
    }
  };

  const getPriorityColor = (priority: string): string => {
    switch (priority?.toLowerCase()) {
      case "urgent":
        return "bg-red-100 text-red-800 border-red-200";
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "normal":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "low":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getFactoryColor = (factory: string): string => {
    switch (factory?.toLowerCase()) {
      case "broadwell":
        return "bg-green-100 text-green-800 border-green-200";
      case "frankever":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "heiman":
        return "bg-indigo-100 text-indigo-800 border-indigo-200";
      case "smatek":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "ogemray":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "shelly":
        return "bg-cyan-100 text-cyan-800 border-cyan-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status?.toLowerCase()) {
      case "draft":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "confirmed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "producing":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "shipped":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "delivered":
        return "bg-green-100 text-green-800 border-green-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Define table columns
  const columns: Column<Order>[] = [
    {
      key: "id",
      title: "Order ID",
      sortable: true,
      searchable: true,
      render: (value: unknown, row: Order) => (
        <div className="w-[120px]">
            <p className="font-medium text-sm font-mono break-all whitespace-normal">
              {String(value)}
            </p>
          <p className="text-xs text-muted-foreground mt-1  break-all whitespace-normal">
            {row.remark ? String(row.remark) : "No remarks"}
          </p>
        </div>
      ),
    },
    {
      key: "product_code",
      title: "Product",
      sortable: true,
      searchable: true,
      render: (value: unknown, row: Order) => (
        <div className="max-w-[200px]">
          {row.name && (
            <div className="font-medium text-sm mb-1">
              {String(row.name)}
            </div>
          )}
          {value
            ? (
              <div className="flex items-center gap-2">
                <Package className="h-3 w-3 text-green-600" />
                <span className="text-xs text-green-700 font-mono">
                  {String(value)}
                </span>
              </div>
            )
            : (
              <div className="flex items-center gap-2">
                <Package className="h-3 w-3 text-yellow-600" />
                <span className="text-xs text-yellow-700 italic">
                  No product selected
                </span>
              </div>
            )}
        </div>
      ),
    },
    {
      key: "factory",
      title: "Factory",
      render: (value: unknown) => (
        <Badge className={getFactoryColor(String(value))}>
          {String(value)?.charAt(0).toUpperCase() +
              String(value)?.slice(1) || "N/A"}
        </Badge>
      ),
    },
    {
      key: "priority",
      title: "Priority",
      render: (value: unknown) => (
        <Badge className={getPriorityColor(String(value))}>
          {String(value)?.toUpperCase() || "NORMAL"}
        </Badge>
      ),
    },
    {
      key: "quantity",
      title: "Quantity",
      sortable: true,
      render: (value: unknown) => (
        <div className="text-center max-w-[80px]">
          <span className="font-medium text-lg">
            {Number(value) || 0}
          </span>
          <div className="text-xs text-muted-foreground">
            units
          </div>
        </div>
      ),
    },
    {
      key: "batch",
      title: "Batch",
      render: (value: unknown) => (
        <span className="text-sm font-mono">
          {String(value) || "N/A"}
        </span>
      ),
    },
    {
      key: "status",
      title: "Status",
      sortable: true,
      render: (value: unknown) => (
        <Badge className={getStatusColor(String(value))}>
          {String(value)?.charAt(0).toUpperCase() +
              String(value)?.slice(1) || "Draft"}
        </Badge>
      ),
    },

    {
      key: "created_at",
      title: "Created",
      sortable: true,
      render: (value: unknown) => {
        if (!value) return "N/A";
        const date = new Date(String(value));
        return (
          <div className="text-sm">
            <div>{date.toLocaleDateString()}</div>
            <div className="text-xs text-muted-foreground">
              {date.toLocaleTimeString()}
            </div>
          </div>
        );
      },
    },
  ];

  const tableActions: ActionTable[] = [
    {
      label: "Import Excel",
      onClick: () => setShowImportDialog(true),
      variant: "outline",
      icon: <FileSpreadsheet className="h-4 w-4 mr-2" />,
    },
    {
      label: "Add Order",
      onClick: () => setShowCreateDialog(true),
      icon: <Plus className="h-4 w-4 mr-2" />,
    },
  ];

  // Define table actions
  const actions: ActionRow<Order>[] = [
    {
      label: <Pencil className="h-4 w-4" />,
      onClick: handleEdit,
      className: "text-green-600 hover:text-green-800",
    },
    {
      label: <Trash2 className="h-4 w-4" />,
      onClick: handleDelete,
      className: "text-red-600 hover:text-red-800",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Orders Table */}

      <DataTable
        fetchURL="/api/orders"
        columns={columns}
        actionsRow={actions}
        refreshTrigger={refreshTrigger}
        actionsTable={tableActions}
        searchPlaceholder="Search orders by ID, factory, priority, or batch..."
        emptyMessage="No orders found. Click 'Add Order' to create your first order."
        initialPageSize={200}
      />

      {/* Create Order Dialog */}
      <CreateOrderDialog
        open={showCreateDialog}
        productOptions={productOptions}
        onOpenChange={setShowCreateDialog}
        onSuccess={() => {
          setRefreshTrigger((prev) => prev + 1);
          setShowCreateDialog(false);
        }}
      />

      {/* Excel Import Dialog */}
      <ExcelImportDialog
        isOpen={showImportDialog}
        onClose={() => setShowImportDialog(false)}
        onImport={handleImport}
      />

      {/* Edit Order Dialog */}
      <EditDialog
        open={showEditDialog}
        productOptions={productOptions}
        onOpenChange={setShowEditDialog}
        order={selectedOrder}
        onEditSuccess={() => {
          setRefreshTrigger((prev) => prev + 1);
        }}
      />
    </div>
  );
}
