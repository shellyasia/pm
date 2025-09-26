"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Save } from "lucide-react";
import { useMeta } from "@/contexts/meta-context";

export interface ProductFormData {
  id?: string;
  code: string;
  status: string;
  firmware: string;
  html: string;
  updated_at?: Date;
  created_at?: Date;
}

interface EditProductDialogProps {
  product: ProductFormData;
  onSuccess?: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const statusOptions = [
  { value: "crawler", label: "Crawler" },
  { value: "edited", label: "Edited" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

export default function EditProductDialog(
  { product, onSuccess, open: externalOpen, onOpenChange }:
    EditProductDialogProps,
) {
  const { meta } = useMeta();
  const [internalOpen, setInternalOpen] = useState(false);
  const open = externalOpen !== undefined ? externalOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<ProductFormData>({
    code: product?.code || "",
    status: product?.status || "crawler",
    firmware: product?.firmware || "",
    html: product?.html || "",
  });

  // Reset form when dialog opens/closes or product changes
  useEffect(() => {
    if (open && product) {
      setFormData({
        code: product.code || "",
        status: product.status || "crawler",
        firmware: product.firmware || "",
        html: product.html || "",
      });
    }
  }, [open, product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/products/${product.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to update product");
      }

      await response.json();
      setOpen(false);
      onSuccess?.();
    } catch (error) {
      console.error("Error updating product:", error);
      alert(
        error instanceof Error ? error.message : "Failed to update product",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof ProductFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-6xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Edit Product: {product.code}</DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto min-h-0"
        >
          {/* Form Section */}
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="id">ID</Label>
                <Input
                  id="id"
                  type="text"
                  value={product.id || ""}
                  className="w-full font-mono"
                  disabled
                  readOnly
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="wikiUrl">WIKI URL</Label>
                <div className="flex gap-2">
                  <Input
                    id="wikiUrl"
                    type="text"
                    value={product.id
                      ? `${meta?.confluenceBaseURL}/wiki/spaces/Production/pages/${product.id}/`
                      : ""}
                    className="flex-1"
                    disabled
                    readOnly
                  />
                  {product.id && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        window.open(
                          `${meta?.confluenceBaseURL}/wiki/spaces/Production/pages/${product.id}/`,
                          "_blank",
                        )}
                    >
                      Open
                    </Button>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Product Code *</Label>
                <Input
                  id="title"
                  type="text"
                  value={formData.code}
                  onChange={(e) => handleInputChange("code", e.target.value)}
                  placeholder="Enter product code"
                  required
                  className="w-full"
                  disabled={formData.status === "crawler"}
                  readOnly={formData.status === "crawler"}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="firmware">Firmware</Label>
                <Input
                  id="firmware"
                  type="text"
                  value={formData.firmware}
                  onChange={(e) => handleInputChange("firmware", e.target.value)}
                  placeholder="e.g., v1.2.3"
                  className="font-mono"
                  disabled={formData.status === "crawler"}
                  readOnly={formData.status === "crawler"}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <RadioGroup
                  value={formData.status}
                  onValueChange={(value) => handleInputChange("status", value)}
                  className="flex flex-row gap-4"
                >
                  {statusOptions.map((option) => (
                    <div
                      key={option.value}
                      className="flex items-center space-x-2"
                    >
                      <RadioGroupItem value={option.value} id={option.value} />
                      <Label
                        htmlFor={option.value}
                        className="font-normal cursor-pointer"
                      >
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </div>

            {/* Action Buttons */}

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !formData.code.trim()}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
