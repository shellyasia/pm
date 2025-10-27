import { NextResponse } from "next/server";
import { AuthenticatedRequest, withEditorOrAdmin, withAnyRole, withShellyCompany } from "@/lib/auth/middleware";
import { orderAll, OrderInsert, orderInsert } from "@/lib/db/table_order";

// GET /api/orders - List orders with pagination and search
export const GET = withShellyCompany(withAnyRole(async (request: AuthenticatedRequest) => {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "100");
  const search = searchParams.get("search") || "";

  try {
    const { total, rows } = await orderAll(search, page, limit);

    return NextResponse.json({
      page,
      limit,
      total,
      rows,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 },
    );
  }
}));

// POST /api/orders - Create new order
export const POST = withShellyCompany(withEditorOrAdmin(async (req: AuthenticatedRequest) => {
  try {
    const body = await req.json();

    const orderData: OrderInsert = {
      name: body.name,
      product_code: body.product_code,
      factory: body.factory,
      priority: body.priority || "normal",
      quantity: body.quantity || 0,
      batch: body.batch || "",
      status: body.status || "draft",
    };
    //add comments array with initial comment
    orderData.comments = [
      {
        email: req.user?.email || "system",
        content: "Order created",
        created_at: new Date().toISOString(),
        action: "created",
      },
    ];
    const newOrder = await orderInsert(orderData);
    return NextResponse.json(newOrder, { status: 201 });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 },
    );
  }
}));
