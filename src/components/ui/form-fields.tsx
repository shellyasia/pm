import React from "react";
import { FieldError, UseFormRegisterReturn } from "react-hook-form";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BaseFieldProps {
  label: string;
  error?: FieldError;
  className?: string;
  required?: boolean;
  description?: string;
}

interface InputFieldProps extends BaseFieldProps {
  type?: "text" | "email" | "password" | "number" | "tel" | "url";
  placeholder?: string;
  registration: UseFormRegisterReturn;
}

interface TextareaFieldProps extends BaseFieldProps {
  placeholder?: string;
  rows?: number;
  registration: UseFormRegisterReturn;
}

interface SelectFieldProps extends BaseFieldProps {
  placeholder?: string;
  options: { value: string; label: string }[];
  onValueChange: (value: string) => void;
  value?: string;
}

export function InputField({
  label,
  type = "text",
  placeholder,
  registration,
  error,
  className,
  required = false,
  description,
}: InputFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={registration.name} className="text-sm font-medium">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <Input
        id={registration.name}
        type={type}
        placeholder={placeholder}
        {...registration}
        className={cn(
          error && "border-destructive focus-visible:ring-destructive",
        )}
      />
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      {error && <p className="text-sm text-destructive">{error.message}</p>}
    </div>
  );
}

export function TextareaField({
  label,
  placeholder,
  rows = 3,
  registration,
  error,
  className,
  required = false,
  description,
}: TextareaFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={registration.name} className="text-sm font-medium">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <Textarea
        id={registration.name}
        placeholder={placeholder}
        rows={rows}
        {...registration}
        className={cn(
          error && "border-destructive focus-visible:ring-destructive",
        )}
      />
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      {error && <p className="text-sm text-destructive">{error.message}</p>}
    </div>
  );
}

export function SelectField({
  label,
  placeholder = "Select an option",
  options,
  onValueChange,
  value,
  error,
  className,
  required = false,
  description,
}: SelectFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label className="text-sm font-medium">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger
          className={cn(
            error && "border-destructive focus-visible:ring-destructive",
          )}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      {error && <p className="text-sm text-destructive">{error.message}</p>}
    </div>
  );
}

interface FormSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function FormSection(
  { title, description, children, className }: FormSectionProps,
) {
  return (
    <div className={cn("space-y-6", className)}>
      <div className="space-y-2">
        <h3 className="text-lg font-medium">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
}

interface FormActionsProps {
  onCancel?: () => void;
  onSubmit?: () => void;
  submitLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  submitDisabled?: boolean;
  className?: string;
}

export function FormActions({
  onCancel,
  onSubmit,
  submitLabel = "Save",
  cancelLabel = "Cancel",
  loading = false,
  submitDisabled = false,
  className,
}: FormActionsProps) {
  return (
    <div className={cn("flex items-center justify-end space-x-3", className)}>
      {onCancel && (
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          disabled={loading}
        >
          {cancelLabel}
        </button>
      )}
      <button
        type="submit"
        onClick={onSubmit}
        disabled={loading || submitDisabled}
        className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? "Saving..." : submitLabel}
      </button>
    </div>
  );
}
