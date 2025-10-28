"use client";

import { useRef, useState } from "react";
import * as XLSX from "xlsx";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";
import {
  AlertCircle,
  CheckCircle,
  Download,
  FileSpreadsheet,
  Upload,
  X,
} from "lucide-react";

interface ParsedOrder {
  id?: string;
  product_code?: string;
  name: string;
  quantity: number;
  batch: string;
  factory: string;
  date?: string;
  remark?: string;
  isValid: boolean;
  errors: string[];
}

interface ExcelImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (orders: ParsedOrder[]) => Promise<void>;
}

export function ExcelImportDialog(
  { isOpen, onClose, onImport }: ExcelImportDialogProps,
) {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedOrder[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetState = () => {
    setFile(null);
    setParsedData([]);
    setErrors([]);
    setIsProcessing(false);
    setIsImporting(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      processFile(selectedFile);
    }
  };

  const processFile = async (file: File) => {
    setIsProcessing(true);
    setErrors([]);
    setParsedData([]);

    try {
      // Fetch all products to validate against (for optional auto-matching)
      let productCodes: Set<string> = new Set();
      try {
        const response = await fetch(
          "/api/products?page=1&limit=1000&fast=true",
        );
        if (response.ok) {
          const data = await response.json();
          const rows = data.rows || [];
          productCodes = new Set(
            rows.map((p: { code: string }) => p.code.toLowerCase().trim()),
          );
        }
      } catch (err) {
        console.error("Failed to fetch products:", err);
        // Continue with empty product set - product_code will be empty, name will be saved
      }

      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });

      // Get the first worksheet
      const worksheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[worksheetName];

      // Convert to JSON with header option to get all rows as arrays
      const rawData = XLSX.utils.sheet_to_json<
        (string | number | boolean | null | undefined)[]
      >(worksheet, { header: 1, defval: "" });

      if (rawData.length < 2) {
        setErrors([
          "Excel file must contain at least a header row and one data row",
        ]);
        return;
      }

      // Skip header row (first row) and process data rows
      const dataRows = rawData.slice(1);

      // Parse and validate each row
      const parsed: ParsedOrder[] = [];
      const processingErrors: string[] = [];

      dataRows.forEach((row, index) => {
        const rowNumber = index + 2; // Excel row number (1-based + header)

        // Skip empty rows - check if all relevant cells are empty
        const id = row[1]?.toString().trim(); // Column B (index 1)
        const name = row[2]?.toString().trim(); // Column C (index 2)
        const quantityStr = row[3]?.toString().trim(); // Column D (index 3)
        const batch = row[4]?.toString().trim(); // Column E (index 4)
        const factory = row[5]?.toString().trim(); // Column F (index 5)
        const date = row[6]?.toString().trim(); // Column G (index 6)

        // Skip if all important fields are empty
        if (!name && !quantityStr && !batch && !factory) {
          return;
        }

        const errors: string[] = [];

        // Validate required fields
        if (!name) {
          errors.push("Product name is required");
        }

        // Parse quantity - remove commas and parse as number
        const quantity = quantityStr
          ? parseInt(quantityStr.replace(/,/g, ""))
          : 0;
        if (isNaN(quantity) || quantity <= 0) {
          errors.push("Valid quantity is required");
        }

        if (!factory) {
          errors.push("Factory is required");
        }

        if (!batch) {
          errors.push("Batch is required");
        }

        // Check if name matches a product code (for optional auto-matching)
        const nameToCheck = name?.toLowerCase().trim();
        const isProductCode = nameToCheck
          ? productCodes.has(nameToCheck)
          : false;

        // Build remark field only for errors
        const remarkParts: string[] = [];

        // Add errors if any
        if (errors.length > 0) {
          remarkParts.push(`Import errors: ${errors.join("; ")}`);
          processingErrors.push(`Row ${rowNumber}: ${errors.join(", ")}`);
        }

        const parsedOrder: ParsedOrder = {
          id: id || undefined,
          product_code: isProductCode ? name : undefined, // Auto-match if found, otherwise leave empty
          name: name || "", // Always save the name field
          quantity: quantity,
          batch: batch || "",
          factory: factory?.toLowerCase() || "",
          date: date || "",
          remark: remarkParts.length > 0 ? remarkParts.join(" | ") : undefined,
          isValid: errors.length === 0,
          errors,
        };

        parsed.push(parsedOrder);
      });

      // Check for duplicate IDs within the imported file
      const idMap = new Map<string, number[]>();
      parsed.forEach((order, index) => {
        if (order.id) {
          if (!idMap.has(order.id)) {
            idMap.set(order.id, []);
          }
          idMap.get(order.id)!.push(index + 2); // Excel row number (1-based + header)
        }
      });

      // Mark duplicate IDs as invalid
      const duplicateIds = Array.from(idMap.entries()).filter(
        ([, rows]) => rows.length > 1,
      );
      if (duplicateIds.length > 0) {
        duplicateIds.forEach(([id, rows]) => {
          rows.forEach((rowNum) => {
            const orderIndex = rowNum - 2; // Convert back to array index
            if (parsed[orderIndex]) {
              parsed[orderIndex].isValid = false;
              const duplicateError =
                `Duplicate ID "${id}" (appears in rows: ${rows.join(", ")})`;
              parsed[orderIndex].errors.push(duplicateError);

              // Update remark to include duplicate error
              const remarkParts = parsed[orderIndex].remark
                ? [parsed[orderIndex].remark]
                : [];
              remarkParts.push(`Duplicate ID error: ${duplicateError}`);
              parsed[orderIndex].remark = remarkParts.join(" | ");
            }
          });
          processingErrors.push(
            `Duplicate ID "${id}" found in rows: ${rows.join(", ")}`,
          );
        });
      }

      if (processingErrors.length > 0) {
        setErrors(processingErrors);
      }

      if (parsed.length === 0) {
        setErrors(["No valid data rows found in the Excel file"]);
      }

      setParsedData(parsed);
    } catch (error) {
      setErrors([
        `Failed to process Excel file: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImport = async () => {
    // Check if there are any invalid rows - if so, block the entire import
    const invalidOrders = parsedData.filter((order) => !order.isValid);
    
    if (invalidOrders.length > 0) {
      setErrors([
        `Cannot import: ${invalidOrders.length} row(s) contain errors. Please fix all errors before importing.`
      ]);
      return;
    }

    if (parsedData.length === 0) {
      setErrors(["No orders to import"]);
      return;
    }

    setIsImporting(true);
    try {
      await onImport(parsedData);
      handleClose();
    } catch (error) {
      setErrors([
        `Import failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      ]);
    } finally {
      setIsImporting(false);
    }
  };

  const validCount = parsedData.filter((order) => order.isValid).length;
  const invalidCount = parsedData.filter((order) => !order.isValid).length;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Import Orders from Excel
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto min-h-0 space-y-6">
          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="excel-file">Select Excel File</Label>
            <div className="flex items-center gap-4">
              <Input
                id="excel-file"
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileSelect}
                ref={fileInputRef}
                className="flex-1"
              />
              {file && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <FileSpreadsheet className="h-3 w-3" />
                  {file.name}
                </Badge>
              )}
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Expected columns: B=ID, C=Name, D=Quantity, E=Batch, F=Factory,
                G=Created_at<br />
                <span className="text-xs">
                  Name will be saved to order. Product code can be auto-matched
                  or selected later.
                </span>
              </p>
              <a
                href="/order-import-template.xlsx"
                download
                className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 hover:underline"
              >
                <Download className="h-4 w-4" />
                Download Template
              </a>
            </div>
          </div>

          {/* Processing Status */}
          {isProcessing && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Upload className="h-4 w-4 animate-pulse" />
              Processing Excel file...
            </div>
          )}

          {/* Errors */}
          {errors.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <div>
                <p className="font-medium">Import Errors</p>
                <ul className="mt-2 list-disc list-inside space-y-1">
                  {errors.map((error, index) => (
                    <li key={index} className="text-sm">{error}</li>
                  ))}
                </ul>
              </div>
            </Alert>
          )}

          {/* Summary */}
          {parsedData.length > 0 && (
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">
                  {validCount} Valid Orders
                </span>
              </div>
              {invalidCount > 0 && (
                <div className="flex items-center gap-2">
                  <X className="h-4 w-4 text-red-600" />
                  <span className="text-sm font-medium">
                    {invalidCount} Invalid Orders
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Preview Table */}
          {parsedData.length > 0 && (
            <div className="space-y-2">
              <Label>Preview ({parsedData.length} rows)</Label>
              <div className="border rounded-lg max-h-96 overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Status</TableHead>
                      <TableHead>ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Batch</TableHead>
                      <TableHead>Factory</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Remark</TableHead>
                      <TableHead>Errors</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parsedData.map((order, index) => (
                      <TableRow
                        key={index}
                        className={!order.isValid ? "bg-red-50" : ""}
                      >
                        <TableCell>
                          {order.isValid
                            ? <CheckCircle className="h-4 w-4 text-green-600" />
                            : <X className="h-4 w-4 text-red-600" />}
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {order.id || (
                            <span className="text-muted-foreground italic">
                              auto
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <span>{order.name}</span>
                            {order.product_code && (
                              <Badge
                                variant="outline"
                                className="bg-green-50 text-green-700 border-green-200 text-xs"
                              >
                                Matched: {order.product_code}
                              </Badge>
                            )}
                            {!order.product_code && (
                              <Badge
                                variant="outline"
                                className="bg-yellow-50 text-yellow-700 border-yellow-200 text-xs"
                              >
                                No match - can select later
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{order.quantity.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{order.batch}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge>{order.factory.toUpperCase()}</Badge>
                        </TableCell>
                        <TableCell>{order.date}</TableCell>
                        <TableCell>
                          {order.remark && (
                            <span className="text-sm text-orange-600 italic">
                              {order.remark}
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          {order.errors.length > 0 && (
                            <div className="text-sm text-red-600">
                              {order.errors.join(", ")}
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex-shrink-0">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isImporting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            disabled={!file || parsedData.length === 0 || invalidCount > 0 || isImporting}
            className="flex items-center gap-2"
          >
            {isImporting && <Upload className="h-4 w-4 animate-pulse" />}
            Import {validCount > 0 ? `${validCount} Orders` : ""}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
