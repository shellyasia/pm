"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RefreshCw, Download, FileText } from "lucide-react";

interface LogFile {
  name: string;
  size: number;
  modified: string;
}

export default function LogsPage() {
  const [logs, setLogs] = useState<LogFile[]>([]);
  const [selectedLog, setSelectedLog] = useState<string>("");
  const [logContent, setLogContent] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [lines, setLines] = useState<number>(100);

  const fetchLogFiles = async () => {
    try {
      const response = await fetch("/api/logs");
      if (response.ok) {
        const data = await response.json();
        setLogs(data.files || []);
        if (data.files && data.files.length > 0 && !selectedLog) {
          setSelectedLog(data.files[0].name);
        }
      }
    } catch (error) {
      console.error("Failed to fetch log files:", error);
    }
  };

  const fetchLogContent = async (filename: string, numLines: number) => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/logs/${encodeURIComponent(filename)}?lines=${numLines}`
      );
      if (response.ok) {
        const data = await response.json();
        setLogContent(data.content || "");
      }
    } catch (error) {
      console.error("Failed to fetch log content:", error);
      setLogContent("Error loading log content");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogFiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedLog) {
      fetchLogContent(selectedLog, lines);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLog, lines]);

  const handleRefresh = () => {
    fetchLogFiles();
    if (selectedLog) {
      fetchLogContent(selectedLog, lines);
    }
  };

  const handleDownload = () => {
    if (selectedLog && logContent) {
      const blob = new Blob([logContent], { type: "text/plain" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = selectedLog;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Log Viewer</h1>
          <p className="text-muted-foreground mt-1">
            View and debug application logs
          </p>
        </div>
        <Button onClick={handleRefresh} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Log Files
            </CardTitle>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm text-muted-foreground">Lines:</label>
                <Select
                  value={lines.toString()}
                  onValueChange={(value) => setLines(parseInt(value))}
                >
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                    <SelectItem value="200">200</SelectItem>
                    <SelectItem value="500">500</SelectItem>
                    <SelectItem value="1000">1000</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={handleDownload}
                variant="outline"
                size="sm"
                disabled={!logContent}
              >
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Log File</label>
            <Select value={selectedLog} onValueChange={setSelectedLog}>
              <SelectTrigger>
                <SelectValue placeholder="Select a log file" />
              </SelectTrigger>
              <SelectContent>
                {logs.map((log) => (
                  <SelectItem key={log.name} value={log.name}>
                    <div className="flex items-center justify-between w-full">
                      <span>{log.name}</span>
                      <span className="text-xs text-muted-foreground ml-4">
                        {(log.size / 1024).toFixed(2)} KB
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedLog && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">
                  Log Content (Last {lines} lines)
                </label>
                {loading && (
                  <span className="text-sm text-muted-foreground">
                    Loading...
                  </span>
                )}
              </div>
              <div className="relative">
                <pre className="bg-muted p-4 rounded-lg overflow-auto max-h-[600px] text-xs font-mono">
                  {logContent || "No content available"}
                </pre>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
