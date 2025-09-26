import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { verifyToken } from "@/lib/auth/jwt";

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    // Verify admin authentication
    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || payload.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { filename } = params;
    const searchParams = request.nextUrl.searchParams;
    const lines = parseInt(searchParams.get("lines") || "100");

    // Prevent path traversal
    if (filename.includes("..") || filename.includes("/")) {
      return NextResponse.json(
        { error: "Invalid filename" },
        { status: 400 }
      );
    }

    const logsDir = path.join(process.cwd(), "logs");
    const filePath = path.join(logsDir, filename);

    // Verify file exists and is within logs directory
    try {
      const realPath = await fs.realpath(filePath);
      const realLogsDir = await fs.realpath(logsDir);
      
      if (!realPath.startsWith(realLogsDir)) {
        return NextResponse.json(
          { error: "Access denied" },
          { status: 403 }
        );
      }
    } catch {
      return NextResponse.json(
        { error: "File not found" },
        { status: 404 }
      );
    }

    // Read the file
    const content = await fs.readFile(filePath, "utf-8");
    
    // Get last N lines
    const allLines = content.split("\n");
    const lastLines = allLines.slice(-lines).join("\n");

    return NextResponse.json({
      content: lastLines,
      totalLines: allLines.length,
      displayedLines: Math.min(lines, allLines.length),
    });
  } catch (error) {
    console.error("Error reading log file:", error);
    return NextResponse.json(
      { error: "Failed to read log file" },
      { status: 500 }
    );
  }
}
