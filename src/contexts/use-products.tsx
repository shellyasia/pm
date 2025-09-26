"use client";

import { useEffect, useState } from "react";
import { SelectOptionItem } from "@/components/ui/select-options";
import { toast } from "sonner";

export function useProductOptions(): [SelectOptionItem[], boolean] {
  const [productOptions, setProductOptions] = useState<SelectOptionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          "/api/products?page=1&limit=1000&fast=true",
        );
        if (!response.ok) {
          throw new Error(`Failed to fetch products: ${response.statusText}`);
        }

        const data = await response.json();
        const rows = data.rows || [];
        const options = rows.map((product: { code: string }) => ({
          value: product.code.trim(),
          label: product.code.trim(),
        }));

        setProductOptions(options);
      } catch (err) {
        const error = err instanceof Error
          ? err
          : new Error("Failed to load products");
        toast.error(`Failed to load products: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, []);

  return [productOptions, isLoading];
}
