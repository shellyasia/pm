// https://developer.atlassian.com/cloud/confluence/rest/v2/api-group-children/#api-pages-id-direct-children-get

// https://developer.atlassian.com/cloud/confluence/rest/v2/api-group-children/#api-folders-id-direct-children-get

//https://developer.atlassian.com/cloud/confluence/rest/v2/api-group-page/#api-pages-id-get
import * as cheerio from "cheerio";
import TurndownService from "turndown";
import { config } from "../config/envs";

const batchSize = 5;

export const confluenceWikiProductURL = (pageId: string) => {
  return `${config.CONFLUENCE_BASE_URL}/wiki/spaces/Production/pages/${pageId}/`;
};

export interface Page {
  id: string;
  title: string;
  html: string;
  status: "current" | "archived" | "trashed";
  firmware?: string;
}

interface Item {
  id: string;
  title: string;
  status: "current" | "archived" | "trashed";
  type: "page" | "folder";
}

function parseFirmware(htmlContent: string): string {
  const $ = cheerio.load(htmlContent);
  let url = "";
  $("table > tbody > tr").each((i, elem) => {
    const rowThTxt = $(elem).find("th").first().text().trim();
    if (rowThTxt.includes("Firmware")) {
      const firmwareColText =
        $(elem).find("td:nth-child(2)").first().text().trim() || "ERROR"; //for debug
      const firmWareURL = $(elem).find("td:nth-child(2) a").first().attr(
        "href",
      );
      url = firmWareURL || firmwareColText;
      return false;
    }
  });
  return url;
}

function parseMarkdown(htmlContent: string): string {
  const turndownService = new TurndownService({
    headingStyle: "atx",
    codeBlockStyle: "fenced",
  });
  const md = turndownService.turndown(htmlContent);
  return md.trim();
}

export class WikiPage {
  baseUrl: string;
  headers: { [key: string]: string };

  constructor(
    apiToken: string,
    userEmail: string = config.CONFLUENCE_USER_EMAIL,
    baseUrl: string = config.CONFLUENCE_BASE_URL,
  ) {
    this.baseUrl = baseUrl;
    this.headers = {
      "Authorization": `Basic ${
        Buffer.from(`${userEmail}:${apiToken}`).toString("base64")
      }`,
      "Content-Type": "application/json; charset=utf-8",
    };
  }

  private async getPageHTML(pageID: string, retries = 3): Promise<Page> {
    //https://developer.atlassian.com/cloud/confluence/rest/v2/api-group-page/#api-pages-id-get
    const url =
      `${this.baseUrl}/wiki/api/v2/pages/${pageID}?body-format=anonymous_export_view`;

    for (let attempt = 0; attempt <= retries; attempt++) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // Increased to 60 seconds

      try {
        const response = await fetch(url, {
          method: "GET",
          headers: this.headers,
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(
            `Failed to fetch  page HTML: ${await response.text()}`,
          );
        }
        const data = await response.json();
        const contentHtml = data.body?.anonymous_export_view?.value || "";
        const firmware = parseFirmware(contentHtml);
        const status = data.status || "";
        return {
          id: data.id,
          title: data.title,
          html: contentHtml,
          status,
          firmware,
        };
      } catch (error) {
        clearTimeout(timeoutId);
        if (error instanceof Error && error.name === "AbortError") {
          console.warn(
            `Request aborted for page ${pageID}, attempt ${attempt + 1}/${
              retries + 1
            }`,
          );
          if (attempt === retries) {
            throw new Error(
              `Failed to fetch page ${pageID} after ${
                retries + 1
              } attempts: Request timeout`,
            );
          }
          // Wait a bit before retrying
          await new Promise((resolve) =>
            setTimeout(resolve, 1000 * (attempt + 1))
          );
          continue;
        }
        throw error;
      }
    }
    throw new Error(`Failed to fetch page ${pageID}`);
  }

  private async getDirectChildrenOfPage(
    pageId: string,
    retries = 3,
  ): Promise<Item[]> {
    const url =
      `${this.baseUrl}/wiki/api/v2/pages/${pageId}/direct-children?limit=250`;

    for (let attempt = 0; attempt <= retries; attempt++) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // Increased to 60 seconds

      try {
        const response = await fetch(url, {
          method: "GET",
          headers: this.headers,
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(
            `Failed to fetch pageID: ${pageId}: ${await response.text()}`,
          );
        }
        const data = await response.json();
        return data.results || [] satisfies Item[];
      } catch (error) {
        clearTimeout(timeoutId);
        if (error instanceof Error && error.name === "AbortError") {
          console.warn(
            `Request aborted for page ${pageId}, attempt ${attempt + 1}/${
              retries + 1
            }`,
          );
          if (attempt === retries) {
            throw new Error(
              `Failed to fetch page ${pageId} after ${
                retries + 1
              } attempts: Request timeout`,
            );
          }
          // Wait a bit before retrying
          await new Promise((resolve) =>
            setTimeout(resolve, 1000 * (attempt + 1))
          );
          continue;
        }
        throw error;
      }
    }
    return [];
  }

  private async getDirectChildrenOfFolder(
    folderId: string,
    retries = 3,
  ): Promise<Item[]> {
    const url =
      `${this.baseUrl}/wiki/api/v2/folders/${folderId}/direct-children?limit=250`;

    for (let attempt = 0; attempt <= retries; attempt++) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // Increased to 60 seconds

      try {
        const response = await fetch(url, {
          method: "GET",
          headers: this.headers,
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(
            `Failed to fetch pages in folder: ${response.statusText}`,
          );
        }
        const data = await response.json();
        // console.debug('data', data)
        return data.results || [] satisfies Item[];
      } catch (error) {
        clearTimeout(timeoutId);
        if (error instanceof Error && error.name === "AbortError") {
          console.warn(
            `Request aborted for folder ${folderId}, attempt ${attempt + 1}/${
              retries + 1
            }`,
          );
          if (attempt === retries) {
            throw new Error(
              `Failed to fetch folder ${folderId} after ${
                retries + 1
              } attempts: Request timeout`,
            );
          }
          // Wait a bit before retrying
          await new Promise((resolve) =>
            setTimeout(resolve, 1000 * (attempt + 1))
          );
          continue;
        }
        throw error;
      }
    }
    return [];
  }
  private async getAllPagesOfFolder(folderId: string): Promise<Item[]> {
    const children = await this.getDirectChildrenOfFolder(folderId);
    const pages = children.filter((item) =>
      item.type === "page" && item.status === "current"
    );
    const folderPages = await Promise.all(
      children.filter((item) =>
        item.type === "folder" && item.status === "current"
      ).map(async (folder) => {
        return this.getAllPagesOfFolder(folder.id);
      }),
    );
    return pages.concat(...folderPages.flat());
  }

  async fetchProducts(rootPageId: string): Promise<Page[]> {
    const folderIds = (await this.getDirectChildrenOfPage(rootPageId)).filter(
      (item) => item.type === "folder" && item.status === "current",
    ).map((folder) => folder.id);
    const pageItems = await Promise.all(folderIds.map(async (folderId) => {
      return await this.getAllPagesOfFolder(folderId);
    }));
    const items = pageItems.flat();
    const pages: Page[] = [];

    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map((item) => this.getPageHTML(item.id)),
      );
      pages.push(...batchResults);
    }
    return pages;
  }
}
