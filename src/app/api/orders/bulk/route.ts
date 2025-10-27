import { NextResponse } from "next/server";
import { AuthenticatedRequest, withEditorOrAdmin, withShellyCompany } from "@/lib/auth/middleware";
import { OrderInsert, orderInsert } from "@/lib/db/table_order";
import { dbProductAll } from "@/lib/db/table_product";

interface BulkOrderRequest {
  id?: string;
  name: string;
  quantity: number;
  batch: string;
  factory: string;
  date?: string;
  remark?: string;
}

// POST /api/orders/bulk - Create multiple orders from Excel import
export const POST = withShellyCompany(withEditorOrAdmin(async (req: AuthenticatedRequest) => {
  try {
    const { orders }: { orders: BulkOrderRequest[] } = await req.json();

    if (!Array.isArray(orders) || orders.length === 0) {
      return NextResponse.json(
        { error: "Orders array is required and must not be empty" },
        { status: 400 },
      );
    }

    // Validate each order
    const validationErrors: string[] = [];
    orders.forEach((order, index) => {
      if (!order.name || order.name.trim() === "") {
        validationErrors.push(`Order ${index + 1}: Product name is required`);
      }
      if (!order.quantity || order.quantity <= 0) {
        validationErrors.push(`Order ${index + 1}: Valid quantity is required`);
      }
      if (!order.factory || order.factory.trim() === "") {
        validationErrors.push(`Order ${index + 1}: Factory is required`);
      }
      if (!order.batch || order.batch.trim() === "") {
        validationErrors.push(`Order ${index + 1}: Batch is required`);
      }
    });

    if (validationErrors.length > 0) {
      return NextResponse.json(
        { error: "Validation failed", details: validationErrors },
        { status: 400 },
      );
    }

    // Try to match products by name (for optional auto-matching)
    const productCache = new Map<string, string>();

    // Get all products to match against names
    const { rows: allProducts } = await dbProductAll("", 1, 1000);
    allProducts.forEach((product) => {
      productCache.set(product.code.toLowerCase(), product.code);
    });

    // Prepare order inserts
    const orderInserts: OrderInsert[] = [];
    const unmatchedProducts: string[] = [];

    for (const order of orders) {
      const productName = order.name.toLowerCase();
      let product_code = productCache.get(productName);

      // If no exact match, try partial matching
      if (!product_code) {
        const matchedProduct = allProducts.find((p) =>
          p.code.toLowerCase().includes(productName) ||
          productName.includes(p.code.toLowerCase())
        );
        if (matchedProduct) {
          product_code = matchedProduct.code;
        }
      }

      // Track unmatched products for reporting
      if (!product_code) {
        unmatchedProducts.push(order.name);
      }

      const orderData: OrderInsert = {
        id: order.id, // Use provided ID if available, otherwise will be auto-generated
        name: order.name, // Always save the name from Excel
        product_code: product_code, // May be undefined for unmatched products - user can select later
        factory: order.factory.toLowerCase(),
        priority: "normal", // Default priority
        quantity: order.quantity,
        batch: order.batch,
        status: "draft", // Default status for imported orders
        remark: order.remark, // Include remark from import (contains errors if any)
        comments: [
          {
            email: req.user?.email || "system",
            content: `init`,
            created_at: new Date().toISOString(),
            action: "created",
          },
        ],
      };

      orderInserts.push(orderData);
    }

    // Insert orders one by one to handle duplicates gracefully
    const createdOrders = [];
    const skippedOrders: string[] = [];

    for (const orderData of orderInserts) {
      try {
        const result = await orderInsert(orderData);
        createdOrders.push(...result);
      } catch (error) {
        // Check if it's a duplicate key error
        if (
          error instanceof Error && error.message.includes("already exists")
        ) {
          skippedOrders.push(orderData.id || "unknown");
          console.log(`Skipping duplicate order: ${orderData.id}`);
        } else {
          // Re-throw other errors
          throw error;
        }
      }
    }

    // Prepare response with warnings
    const warnings = [];
    if (unmatchedProducts.length > 0) {
      warnings.push(
        `${unmatchedProducts.length} products could not be auto-matched. Product codes can be selected later in the order edit dialog.`,
      );
    }
    if (skippedOrders.length > 0) {
      warnings.push(
        `${skippedOrders.length} orders were skipped (already exist): ${
          skippedOrders.join(", ")
        }`,
      );
    }

    const response = {
      success: true,
      created: createdOrders.length,
      skipped: skippedOrders.length,
      orders: createdOrders,
      warnings: warnings.length > 0
        ? {
          unmatchedProducts,
          skippedOrders,
          message: warnings.join(" "),
        }
        : undefined,
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error("Error creating bulk orders:", error);
    return NextResponse.json(
      {
        error: "Failed to create orders",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}));
