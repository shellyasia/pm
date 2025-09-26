import { NextResponse } from "next/server";
import {
  dbProductDelete,
  dbProductFirst,
  dbProductUpdate,
  ProductUpdate,
} from "@/lib/db/table_product";
import { AuthenticatedRequest, withEditorOrAdmin, withAnyRole } from "@/lib/auth/middleware";

interface RouteParams {
  params: {
    id: string;
  };
}

// GET /api/products/[id] - Get product details
export const GET = withAnyRole(async (req: AuthenticatedRequest, { params }: RouteParams) => {
  try {
    const { id } = params;
    const product = await dbProductFirst(id);
    return NextResponse.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Product not found" },
      { status: 404 },
    );
  }
});

// PUT /api/products/[id] - Update product
export const PUT = withEditorOrAdmin(
  async (req: AuthenticatedRequest, { params }: RouteParams) => {
    try {
      const { id } = params;
      const body = await req.json();

      const updateData: ProductUpdate = {
        id,
        code: body.code,
        status: body.status,
        firmware: body.firmware,
        html: body.html,
      };

      const updatedProduct = await dbProductUpdate(id, updateData);
      return NextResponse.json(updatedProduct);
    } catch (error) {
      console.error("Error updating product:", error);
      return NextResponse.json(
        { error: "Failed to update product" },
        { status: 500 },
      );
    }
  },
);

// DELETE /api/products/[id] - Delete product
export const DELETE = withEditorOrAdmin(
  async (req: AuthenticatedRequest, { params }: RouteParams) => {
    try {
      const { id } = params;
      const deletedProduct = await dbProductDelete(id);
      return NextResponse.json(deletedProduct);
    } catch (error) {
      console.error("Error deleting product:", error);
      
      // Check if it's a foreign key constraint error
      if (error instanceof Error) {
        // Kysely/PostgreSQL foreign key violation
        if (error.message.includes('foreign key') || error.message.includes('violates')) {
          return NextResponse.json(
            { error: "Cannot delete product: it is referenced by existing orders" },
            { status: 400 },
          );
        }
        // NoResultError - product not found
        if (error.constructor.name === "NoResultError") {
          return NextResponse.json(
            { error: "Product not found" },
            { status: 404 },
          );
        }
      }
      
      return NextResponse.json(
        { error: "Failed to delete product" },
        { status: 500 },
      );
    }
  },
);
