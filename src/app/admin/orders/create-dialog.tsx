"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Save } from "lucide-react";

import {
  SelectOptionItem,
  SelectOptions,
} from "@/components/ui/select-options";
import { Textarea } from "@/components/ui/textarea";
import { useMeta } from "@/contexts/meta-context";

interface OrderFormData {
  name?: string;
  product_code: string;
  factory: string;
  priority: string;
  quantity: number;
  batch: string;
  status?: string;
  remark?: string;
}

interface CreateOrderDialogProps {
  productOptions: SelectOptionItem[];
  onSuccess?: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function CreateOrderDialog(
  {
    onSuccess,
    open: externalOpen,
    onOpenChange,
    productOptions,
  }: CreateOrderDialogProps,
) {
  const { meta } = useMeta();
  const [internalOpen, setInternalOpen] = useState(false);
  const open = externalOpen !== undefined ? externalOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<OrderFormData>({
    name: "",
    product_code: "",
    factory: "",
    priority: "normal",
    quantity: 1,
    batch: "",
    status: "draft",
    remark: "",
  });

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setFormData({
        name: "",
        product_code: "",
        factory: "",
        priority: "normal",
        quantity: 1,
        batch: "",
        status: "draft",
        remark: "",
      });
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to create order");
      }

      await response.json();
      setOpen(false);
      onSuccess?.();
    } catch (error) {
      console.error("Error creating order:", error);
      alert(error instanceof Error ? error.message : "Failed to create order");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Create New Order</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto min-h-0 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6 p-2">
            <div className="grid grid-cols-2 gap-6">
              {/* Basic Information */}

              <div className="space-y-2">
                <Label htmlFor="name">Order Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))}
                  placeholder="Enter order name (optional)"
                />
                <p className="text-xs text-muted-foreground">
                  Optional custom label or description
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="product_code">Belong to Product</Label>
                <SelectOptions
                  options={productOptions}
                  value={formData.product_code}
                  onValueChange={(value) => {
                    setFormData((prev) => ({
                      ...prev,
                      product_code: value as string,
                    }));
                  }}
                  placeholder="Select a product (optional)"
                  clearable
                />
              </div>

              {/* Factory Selection */}
              <div className="space-y-2">
                <Label htmlFor="factory">Factory *</Label>
                <Select
                  value={formData.factory}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, factory: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a factory" />
                  </SelectTrigger>
                  <SelectContent>
                    {meta?.optionsFactory.map((factory) => (
                      <SelectItem key={factory} value={factory}>
                        {factory}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Priority */}
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, priority: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    {meta?.optionsPriority.map((priority) => (
                      <SelectItem key={priority} value={priority}>
                        {priority.toLowerCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Quantity */}
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      quantity: parseInt(e.target.value) || 1,
                    }))}
                  placeholder="Enter quantity"
                />
              </div>

              {/* Batch */}
              <div className="space-y-2">
                <Label htmlFor="batch">Batch</Label>
                <Input
                  id="batch"
                  value={formData.batch}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      batch: e.target.value,
                    }))}
                  placeholder="Enter batch identifier"
                />
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {meta?.optionsStatus.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Remark - Full Width */}
            <div className="space-y-2">
              <Label htmlFor="remark">Remark</Label>
              <Textarea
                id="remark"
                value={formData.remark}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    remark: e.target.value,
                  }))}
                placeholder="Enter any additional remarks or notes"
                rows={3}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4">
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
                disabled={isSubmitting ||
                  !formData.factory}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {isSubmitting ? "Creating..." : "Create Order"}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
