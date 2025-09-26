import crypto from "node:crypto";
import {config} from "../config/envs";

export class GitlabClient {
  private baseUrl: string;
  private token: string;

  constructor(token: string, baseUrl = config.GIT_LAB_BASE_URL) {
    //set NODE ENV to disable SSL verification
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    this.baseUrl = baseUrl;
    this.token = token;
  }

  async issueDescriptionMarkdown(
    projectId: string,
    issueIid: number,
  ): Promise<string> {
    const response = await fetch(
      `${this.baseUrl}/api/v4/projects/${
        encodeURIComponent(projectId)
      }/issues/${issueIid}`,
      {
        headers: {
          "PRIVATE-TOKEN": this.token, // GitLab uses PRIVATE-TOKEN header
        },
      },
    );
    if (!response.ok) {
      throw new Error(
        `Failed to fetch issue: ${response.status} ${await response.text()}`,
      );
    }
    const { description } = await response.json();
    return description;
  }

  async downloadGitLabUploadFile(
    url: string,
  ): Promise<
    {
      filename: string;
      fileSha256: string;
      mimetype: string;
      size: number;
      buffer: Buffer;
    }
  > {
    if (!url.includes("/-/project/") || !url.includes("/uploads/")) {
      throw new Error(
        "Invalid GitLab file URL,URL should look like https://${gitlabHost}/-/project/755/uploads/${hexID}/${filename}",
      );
    }
    url = url.replace("/-/project/", "/api/v4/projects/"); // Ensure URL format is correct
    //https://gitlab.acme.net/-      /project/755/uploads/b2d1aa84a05cf7f0012464cae40543ae/samples-2526-DimmerG4US.zip
    //https://gitlab.acme.net/api/v4/projects/755/uploads/b2d1aa84a05cf7f0012464cae40543ae/samples-2526-DimmerG4US.zip
    const response = await fetch(url, {
      cache: "no-store", // Prevent Next.js from caching
      headers: {
        "PRIVATE-TOKEN": this.token, // GitLab uses PRIVATE-TOKEN header
      },
    });
    if (!response.ok) {
      throw new Error(
        `Failed to download: ${response.status} ${response.statusText}`,
      );
    }
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const mimetype = response.headers.get("Content-Type") ||
      "application/octet-stream";
    const filename = url.split("/").pop() || "downloaded_file";
    const size = parseInt(response.headers.get("Content-Length") || "0", 10);
    const fileSha256 = crypto.createHash("sha256").update(buffer).digest("hex");
    return { filename, fileSha256, mimetype, size, buffer };
  }
}
