"use client";

import { useState } from "react";
import {
  ActionRow,
  ActionTable,
  Column,
  DataTable,
} from "@/components/ui/data-table";

import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  Download,
  ExternalLink,
  Pencil,
  RefreshCw,
  Trash2,
  Upload,
} from "lucide-react";
import { Attachment } from "@/lib/db/table_attachment";
import { UploadDialog } from "./upload-dialog";
import { EditDialog } from "./edit-dialog";
import { SyncDialog } from "./sync-dialog";
import { useProductOptions } from "@/contexts/use-products";
import { toast } from "sonner";
import { confluenceWikiProductURL } from "@/lib/confluence/wiki";

export default function AttachmentsPage() {
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [syncDialogOpen, setSyncDialogOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [editingAttachment, setEditingAttachment] = useState<
    Attachment | null
  >(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [productOptions] = useProductOptions();

  // Handle attachment deletion
  const handleDelete = async (attachment: Attachment) => {
    if (
      !confirm(
        `Are you sure you want to delete attachment "${attachment.name}"?`,
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/attachments/${attachment.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete attachment");
      }

      // Trigger refresh
      setRefreshTrigger((prev) => prev + 1);
    } catch (error) {
      alert(
        error instanceof Error ? error.message : "Failed to delete attachment",
      );
    }
  };

  // Handle edit attachment
  const handleEdit = (attachment: Attachment) => {
    setEditingAttachment(attachment);
    setEditDialogOpen(true);
  };

  // Callback functions for dialogs
  const handleUploadSuccess = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleEditSuccess = () => {
    setEditingAttachment(null);
    setRefreshTrigger((prev) => prev + 1);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Define table columns
  const columns: Column<Attachment>[] = [
    {
      key: "name",
      title: "Attachment Info",
      sortable: true,
      searchable: true,
      className: "max-w-[200px]",
      render: (_value: unknown, attachment: Attachment) => (
        <div className="space-y-2 py-1">
          {/* Name with icon */}
          <div className="flex items-start gap-2">
            <div className="flex-1 min-w-0">
              <div
                className="font-semibold text-sm truncate"
                title={attachment.name}
              >
                {attachment.name}
              </div>
              <div className="text-xs text-muted-foreground font-mono mt-2">
                <a
                  href={confluenceWikiProductURL(
                    String(attachment.id),
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline inline-flex items-center gap-1"
                >
                  <ExternalLink className="h-3 w-3" />
                  {attachment.id}
                </a>
              </div>
            </div>
          </div>
          {/* Remark */}
          {attachment.remark && (
            <div className="text-xs text-muted-foreground rounded-sm break-words whitespace-normal overflow-wrap-anywhere">
              {attachment.remark}
            </div>
          )}
        </div>
      ),
    },

    {
      key: "product_code",
      title: "Product Code",
      searchable: true,
      className: "w-[180px]",
      render: (value: unknown) => (
        <span className="font-mono text-xs break-words whitespace-normal overflow-wrap-anywhere">
          {String(value)}
        </span>
      ),
      filter: {
        type: "select",
        options: productOptions,
        multiple: false,
        placeholder: "Filter by Product Code",
      },
    },
    {
      key: "status",
      title: "Status",
      sortable: false,
      className: "w-[80px]",
      render: (value: unknown) => {
        const statusColors: Record<string, string> = {
          approved: "bg-green-100 text-green-800",
          rejected: "bg-red-100 text-red-800",
          draft: "bg-yellow-100 text-yellow-800",
          inactive: "bg-gray-100 text-gray-800",
          active: "bg-blue-100 text-blue-800",
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
      key: "size",
      title: "Size",
      sortable: true,
      className: "w-[110px]",
      render: (value: unknown) => (
        <Badge variant="secondary" className="font-mono text-xs">
          {formatFileSize(Number(value))}
        </Badge>
      ),
    },
    {
      key: "download_count",
      title: "Downloads",
      sortable: true,
      className: "w-[100px]",
      render: (value: unknown) => {
        const count = Number(value);
        const variant = count > 100
          ? "default"
          : count > 10
          ? "secondary"
          : "outline";
        return (
          <Badge
            variant={variant}
            className="font-semibold flex items-center gap-1"
          >
            <Download className="h-3 w-3" /> {String(value)}
          </Badge>
        );
      },
    },
    {
      key: "tag",
      title: "Tag",
      className: "w-[140px]",
      render: (value: unknown) => {
        if (!value) {
          return (
            <Badge
              variant="outline"
              className="text-xs text-muted-foreground"
            >
              No tag
            </Badge>
          );
        }
        return (
          <Badge
            variant="default"
            className="text-xs bg-gradient-to-r from-blue-500 to-purple-500"
          >
            {String(value)}
          </Badge>
        );
      },
    },
    {
      key: "created_at",
      title: "Created",
      sortable: true,
      className: "w-[160px]",
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

  const handleSyncFirmware = async () => {
    setIsSyncing(true);
    try {
      const response = await fetch("/api/products/spider-firmware");

      if (!response.ok) {
        throw new Error("Failed to sync firmware");
      }

      const data = await response.json();
      toast(`Successfully synced ${data.firmware} firmware attachments`);

      // Trigger refresh
      setRefreshTrigger((prev) => prev + 1);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to sync firmware",
      );
    } finally {
      setIsSyncing(false);
    }
  };

  const tableActions: ActionTable[] = [
    {
      label: "Upload File",
      onClick: () => setUploadDialogOpen(true),
      icon: <Upload className="h-4 w-4 mr-2" />,
    },
  ];

  // Define table actions
  const rowActions: ActionRow<Attachment>[] = [
    {
      label: <Download className="h-4 w-4" />,
      onClick: (attachment: Attachment) =>
        window.open(
          `/api/attachments/download/${attachment.hash}`,
          "_blank",
        ),
      className:
        "text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2 py-1 rounded transition-colors",
    },
    {
      label: <Pencil className="h-4 w-4" />,
      onClick: handleEdit,
      className:
        "text-green-600 hover:text-green-800 hover:bg-green-50 px-2 py-1 rounded transition-colors",
    },
    {
      label: <Trash2 className="h-4 w-4" />,
      onClick: handleDelete,
      className:
        "text-red-600 hover:text-red-800 hover:bg-red-50 px-2 py-1 rounded transition-colors",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Attachments Table */}
      <DataTable
        columns={columns}
        actionsRow={rowActions}
        fetchURL="/api/attachments"
        actionsTable={tableActions}
        refreshTrigger={refreshTrigger}
        initialPageSize={200}
        searchPlaceholder="Search attachments by name or filename..."
        emptyMessage="No attachments found. Click 'Upload File' to add your first attachment."
      />

      {/* Dialogs */}
      <UploadDialog
        open={uploadDialogOpen}
        productOptions={productOptions}
        onOpenChange={setUploadDialogOpen}
        onUploadSuccess={handleUploadSuccess}
      />

      <EditDialog
        open={editDialogOpen}
        productOptions={productOptions}
        onOpenChange={setEditDialogOpen}
        attachment={editingAttachment}
        onEditSuccess={handleEditSuccess}
      />

      <SyncDialog
        open={syncDialogOpen}
        onOpenChange={setSyncDialogOpen}
        isSyncing={isSyncing}
        onSync={handleSyncFirmware}
      />
    </div>
  );
}
