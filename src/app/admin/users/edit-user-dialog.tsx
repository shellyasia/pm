import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
// Not using FormWrapper, using simple form for dialog
import { User } from "@/lib/db/table_user";
import { useMeta } from "@/contexts/meta-context";

export interface EditUserDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (user: Partial<User>) => void;
  initialData?: Partial<User>;
}

const EditUserDialog: React.FC<EditUserDialogProps> = (
  { open, onClose, onSave, initialData },
) => {
  const { meta } = useMeta();
  const [form, setForm] = useState<Partial<User>>({ name: "", email: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name || "",
        email: initialData.email || "",
        role: initialData.role || "viewer",
        company: initialData.company || "",
        is_active: initialData.is_active ?? true,
      });
    }
  }, [initialData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      setForm((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSave = () => {
    setLoading(true);
    onSave(form);
    setLoading(false);
    onClose();
  };

  return (
    <Dialog open={open}>
      <DialogContent className="max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>{initialData ? "Edit User" : "Add User"}</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto min-h-0 space-y-4">
          <form
            className="space-y-4 p-2"
            onSubmit={(e) => {
              e.preventDefault();
              handleSave();
            }}
          >
            <Input
              name="name"
              placeholder="Name"
              value={form.name || ""}
              onChange={handleChange}
              required
            />
            <Input
              name="email"
              placeholder="Email"
              value={form.email || ""}
              onChange={handleChange}
              required
              disabled={!!initialData}
            />
            <Select
              name="role"
              value={form.role || "viewer"}
              onValueChange={(value) =>
                setForm((prev) => ({
                  ...prev,
                  role: value as "admin" | "editor" | "viewer",
                }))}
              required
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="editor">Editor</SelectItem>
                <SelectItem value="viewer">Viewer</SelectItem>
              </SelectContent>
            </Select>
            <Select
              name="company"
              value={form.company || ""}
              onValueChange={(value) =>
                setForm((prev) => ({ ...prev, company: value }))}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a company" />
              </SelectTrigger>
              <SelectContent>
                {meta?.optionsFactory.map((company) => (
                  <SelectItem key={company} value={company}>
                    {company.charAt(0).toUpperCase() + company.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="is_active"
                checked={!!form.is_active}
                onChange={handleChange}
              />
              Active
            </label>
            <DialogFooter>
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" variant="default" disabled={loading}>
                {loading ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditUserDialog;
