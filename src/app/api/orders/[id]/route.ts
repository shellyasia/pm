import { NextResponse } from "next/server";
import { AuthenticatedRequest, withEditorOrAdmin, withAnyRole, withShellyCompany } from "@/lib/auth/middleware";
import { orderFirst, OrderUpdate, orderUpdate, orderDelete } from "@/lib/db/table_order";

interface RouteParams {
  params: {
    id: string;
  };
}

// GET /api/orders/[id] - Get specific order
export const GET = withShellyCompany(withAnyRole(async (
  request: AuthenticatedRequest,
  { params }: RouteParams,
) => {
  try {
    const order = await orderFirst(params.id);
    return NextResponse.json(order);
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      { error: "Order not found" },
      { status: 404 },
    );
  }
}));

// PUT /api/orders/[id] - Update specific order
export const PUT = withShellyCompany(withEditorOrAdmin(async (
  req: AuthenticatedRequest,
  { params }: RouteParams,
) => {
  try {
    // First check if the order exists
    const existingOrder = await orderFirst(params.id);
    if (!existingOrder) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 },
      );
    }

    const body = await req.json();
    const updatedOrder = await orderUpdate(params.id, body as OrderUpdate);
    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error("Error updating order:", error);
    // Check if it's a NoResultError (order not found)
    if (error instanceof Error && error.constructor.name === "NoResultError") {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 },
      );
    }
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 },
    );
  }
}));

// DELETE /api/orders/[id] - Delete specific order
export const DELETE = withShellyCompany(withEditorOrAdmin(async (
  request: AuthenticatedRequest,
  { params }: RouteParams,
) => {
  try {
    const deletedOrder = await orderDelete(params.id);
    return NextResponse.json({ 
      success: true, 
      message: "Order deleted successfully",
      order: deletedOrder
    });
  } catch (error) {
    console.error("Error deleting order:", error);
    // Check if it's a NoResultError (order not found)
    if (error instanceof Error && error.constructor.name === "NoResultError") {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 },
      );
    }
    return NextResponse.json(
      { error: "Failed to delete order" },
      { status: 500 },
    );
  }
}));
