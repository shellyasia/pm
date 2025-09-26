import { NextResponse } from "next/server";
import { dbAttachmentFirst } from "@/lib/db/table_attachment";
import { db } from "@/lib/db/db";
import { sql } from "kysely";
import { AuthenticatedRequest, withEditorOrAdmin, withAnyRole } from "@/lib/auth/middleware";
import { optionsTag, optionsStatus } from "@/lib/config/const";

export const dynamic = "force-dynamic";

// GET /api/attachments/[id] - attachment details
export const GET = withAnyRole(async (
  request: AuthenticatedRequest,
  { params }: { params: { id: string } },
) => {
  try {
    const attachmentId = parseInt(params.id);
    if (!attachmentId) {
      return NextResponse.json(
        { error: "Invalid attachment ID" },
        { status: 400 },
      );
    }
    const attachment = await dbAttachmentFirst(attachmentId);
    return NextResponse.json(attachment);
  } catch (error) {
    console.error("Error downloading file:", error);
    return NextResponse.json(
      { error: "File not found" },
      { status: 404 },
    );
  }
});

// PUT /api/attachments/[id] - Update attachment metadata
export const PUT = withEditorOrAdmin(async (
  req: AuthenticatedRequest,
  { params }: { params: { id: string } },
) => {
  try {
    const attachmentId = parseInt(params.id);
    if (!attachmentId) {
      return NextResponse.json(
        { error: "Invalid attachment ID" },
        { status: 400 },
      );
    }

    // Check if attachment exists
    const existingAttachment = await dbAttachmentFirst(attachmentId);
    if (!existingAttachment) {
      return NextResponse.json(
        { error: "Attachment not found" },
        { status: 404 },
      );
    }

    const body = await req.json();
    const { name, remark, tag, status, download_count, product_code } = body;

    // Validate tag if provided
    if (tag !== undefined && tag !== null && tag !== "") {
      if (!optionsTag.includes(tag)) {
        return NextResponse.json(
          {
            error: `Invalid tag: ${tag}. Allowed tags: ${optionsTag.join(", ")
              }`,
          },
          { status: 400 },
        );
      }
    }

    // Validate status if provided
    if (
      status !== undefined &&
      status !== null &&
      status !== "" &&
      !optionsStatus.includes(status)
    ) {
      return NextResponse.json(
        { error: `Invalid status. Allowed values: ${optionsStatus.join(", ")}` },
        { status: 400 },
      );
    }

    // Validate download_count if provided
    if (download_count !== undefined) {
      const count = parseInt(download_count);
      if (isNaN(count) || count < 0) {
        return NextResponse.json(
          { error: "Download count must be a non-negative integer" },
          { status: 400 },
        );
      }
    }

    // Update attachment using sql template
    const updates: string[] = [];

    if (name !== undefined) {
      updates.push(`name = '${name}'`);
    }
    if (remark !== undefined) {
      updates.push(`remark = '${remark}'`);
    }
    if (tag !== undefined) {
      updates.push(`tag = '${tag}'`);
    }
    if (status !== undefined) {
      updates.push(`status = '${status}'`);
    }
    if (download_count !== undefined) {
      const count = parseInt(download_count);
      updates.push(`download_count = ${count}`);
    }
    if (product_code !== undefined) {
      updates.push(`product_code = '${product_code}'`);
    }

    updates.push("updated_at = CURRENT_TIMESTAMP");

    if (updates.length > 1) { // Only execute if there are fields to update (besides updated_at)
      await sql`
        UPDATE attachments 
        SET ${sql.raw(updates.join(", "))}
        WHERE id = ${attachmentId}
      `.execute(db);
    }

    // Return updated attachment
    const updatedAttachment = await dbAttachmentFirst(attachmentId);
    return NextResponse.json(updatedAttachment);
  } catch (error) {
    console.error("Error updating attachment:", error);
    return NextResponse.json(
      { error: "Failed to update attachment" },
      { status: 500 },
    );
  }
});

// DELETE /api/attachments/[id] - Delete attachment
export const DELETE = withEditorOrAdmin(async (
  req: AuthenticatedRequest,
  { params }: { params: { id: string } },
) => {
  try {
    const attachmentId = parseInt(params.id);
    if (!attachmentId) {
      return NextResponse.json(
        { error: "Invalid attachment ID" },
        { status: 400 },
      );
    }

    // Check if attachment exists
    const existingAttachment = await dbAttachmentFirst(attachmentId);
    if (!existingAttachment) {
      return NextResponse.json(
        { error: "Attachment not found" },
        { status: 404 },
      );
    }

    // Soft delete by updating status to 'deleted'
    await sql`
      UPDATE attachments 
      SET status = 'deleted', updated_at = CURRENT_TIMESTAMP 
      WHERE id = ${attachmentId}
    `.execute(db);

    return NextResponse.json({ message: "Attachment deleted successfully" });
  } catch (error) {
    console.error("Error deleting attachment:", error);
    return NextResponse.json(
      { error: "Failed to delete attachment" },
      { status: 500 },
    );
  }
});
