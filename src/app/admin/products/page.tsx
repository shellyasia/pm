"use client";

import { useState } from "react";
import {
  ActionRow,
  ActionTable,
  Column,
  DataTable,
} from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Download, ExternalLink, Eye, Pencil, Trash2 } from "lucide-react";

import { Product } from "@/lib/db/table_product";
import { confluenceWikiProductURL } from "@/lib/confluence/wiki";
import CreateProductDialog from "./create-dialog";
import EditProductDialog, { ProductFormData } from "./edit-dialog";
import ViewProductDialog from "./view-dialog";
import SyncDialog from "./sync-dialog";
import { toast } from "sonner";

export default function ProductsPage() {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [syncDialogOpen, setSyncDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<
    ProductFormData | null
  >(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const toProductFormData = (product: Product): ProductFormData => {
    return {
      ...product,
    };
  };

    // Handle product deletion
  const handleDelete = async (product: Product) => {
    if (!confirm(`Are you sure you want to delete "${product.code}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/products/${product.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Failed to delete product" }));
        throw new Error(errorData.error || "Failed to delete product");
      }

      // Reload products
      setRefreshTrigger((prev) => prev + 1);
      toast.success("Product deleted successfully");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete product",
      );
    }
  };

  // Handle sync from Confluence
  const handleSync = async () => {
    setSyncDialogOpen(true);
  };

  // Define table columns
  const columns: Column<Product>[] = [
    {
      key: "code",
      title: "Product Code",
      sortable: true,
      searchable: true,
      render: (value, record) => (
        <div className="w-[200px]">
          <div className="font-medium text-sm whitespace-normal break-words">
            {String(value) || "Untitled"}
          </div>
          <div className="text-xs text-muted-foreground truncate mt-2">
            <a
              href={confluenceWikiProductURL(
                record.id || "unknown_id",
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline inline-flex items-center gap-1"
            >
              <ExternalLink className="h-3 w-3" />
              {record.id}
            </a>
          </div>
        </div>
      ),
    },
    {
      key: "status",
      title: "Status",
      render: (value: unknown) => {
        const statusColors: Record<string, string> = {
          "crawler": "bg-blue-100 text-blue-800",
          "edited": "bg-yellow-100 text-yellow-800",
          "approved": "bg-green-100 text-green-800",
          "rejected": "bg-red-100 text-red-800",
        };

        return (
          <Badge
            className={statusColors[String(value)?.toLowerCase()] ||
              "bg-gray-100 text-gray-800"}
          >
            {String(value) || "Unknown"}
          </Badge>
        );
      },
    },
    {
      key: "firmware",
      title: "Firmware",
      render: (value: unknown) => (
        <div className="w-[350px] max-w-full whitespace-normal break-words overflow-visible">
          <span className="text-sm font-mono">
            {String(value) || "N/A"}
          </span>
        </div>
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
    {
      key: "updated_at",
      title: "Updated",
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
      label: "Sync from Confluence",
      onClick: handleSync,
      variant: "outline",
      icon: <Download className="h-4 w-4 mr-2" />,
    },
    {
      label: "Add Product",
      onClick: () => setCreateDialogOpen(true),
      variant: "default",
    },
  ];
  // Define table actions
  const rowActions: ActionRow<Product>[] = [
    {
      label: <Eye className="h-4 w-4" />,
      onClick: (product) => {
        setSelectedProduct(toProductFormData(product));
        setViewDialogOpen(true);
      },
      className: "text-blue-600 hover:text-blue-800",
    },
    {
      label: <Pencil className="h-4 w-4" />,
      onClick: (product) => {
        setSelectedProduct(toProductFormData(product));
        setEditDialogOpen(true);
      },
      className: "text-green-600 hover:text-green-800",
      hidden: (product) => product.status?.toLowerCase() === "approved",
    },
    {
      label: <Trash2 className="h-4 w-4" />,
      onClick: handleDelete,
      className: "text-red-600 hover:text-red-800",
      hidden: (product) => product.status?.toLowerCase() === "approved",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Products Table */}

      <DataTable
        fetchURL="/api/products"
        columns={columns}
        actionsRow={rowActions}
        refreshTrigger={refreshTrigger}
        actionsTable={tableActions}
        searchPlaceholder="Search products by title, firmware, or status..."
        emptyMessage="No products found. Click 'Add Product' to create your first product."
        initialPageSize={200}
      />

      {/* View Product Dialog */}
      <ViewProductDialog
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
        productId={selectedProduct?.id || null}
      />

      {/* Create Product Dialog */}
      <CreateProductDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={() => {
          setCreateDialogOpen(false);
          setRefreshTrigger((prev) => prev + 1);
        }}
      />

      {/* Edit Product Dialog */}
      {selectedProduct && (
        <EditProductDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          product={selectedProduct}
          onSuccess={() => {
            setEditDialogOpen(false);
            setRefreshTrigger((prev) => prev + 1);
          }}
        />
      )}

      {/* Sync from Confluence Dialog */}
      <SyncDialog
        open={syncDialogOpen}
        onOpenChange={setSyncDialogOpen}
        onSuccess={() => {
          setRefreshTrigger((prev) => prev + 1);
        }}
      />
    </div>
  );
}
