import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";
import { db } from "@/lib/db/db";
import { dbAttachmentUpdate } from "@/lib/db/table_attachment";
import { config, uploadDir } from "@/lib/config/envs";
import { GitlabClient } from "@/lib/confluence/gitlab";
import fs from "node:fs";
import { AuthenticatedRequest, withAnyRole } from "@/lib/auth/middleware";

export const dynamic = "force-dynamic";

// GET /api/attachments/download/[hash] - Download attachment by hash
export const GET = withAnyRole(async (
  _: AuthenticatedRequest,
  { params }: { params: { hash: string } },
) => {
  try {
    // Find attachment by hash
    const attachment = await db
      .selectFrom("attachments")
      .where("hash", "=", params.hash)
      .selectAll()
      .executeTakeFirstOrThrow();
    let fileBuffer: Buffer;
    if (
      attachment.hash.startsWith("URL:") &&
      attachment.remark.startsWith(config.GIT_LAB_BASE_URL) &&
      attachment.remark.includes("/uploads/")
    ) {
      const gitlabClient = new GitlabClient(
        config.GIT_LAB_TOKEN,
        config.GIT_LAB_BASE_URL,
      );
      const { filename, fileSha256, mimetype, size, buffer } =
        await gitlabClient.downloadGitLabUploadFile(attachment.remark);
      attachment.hash = fileSha256;
      attachment.mimetype = mimetype;
      attachment.size = size;
      attachment.name = filename;
      fileBuffer = buffer;
      //write file to disk
      const filePath = join(uploadDir(), attachment.hash);
      fs.writeFileSync(filePath, fileBuffer);
    } else {
      const filePath = join(uploadDir(), attachment.hash);
      fileBuffer = await readFile(filePath);
    }
    // Only update the download_count field, not the entire object
    await dbAttachmentUpdate(attachment.id, {
      download_count: attachment.download_count + 1,
    });

    // Return file with proper headers
    return new NextResponse(new Uint8Array(fileBuffer), {
      headers: {
        "Content-Type": attachment.mimetype,
        "Content-Disposition":
          `attachment; filename="${attachment.id}.${attachment.name}"`,
        "Content-Length": attachment.size.toString(),
      },
    });
  } catch (error) {
    console.error("Error downloading file:", error);
    return NextResponse.json(
      { error: "File not found" },
      { status: 404 },
    );
  }
});
