"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Calendar,
  Clock,
  Download,
  ExternalLink,
  FileText,
  Paperclip,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Product } from "@/lib/db/table_product";
import { Attachment } from "@/lib/db/table_attachment";
import { ProductFormData } from "./edit-dialog";
import { confluenceWikiProductURL } from "@/lib/confluence/wiki";

interface ProductDetailState {
  product: ProductFormData | null;
  attachments: Attachment[];
  loading: boolean;
  loadingAttachments: boolean;
  error: string | null;
}

interface ViewProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: string | null;
}

export default function ViewProductDialog({
  open,
  onOpenChange,
  productId,
}: ViewProductDialogProps) {
  const [state, setState] = useState<ProductDetailState>({
    product: null,
    attachments: [],
    loading: true,
    loadingAttachments: false,
    error: null,
  });

  const toProductFormData = (product: Product): ProductFormData => {
    return {
      ...product,
      created_at: product.created_at ? new Date(product.created_at) : undefined,
      updated_at: product.updated_at ? new Date(product.updated_at) : undefined,
    };
  };

  // Load attachments for a product
  const loadAttachments = useCallback(async (productCode: string) => {
    setState((prev) => ({ ...prev, loadingAttachments: true }));

    try {
      const response = await fetch(
        `/api/attachments?product_code=${
          encodeURIComponent(productCode)
        }&limit=100`,
      );

      if (!response.ok) {
        throw new Error("Failed to load attachments");
      }

      const data = await response.json();

      setState((prev) => ({
        ...prev,
        attachments: data.rows || [],
        loadingAttachments: false,
      }));
    } catch (error) {
      console.error("Error loading attachments:", error);
      setState((prev) => ({
        ...prev,
        attachments: [],
        loadingAttachments: false,
      }));
    }
  }, []);

  // Load product data
  const loadProduct = useCallback(async (id: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const response = await fetch(`/api/products/${id}`);

      if (!response.ok) {
        throw new Error("Failed to load product");
      }

      const product: Product = await response.json();
      const productFormData = toProductFormData(product);

      setState((prev) => ({
        ...prev,
        product: productFormData,
        loading: false,
      }));

      // Load attachments for this product
      await loadAttachments(productFormData.code);
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error
          ? error.message
          : "Failed to load product",
        loading: false,
      }));
    }
  }, [loadAttachments]);

  // Load product when dialog opens and productId changes
  useEffect(() => {
    if (open && productId) {
      loadProduct(productId);
    }
  }, [open, productId, loadProduct]);

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setState({
        product: null,
        attachments: [],
        loading: true,
        loadingAttachments: false,
        error: null,
      });
    }
  }, [open]);

  const getStatusColor = (status: string) => {
    const statusColors: Record<string, string> = {
      "active": "bg-green-100 text-green-800",
      "draft": "bg-yellow-100 text-yellow-800",
      "archived": "bg-gray-100 text-gray-800",
      "published": "bg-blue-100 text-blue-800",
    };
    return statusColors[status?.toLowerCase()] || "bg-gray-100 text-gray-800";
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleDownloadAttachment = (attachment: Attachment) => {
    window.open(
      `/api/attachments/download/${attachment.hash}`,
      "_blank",
    );
  };

  const getTagColor = (tag: string) => {
    const tagColors: Record<string, string> = {
      "manual": "bg-blue-100 text-blue-800",
      "firmware": "bg-purple-100 text-purple-800",
      "printing": "bg-green-100 text-green-800",
      "testing": "bg-yellow-100 text-yellow-800",
      "certificate": "bg-orange-100 text-orange-800",
    };
    return tagColors[tag?.toLowerCase()] || "bg-gray-100 text-gray-800";
  };

  const { product } = state;
  const confluenceWikiPageURL = product?.id
    ? confluenceWikiProductURL(product.id)
    : "#";

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl max-h-[90vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>
              <div>
                <span>{product?.code || "Product Details"}</span>
                {product && (
                  <p className="text-sm text-muted-foreground font-normal mt-1">
                    Product ID: {product.id}
                  </p>
                )}
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto min-h-0 space-y-4">
            {state.loading && (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2">
                  </div>
                  <p className="text-muted-foreground">Loading product...</p>
                </div>
              </div>
            )}

            {state.error && !state.loading && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="pt-6">
                  <div className="text-red-800">
                    <strong>Error:</strong> {state.error}
                  </div>
                </CardContent>
              </Card>
            )}

            {product && !state.loading && (
              <div className="space-y-6 p-6">
                {/* Header Section with Key Info */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border-2 border-blue-100">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-4">
                      <div className="flex items-center gap-3 flex-wrap">
                        <Badge
                          className={getStatusColor(product.status)}
                          variant="secondary"
                        >
                          {product.status || "Unknown"}
                        </Badge>
                        {product.firmware && (
                          <span className="text-sm font-mono bg-white px-3 py-1 rounded-md border">
                            {product.firmware}
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground font-medium">
                            ID:
                          </span>
                          <span className="font-mono font-semibold">
                            {product.id}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground font-medium">
                            Product Code:
                          </span>
                          <span className="font-mono font-semibold">
                            {product.code}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground font-medium">
                            Status:
                          </span>
                          <Badge
                            className={getStatusColor(product.status)}
                            variant="secondary"
                          >
                            {product.status || "Unknown"}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground font-medium">
                            Wiki:
                          </span>
                          <a
                            href={confluenceWikiPageURL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:underline"
                          >
                            <ExternalLink className="h-3 w-3" />
                            <span className="text-sm">View Documentation</span>
                          </a>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            Created:
                          </span>
                          <span className="font-medium">
                            {product.created_at instanceof Date
                              ? product.created_at.toLocaleString()
                              : "N/A"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            Updated:
                          </span>
                          <span className="font-medium">
                            {product.updated_at instanceof Date
                              ? product.updated_at.toLocaleString()
                              : "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Attachments Table */}
                <Card className="border-2">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Paperclip className="h-5 w-5 text-blue-500" />
                        <CardTitle>Product Attachments</CardTitle>
                        <Badge variant="secondary" className="ml-2">
                          {state.attachments.length}{" "}
                          file{state.attachments.length !== 1 ? "s" : ""}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {state.loadingAttachments
                      ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2">
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Loading attachments...
                            </p>
                          </div>
                        </div>
                      )
                      : state.attachments.length === 0
                      ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                          <p>No attachments found for this product</p>
                        </div>
                      )
                      : (
                        <div className="rounded-md border">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="w-[200px]">
                                  Name
                                </TableHead>
                                <TableHead className="w-[120px]">Tag</TableHead>
                                <TableHead className="w-[100px]">
                                  Size
                                </TableHead>
                                <TableHead className="w-[100px]">
                                  Downloads
                                </TableHead>
                                <TableHead className="w-[180px]">
                                  Created
                                </TableHead>
                                <TableHead className="w-[100px] text-right">
                                  Actions
                                </TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {state.attachments.map((attachment) => (
                                <TableRow key={attachment.id}>
                                  <TableCell>
                                    <div className="space-y-1 w-[250px]">
                                      <div
                                      className="font-medium break-words"
                                      title={attachment.name}
                                      >
                                      {attachment.name}
                                      </div>
                                      {attachment.remark && (
                                      <div
                                        className="text-xs text-muted-foreground break-words"
                                        title={attachment.remark}
                                      >
                                        {attachment.remark}
                                      </div>
                                      )}
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    {attachment.tag
                                      ? (
                                        <Badge
                                          className={getTagColor(
                                            attachment.tag,
                                          )}
                                          variant="secondary"
                                        >
                                          {attachment.tag}
                                        </Badge>
                                      )
                                      : (
                                        <Badge
                                          variant="outline"
                                          className="text-xs text-muted-foreground"
                                        >
                                          No tag
                                        </Badge>
                                      )}
                                  </TableCell>
                                  <TableCell>
                                    <Badge
                                      variant="secondary"
                                      className="font-mono text-xs"
                                    >
                                      {formatFileSize(attachment.size)}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-1">
                                      <Download className="h-3 w-3 text-muted-foreground" />
                                      <span className="text-sm">
                                        {attachment.download_count}
                                      </span>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    {attachment.created_at && (
                                      <div className="space-y-0.5">
                                        <div className="flex items-center gap-1 text-xs">
                                          <Calendar className="h-3 w-3 text-blue-500" />
                                          <span>
                                            {new Date(attachment.created_at)
                                              .toLocaleDateString()}
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                          <Clock className="h-3 w-3" />
                                          <span>
                                            {new Date(attachment.created_at)
                                              .toLocaleTimeString()}
                                          </span>
                                        </div>
                                      </div>
                                    )}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() =>
                                        handleDownloadAttachment(attachment)}
                                    >
                                      <Download className="h-4 w-4" />
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      )}
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
