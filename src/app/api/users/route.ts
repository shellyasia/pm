import { NextResponse } from "next/server";
import {
  userAll,
  UserInsert,
  UserUpdate,
  userUpdate,
} from "@/lib/db/table_user";
import { db } from "@/lib/db/db";
import { AuthenticatedRequest, withAnyRole, withAdminOnly } from "@/lib/auth/middleware";

// GET /api/users - List users with pagination and search
export const GET = withAnyRole(async (request: AuthenticatedRequest) => {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const search = searchParams.get("search") || "";

  try {
    const { total, rows } = await userAll(search, page, limit);

    return NextResponse.json({
      page,
      limit,
      total,
      rows,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 },
    );
  }
});

// PUT /api/users - Update user by email in request body
export const PUT = withAdminOnly(async (request: AuthenticatedRequest) => {
  try {
    const body = await request.json();
    const { email, ...updateData } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 },
      );
    }

    // Prepare update data, excluding undefined values
    const update: UserUpdate = {
      ...(updateData.name !== undefined && { name: updateData.name }),
      ...(updateData.role !== undefined && { role: updateData.role }),
      ...(updateData.company !== undefined && { company: updateData.company }),
      ...(updateData.is_active !== undefined &&
        { is_active: updateData.is_active }),
      updated_at: new Date(),
    };

    const updatedUser = await userUpdate(email, update);

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 },
    );
  }
});

// POST /api/users - Create new user
export const POST = withAdminOnly(async (request: AuthenticatedRequest) => {
  try {
    const body = await request.json();
    const { email, name, role = "viewer", company = "", is_active = true } =
      body;

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 },
      );
    }

    const now = new Date();
    const newUser: UserInsert = {
      email,
      name: name || email.split("@")[0],
      role,
      company,
      is_active,
      created_at: now,
      updated_at: now,
    };

    const result = await db.insertInto("users").values(newUser).returningAll()
      .executeTakeFirst();

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 },
    );
  }
});

// DELETE /api/users - Delete user by email in request body
export const DELETE = withAdminOnly(async (request: AuthenticatedRequest) => {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 },
      );
    }

    const deletedUser = await db
      .deleteFrom("users")
      .where("email", "=", email)
      .returningAll()
      .executeTakeFirst();

    if (!deletedUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      message: "User deleted successfully",
      user: deletedUser,
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 },
    );
  }
});
