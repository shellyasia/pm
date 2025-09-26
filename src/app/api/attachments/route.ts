import { NextResponse } from "next/server";
import { AuthenticatedRequest, withEditorOrAdmin, withAnyRole } from "@/lib/auth/middleware";
import {
  AttachmentInsert,
  dbAttachmentAll,
  dbAttachmentInsert,
} from "@/lib/db/table_attachment";
import { mkdir, writeFile } from "fs/promises";
import { join } from "path";
import { createHash } from "crypto";
import { config, uploadDir } from "@/lib/config/envs";
import { optionsTag } from "@/lib/config/const";

// GET /api/attachments - List attachments with pagination and search
export const GET = withAnyRole(async (request: AuthenticatedRequest) => {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "100");
  const search = searchParams.get("search") || "";
  const product_code = searchParams.get("product_code") || "";
  const fast: boolean = searchParams.get("fast") === "true";
  const { total, rows } = await dbAttachmentAll(
    search,
    page,
    limit,
    product_code,
    fast,
  );

  return NextResponse.json({
    page,
    limit,
    total,
    rows,
  });
});

// POST /api/attachments - Upload new attachment
export const POST = withEditorOrAdmin(async (req: AuthenticatedRequest) => {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const name = formData.get("name") as string || file.name;
    const remark = formData.get("remark") as string || "";
    const tag = formData.get("tag") as string || "";
    const productCode =
      (formData.get("product_code") as string | null)?.trim() || "";

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 },
      );
    }

    // Validate tag if provided
    if (tag) {
      if (!optionsTag.includes(tag)) {
        return NextResponse.json(
          {
            error: `Invalid tag: ${tag}. Allowed tags: ${
              optionsTag.join(", ")
            }`,
          },
          { status: 400 },
        );
      }
    }

    // Get file buffer and calculate hash
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const hash = createHash("sha256").update(buffer).digest("hex");

    // Create uploads directory if it doesn't exist
    await mkdir(uploadDir(), { recursive: true });
    const filePath = join(uploadDir(), hash);
    await writeFile(filePath, buffer);

    // Create attachment record
    const attachmentData: AttachmentInsert = {
      hash: hash,
      name: name,
      size: file.size,
      mimetype: file.type,
      status: "draft",
      download_count: 0,
      remark: remark,
      tag: tag,
      product_code: productCode,
      comments: [
        {
          email: req.user?.email || "system",
          content: "File uploaded",
          created_at: new Date().toISOString(),
          action: "created",
        },
      ],
    };

    const newAttachment = await dbAttachmentInsert(attachmentData);

    return NextResponse.json(newAttachment, { status: 201 });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 },
    );
  }
});

