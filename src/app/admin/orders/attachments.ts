"use client";

import { Attachment } from "@/lib/db/table_attachment";
import { SelectOptionItem } from "@/components/ui/select-options";
import { toast } from "sonner";
import { useEffect, useState } from "react";

export async function fetchAttachmentOptions(productCode = "") {
  const response = await fetch(
    `/api/attachments?limit=9999&product_code=${productCode}&fast=true`,
  );
  if (!response.ok) {
    throw new Error(
      `Failed to load attachments: ${response.statusText} ${await response
        .text()}`,
    );
  }
  const data = await response.json();
  const rows = data.rows || [];
  const options: SelectOptionItem[] = rows.map((attachment: Attachment) => ({
    value: attachment.id,
    label:
      `${attachment.product_code} - ${attachment.name}  (${attachment.tag}) / ${attachment.status}`,
  }));
  return options;
}

export function useAttachmentOptions() {
  const [attachmentOptions, setAttachmentOptions] = useState<
    SelectOptionItem[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAttachments = async () => {
      try {
        setIsLoading(true);
        const options = await fetchAttachmentOptions();
        if (options) {
          setAttachmentOptions(options);
        }
      } catch (err) {
        const error = err instanceof Error
          ? err
          : new Error("Failed to load attachments");
        toast.error(`Failed to load attachments: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    loadAttachments();
  }, []);
  return [attachmentOptions, isLoading] as const;
}

export interface OrderFormData {
  product_code: string;
  factory: string;
  priority: string;
  quantity: number;
  batch: string;
  attachments: Array<number>;
  status?: string;
  remark?: string;
}

export function validateFormProductCodeAttachments(
  data: OrderFormData,
  attachmentOptions: SelectOptionItem[],
): string {
  //attachments'product_code must match order's product_code
  const selectedAttachments = attachmentOptions.filter((opt) =>
    data.attachments.includes(opt.value as number)
  );
  for (const att of selectedAttachments) {
    if (!att.label.startsWith(data.product_code)) {
      return `Attachment ${att.label} does not match product code ${data.product_code}`;
    }
  }
  return "";
}
