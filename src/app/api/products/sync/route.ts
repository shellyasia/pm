import { GitlabClient } from "@/lib/confluence/gitlab";
import { NextResponse } from "next/server";
import { WikiPage } from "@/lib/confluence/wiki";
import {
  dbProductSync,
  ProductInsert,
  ProductStatus,
} from "@/lib/db/table_product";
import { config } from "@/lib/config/envs";
import crypto from "crypto";
import {
  AttachmentInsert,
  dbAttachmentAll,
  dbAttachmentUpsert,
} from "@/lib/db/table_attachment";
import { AuthenticatedRequest, withAdminOnly, withAnyRole } from "@/lib/auth/middleware";

export const dynamic = "force-dynamic";

export const PUT = withAdminOnly(async (_: AuthenticatedRequest) => {
  const apiToken = config.CONFLUENCE_API_TOKEN;
  const userEmail = config.CONFLUENCE_USER_EMAIL;
  const baseUrl = config.CONFLUENCE_BASE_URL;
  const rootPageId = config.CONFLUENCE_ROOT_PAGE_ID;

  const wiki = new WikiPage(apiToken, userEmail, baseUrl);
  const pages = await wiki.fetchProducts(rootPageId);
  //parse zip url from gitlab issue
  const rows = await Promise.all(pages.map(async (page) => {
    const firmware = await gitlabIssueToZipURL(
      page.firmware ? page.firmware.trim() : "",
    );
    let status: ProductStatus = "crawler";
    if (firmware.includes("/uploads/")) {
      status = "approved";
    }
    return {
      id: page.id,
      code: page.title.trim(),
      html: page.html.trim(),
      firmware,
      status,
      created_at: new Date(),
      updated_at: new Date(),
    } as ProductInsert;
  }));
  const data = await dbProductSync(rows);
  await syncAttachments(rows);
  //trigger background load of attachments
  backgroundLoadAttachments().catch(console.error);
  return NextResponse.json({ data });
});

async function syncAttachments(products: ProductInsert[]) {
  for (const product of products) {
    if (!product.firmware) continue;
    if (!product.firmware.includes("/uploads/")) continue;
    const hash = crypto.createHash("sha256").update(product.firmware || "")
      .digest("hex");
    const attachment: AttachmentInsert = {
      id: product.id ? parseInt(product.id) : 0,
      hash: `URL:${hash}`,
      product_code: product.code,
      remark: product.firmware || "",
      status: "approved",
      tag: "firmware",
    };
    await dbAttachmentUpsert(attachment);
  }
}

async function gitlabIssueToZipURL(url: string): Promise<string> {
  if (
    !url.startsWith(`${config.GIT_LAB_BASE_URL}/Shelly/fw/shelly-ng/-/issues/`)
  ) {
    return url;
  }
  //https://gitlab.acme.net/Shelly/fw/shelly-ng/-/issues/3488
  let issueIid = 0;
  const match = url.split("/-/issues/");
  if (match.length === 2) {
    issueIid = parseInt(match[1]);
  }
  if (!issueIid) {
    console.error("Failed to parse GitLab issue URL:", url);
    return url;
  }
  const gitlab = new GitlabClient(config.GIT_LAB_TOKEN);
  const descriptionMarkdown = await gitlab.issueDescriptionMarkdown(
    "755",
    issueIid,
  );
  // Production bundle: **[2451-Broadwell-ProDimmer1PM.zip](/uploads/276e95c69d97a845aac27b7ee2c9d22b/2451-Broadwell-ProDimmer1PM.zip)**
  // first get line contains Production bundle
  let productionBundleLine = "";
  const lines = descriptionMarkdown.split("\n");
  for (const line of lines) {
    if (
      line.toLowerCase().includes("production bundle") && line.includes(".zip")
    ) {
      productionBundleLine = line;
      break;
    }
  }
  if (!productionBundleLine) {
    console.error(`Issue description:\n${descriptionMarkdown}`);
    return url;
  }
  // Production bundle: **[2520-Broadwell-Pro3EMEF.zip](/uploads/6516ca631edf6c317777a71bec95e0cc/2520-Broadwell-Pro3EMEF.zip)**
  // grep to get URL '/uploads/***/.zip'
  const fileMatch = productionBundleLine.match(/\((\/uploads\/[^\)]+\.zip)\)/);
  const uploadFirmwareURI = fileMatch ? fileMatch[1] : "";
  if (uploadFirmwareURI) {
    return `${config.GIT_LAB_BASE_URL}/-/project/755${uploadFirmwareURI}`;
  } else {
    console.error(`No .zip file link found in issue description: ${url}`);
    return url;
  }
}


async function backgroundLoadAttachments() {
  const { rows } = await dbAttachmentAll("", 1, 1000, "", false);
  Promise.all(rows.map(async (attachment) => {
    try {
      if (attachment.hash && attachment.hash.startsWith("URL:")) {
        const url = `${config.NEXT_PUBLIC_APP_URL}/api/attachments/download/${attachment.hash}`;
        const resp = await fetch(url, { cache: 'no-store', signal: AbortSignal.timeout(600000) });
        //write file to dev/null to trigger background load
        if (resp.ok) {
          await resp.arrayBuffer();
          console.log(`Background loaded attachment ID: ${attachment.id}`);
        } else {
          console.error(`Failed to background load attachment ID: ${attachment.id}, status: ${resp.status}`);
        }
      }
    } catch (error) {
      console.error(`Error background loading attachment ID: ${attachment.id}`, error);
    }
  }));
}