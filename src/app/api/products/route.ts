import { NextResponse } from "next/server";
import { AuthenticatedRequest, withEditorOrAdmin, withAnyRole } from "@/lib/auth/middleware";
import {
  dbProductAll,
  dbProductInsert,
  ProductInsert,
} from "@/lib/db/table_product";

// GET /api/products - List products with pagination and search
export const GET = withAnyRole(async (request: AuthenticatedRequest) => {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "100");
  const search = searchParams.get("search") || "";
  const fast = searchParams.get("fast") || "";
  const { total, rows } = await dbProductAll(
    search,
    page,
    limit,
    fast === "1" || fast.toLowerCase() === "true",
  );
  rows.forEach((r) => r.html = ""); // Remove HTML content for listing
  return NextResponse.json({
    page,
    limit,
    total,
    rows,
  });
});

// POST /api/products - Create new product
export const POST = withEditorOrAdmin(async (req: AuthenticatedRequest) => {
  try {
    const body = await req.json();

    const productData: ProductInsert = {
      code: body.code,
      status: body.status || "draft",
      firmware: body.firmware || "",
      html: body.html || "",
    };

    const newProduct = await dbProductInsert(productData);
    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 },
    );
  }
});
