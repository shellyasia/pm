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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Save } from "lucide-react";
import { Order } from "@/lib/db/table_order";

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

interface EditDialogProps {
  productOptions: SelectOptionItem[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: Order | null;
  onEditSuccess: () => void;
}

export function EditDialog(
  {
    open,
    onOpenChange,
    order,
    onEditSuccess,
    productOptions,
  }: EditDialogProps,
) {
  const { meta } = useMeta();
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

  // Update form state when order changes
  useEffect(() => {
    if (order) {
      setFormData({
        name: order.name || "",
        product_code: order.product_code || "",
        factory: order.factory || "",
        priority: order.priority || "normal",
        quantity: order.quantity || 1,
        batch: order.batch || "",
        status: order.status || "draft",
        remark: order.remark || "",
      });
    }
  }, [order]);

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/orders/${order.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        onOpenChange(false);
        onEditSuccess();
      } else {
        const error = await response.json();
        alert("Update failed: " + error.error);
      }
    } catch (error) {
      console.error("Update failed:", error);
      alert("Update failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Edit Order</DialogTitle>
          <DialogDescription>
            Update order information
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto min-h-0 space-y-6">
          {/* Order Information Section */}
          {order && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 space-y-3">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full">
                </div>
                <h4 className="font-semibold text-gray-900">
                  Order Details
                </h4>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div className="flex flex-col">
                  <span className="font-medium text-gray-500 text-xs uppercase tracking-wide">
                    Order ID
                  </span>
                  <span className="text-gray-800 font-mono">
                    {order.id}
                  </span>
                </div>

                <div className="flex flex-col">
                  <span className="font-medium text-gray-500 text-xs uppercase tracking-wide">
                    Created
                  </span>
                  <span className="text-gray-800">
                    {new Date(order.created_at)
                      .toLocaleString()}
                  </span>
                </div>
                {order.updated_at && (
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-500 text-xs uppercase tracking-wide">
                      Last Updated
                    </span>
                    <span className="text-gray-800">
                      {new Date(order.updated_at)
                        .toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          <form onSubmit={handleSaveEdit} className="space-y-6 p-2">
            <div className="grid grid-cols-2 gap-6">
              {/* Basic Information */}

              <div className="space-y-2">
                <Label htmlFor="name">
                  Order Name
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))}
                  placeholder="Enter order name"
                />
                <p className="text-xs text-muted-foreground">
                  Name imported from Excel or custom label
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="product_code">
                  Belong to Product
                </Label>
                <SelectOptions
                  options={productOptions}
                  value={formData.product_code}
                  onValueChange={(value) => {
                    setFormData((prev) => ({
                      ...prev,
                      product_code: value as string,
                    }));
                  }}
                  placeholder="Select a product"
                  clearable
                />
              </div>

              {/* Factory Selection */}
              <div className="space-y-2">
                <Label htmlFor="factory">Factory *</Label>
                <Select
                  value={formData.factory}
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      factory: value,
                    }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a factory" />
                  </SelectTrigger>
                  <SelectContent>
                    {meta?.optionsFactory.map((factory) => (
                      <SelectItem
                        key={factory}
                        value={factory}
                      >
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
                    setFormData((prev) => ({
                      ...prev,
                      priority: value,
                    }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    {meta?.optionsPriority.map((priority) => (
                      <SelectItem
                        key={priority}
                        value={priority}
                      >
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

   
            </div>
           {/* Status */}
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <RadioGroup
                  value={formData.status}
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      status: value,
                    }))}
                >
                  {meta?.optionsStatus.map((status) => (
                    <div
                      key={status}
                      className="flex items-center space-x-2"
                    >
                      <RadioGroupItem
                        value={status}
                        id={`status-${status}`}
                      />
                      <Label
                        htmlFor={`status-${status}`}
                        className="font-normal cursor-pointer"
                      >
                        {status}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
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
                onClick={() => onOpenChange(false)}
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
                {isSubmitting ? "Updating..." : "Update Order"}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
