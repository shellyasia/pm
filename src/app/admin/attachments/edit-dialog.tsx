"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Attachment } from "@/lib/db/table_attachment";
import {
  SelectOptionItem,
  SelectOptions,
} from "@/components/ui/select-options";
import { toast } from "sonner";
import { useMeta } from "@/contexts/meta-context";

interface EditDialogProps {
  productOptions: SelectOptionItem[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  attachment: Attachment | null;
  onEditSuccess: () => void;
}

export function EditDialog(
  { open, onOpenChange, attachment, onEditSuccess, productOptions }:
    EditDialogProps,
) {
  const { meta } = useMeta();
  const [editName, setEditName] = useState("");
  const [editRemark, setEditRemark] = useState("");
  const [editTag, setEditTag] = useState<string>("none");
  const [editStatus, setEditStatus] = useState("active");
  const [productCode, setProductCode] = useState<string>("");

  // Update form state when attachment changes
  useEffect(() => {
    if (attachment) {
      setEditName(attachment.name);
      setEditRemark(attachment.remark || "");
      setEditTag(attachment.tag || "none");
      setEditStatus(attachment.status);
      setProductCode(attachment.product_code || "");
    }
  }, [attachment]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!attachment) return;

    try {
      const response = await fetch(`/api/attachments/${attachment.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName,
          remark: editRemark,
          tag: editTag === "none" ? "" : editTag,
          status: editStatus,
          product_code: productCode,
        }),
      });

      if (response.ok) {
        onOpenChange(false);
        onEditSuccess();
      } else {
        const error = await response.json();
        toast("Update failed: " + error.error);
      }
    } catch (error) {
      console.error("Update failed:", error);
      toast("Update failed");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-full max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Edit Attachment</DialogTitle>
          <DialogDescription>
            Update attachment information
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto min-h-0 space-y-4">
          {/* File Information Section */}
          {attachment && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 space-y-3">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full">
                </div>
                <h3 className="font-semibold text-gray-800 text-base">
                  File Information
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="flex flex-col md:col-span-2">
                  <span className="font-medium text-gray-500 text-xs uppercase tracking-wide">
                    ID/Hash
                  </span>
                  <span className="text-gray-800 font-mono text-xs break-all">
                    {attachment.id} / {attachment.hash}
                  </span>
                </div>

                <div className="flex flex-col md:col-span-2">
                  <span className="font-medium text-gray-500 text-xs uppercase tracking-wide">
                    File Type
                  </span>
                  <span className="text-gray-800 font-mono text-sm">
                    {attachment.mimetype}
                  </span>
                </div>

                <div className="flex flex-col">
                  <span className="font-medium text-gray-500 text-xs uppercase tracking-wide">
                    File Size
                  </span>
                  <span className="text-gray-800">
                    {formatFileSize(attachment.size)}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="font-medium text-gray-500 text-xs uppercase tracking-wide">
                    Download Count
                  </span>
                  <span className="text-gray-800">
                    {attachment.download_count || 0} downloads
                  </span>
                </div>

                <div className="flex flex-col">
                  <span className="font-medium text-gray-500 text-xs uppercase tracking-wide">
                    Created
                  </span>
                  <span className="text-gray-800">
                    {new Date(attachment.created_at)
                      .toLocaleString()}
                  </span>
                </div>
                {attachment.updated_at && (
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-500 text-xs uppercase tracking-wide">
                      Last Updated
                    </span>
                    <span className="text-gray-800">
                      {new Date(attachment.updated_at)
                        .toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          <form onSubmit={handleSaveEdit} className="space-y-4 p-2">
            <div>
              <Label htmlFor="product_code">
                Belong to Product
              </Label>
              <SelectOptions
                options={productOptions}
                value={productCode}
                onValueChange={(value) => setProductCode(value as string)}
                placeholder="Select a product"
                clearable
              />
            </div>
            <div>
              <Label htmlFor="edit-name">Sub Name</Label>
              <Input
                id="edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Enter sub name"
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-remark">Remark</Label>
              <Textarea
                id="edit-remark"
                value={editRemark}
                onChange={(e) => setEditRemark(e.target.value)}
                placeholder="Add any notes about this file"
              />
            </div>
            <div>
              <Label>Tag</Label>
              <RadioGroup
                value={editTag}
                onValueChange={setEditTag}
                className="flex flex-row flex-wrap gap-4 mt-2"
              >
                {meta?.optionsTag.map((tag) => (
                  <div key={tag} className="flex items-center space-x-2">
                    <RadioGroupItem value={tag} id={`tag-${tag}`} />
                    <Label
                      htmlFor={`tag-${tag}`}
                      className="font-normal cursor-pointer"
                    >
                      {tag.charAt(0).toUpperCase() + tag.slice(1)}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
            <div>
              <Label>Status</Label>
              <RadioGroup
                value={editStatus}
                onValueChange={setEditStatus}
                className="flex flex-row flex-wrap gap-4 mt-2"
              >
                {meta?.optionsStatus.map((status) => (
                  <div key={status} className="flex items-center space-x-2">
                    <RadioGroupItem value={status} id={`status-${status}`} />
                    <Label
                      htmlFor={`status-${status}`}
                      className="font-normal cursor-pointer"
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={!productCode}>
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
