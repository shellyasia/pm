"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  SelectOptionItem,
  SelectOptions,
} from "@/components/ui/select-options";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useMeta } from "@/contexts/meta-context";

interface UploadDialogProps {
  productOptions: SelectOptionItem[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploadSuccess: () => void;
}

export function UploadDialog(
  { open, onOpenChange, onUploadSuccess, productOptions }: UploadDialogProps,
) {
  const { meta } = useMeta();
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadName, setUploadName] = useState("");
  const [uploadRemark, setUploadRemark] = useState("");
  const [uploadTag, setUploadTag] = useState<string>("none");
  const [productCode, setProductCode] = useState<string>("");

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("name", uploadName || selectedFile.name);
      formData.append("remark", uploadRemark);
      formData.append("tag", uploadTag === "none" ? "" : uploadTag);
      formData.append("product_code", productCode);

      const response = await fetch("/api/attachments", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        onOpenChange(false);
        setSelectedFile(null);
        setUploadName("");
        setUploadRemark("");
        setUploadTag("none");
        setProductCode("");
        onUploadSuccess();
      } else {
        const error = await response.json();
        alert("Upload failed: " + error.error);
      }
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-full max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Upload New File</DialogTitle>
          <DialogDescription>
            Select a file to upload to the server
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto min-h-0 space-y-4">
          <form onSubmit={handleFileUpload} className="space-y-4 p-2">
            <div>
              <Label htmlFor="product_code">
                Belong to Product
              </Label>
              <SelectOptions
                options={productOptions}
                value={productCode}
                onValueChange={(value) => setProductCode(value as string)}
                placeholder="Select a product"
                clearable
              />
            </div>
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={uploadName}
                onChange={(e) => setUploadName(e.target.value)}
                placeholder="some name to describe the file of the product"
              />
            </div>
            <div>
              <Label htmlFor="file">File (Optional)</Label>
              <Input
                id="file"
                type="file"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setSelectedFile(file);
                  if (file && !uploadName) {
                    setUploadName(file.name);
                  }
                }}
                required
              />
            </div>
            <div>
              <Label htmlFor="tag">Tag</Label>
              <RadioGroup
                value={uploadTag}
                onValueChange={setUploadTag}
                className="flex flex-row space-x-4 mt-2"
              >
                {meta?.optionsTag.map((tag) => (
                  <div
                    key={tag}
                    className="flex items-center space-x-2"
                  >
                    <RadioGroupItem
                      value={tag}
                      id={`tag-${tag}`}
                    />
                    <Label
                      htmlFor={`tag-${tag}`}
                      className="font-normal cursor-pointer"
                    >
                      {tag.charAt(0).toUpperCase() +
                        tag.slice(1)}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div>
              <Label htmlFor="remark">Remark</Label>
              <Textarea
                id="remark"
                value={uploadRemark}
                onChange={(e) => setUploadRemark(e.target.value)}
                placeholder="can add gitlab uploads file link here eg: https://gitlab.acme.com/xxx-cloud/xxx-firmware/-/uploads/xxxx/xxxx.bin file will auto upload from url"
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={uploading || !selectedFile ||
                  !productCode}
              >
                {uploading ? "Uploading..." : "Upload"}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
