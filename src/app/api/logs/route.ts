import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { verifyToken } from "@/lib/auth/jwt";

// Mark this route as dynamic since it uses cookies for authentication
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
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

    // Read log directory
    const logsDir = path.join(process.cwd(), "logs");
    
    try {
      await fs.access(logsDir);
    } catch {
      // Create logs directory if it doesn't exist
      await fs.mkdir(logsDir, { recursive: true });
      return NextResponse.json({ files: [] });
    }

    const files = await fs.readdir(logsDir);
    const logFiles = [];

    for (const file of files) {
      const filePath = path.join(logsDir, file);
      const stats = await fs.stat(filePath);
      
      if (stats.isFile()) {
        logFiles.push({
          name: file,
          size: stats.size,
          modified: stats.mtime.toISOString(),
        });
      }
    }

    // Sort by modified date, newest first
    logFiles.sort((a, b) => 
      new Date(b.modified).getTime() - new Date(a.modified).getTime()
    );

    return NextResponse.json({ files: logFiles });
  } catch (error) {
    console.error("Error reading log files:", error);
    return NextResponse.json(
      { error: "Failed to read log files" },
      { status: 500 }
    );
  }
}
