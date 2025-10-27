import { NextResponse } from "next/server";
import { AuthenticatedRequest, withAnyRole } from "@/lib/auth/middleware";
import { db } from "@/lib/db/db";
import { Attachment } from "@/lib/db/table_attachment";

// GET /api/orders/my-orders - List orders filtered by user's company/factory
export const GET = withAnyRole(async (request: AuthenticatedRequest) => {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "100");
  const search = searchParams.get("search") || "";
  const batch = searchParams.get("batch") || "";
  
  const user = request.user!;
  const userFactory = user.company.toLowerCase();

  try {
    // Build query filtered by user's factory
    let q = db.selectFrom("orders")
      .where("orders.factory", "=", userFactory);

    // Apply search filter
    if (search) {
      q = q.where((eb) =>
        eb.or([
          eb("orders.id", "ilike", `%${search}%`),
          eb("orders.name", "ilike", `%${search}%`),
          eb("orders.product_code", "ilike", `%${search}%`),
          eb("orders.batch", "ilike", `%${search}%`),
          eb("orders.remark", "ilike", `%${search}%`),
        ])
      );
    }

    // Apply batch filter
    if (batch) {
      q = q.where("orders.batch", "=", batch);
    }

    // Get total count
    const countResult = await q
      .select(db.fn.count<number>("orders.id").as("count"))
      .executeTakeFirst();
    
    const total = countResult?.count || 0;

    // Get paginated results with product joins
    const rows = await q
      .leftJoin("products", "products.code", "orders.product_code")
      .select([
        "orders.id",
        "orders.name",
        "orders.product_code",
        "orders.factory",
        "orders.priority",
        "orders.quantity",
        "orders.batch",
        "orders.status",
        "orders.remark",
        "orders.created_at",
        "orders.updated_at",
        "orders.comments",
        "products.id as product_id",
        "products.code as product_code_full",
        "products.firmware",
        "products.html as product_html",
      ])
      .orderBy("orders.created_at", "desc")
      .offset((page - 1) * limit)
      .limit(limit)
      .execute();

    // Fetch attachments for each order's product separately
    const productCodes = Array.from(new Set(rows.map(r => r.product_code).filter(Boolean)));
    const attachmentsMap: Record<string, Attachment[]> = {};
    
    if (productCodes.length > 0) {
      const attachments = await db
        .selectFrom("attachments")
        .selectAll()
        .where("product_code", "in", productCodes)
        .where("status", "=", "active")
        .execute();
      
      // Group by product_code
      for (const att of attachments) {
        if (!attachmentsMap[att.product_code]) {
          attachmentsMap[att.product_code] = [];
        }
        attachmentsMap[att.product_code].push(att);
      }
    }

    // Process results
    const processedRows = rows.map(row => {
      const { product_id, product_code_full, product_html, firmware, ...orderData } = row;
      
      return {
        ...orderData,
        product: product_id ? {
          id: product_id,
          code: product_code_full,
          firmware,
          html: product_html,
        } : null,
        attachments: attachmentsMap[orderData.product_code] || [],
      };
    });

    return NextResponse.json({
      page,
      limit,
      total,
      rows: processedRows,
    });
  } catch (error) {
    console.error("Error fetching user orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 },
    );
  }
});
