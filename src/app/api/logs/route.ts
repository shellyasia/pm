import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { AuthenticatedRequest, withAdminOnly, withShellyCompany } from "@/lib/auth/middleware";

// Mark this route as dynamic since it uses cookies for authentication
export const dynamic = 'force-dynamic';

export const GET = withShellyCompany(withAdminOnly(async (_request: AuthenticatedRequest) => {
  try {
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
}));
