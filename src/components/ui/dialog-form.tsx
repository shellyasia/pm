"use client";

import React, { ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface DialogFormProps {
  // Dialog state
  open: boolean;
  onOpenChange: (open: boolean) => void;

  // Dialog content
  title: string;
  description?: string;

  // Layout options
  maxWidth?:
    | "sm"
    | "md"
    | "lg"
    | "xl"
    | "2xl"
    | "3xl"
    | "4xl"
    | "5xl"
    | "6xl"
    | "7xl"
    | "full";
  className?: string;

  // Content
  children: ReactNode;
  trigger?: ReactNode;

  // Footer actions
  showFooter?: boolean;
  footerContent?: ReactNode;

  // Form handling
  onSubmit?: (e: React.FormEvent) => void;
  submitLabel?: string;
  cancelLabel?: string;
  onCancel?: () => void;

  // Button states
  isSubmitting?: boolean;
  submitDisabled?: boolean;
  showCancel?: boolean;

  // Additional customization
  headerActions?: ReactNode;
  infoSection?: ReactNode;
}

const maxWidthClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  "3xl": "max-w-3xl",
  "4xl": "max-w-4xl",
  "5xl": "max-w-5xl",
  "6xl": "max-w-6xl",
  "7xl": "max-w-7xl",
  full: "max-w-full",
};

export function DialogForm({
  open,
  onOpenChange,
  title,
  description,
  maxWidth = "4xl",
  className,
  children,
  trigger,
  showFooter = true,
  footerContent,
  onSubmit,
  submitLabel = "Save",
  cancelLabel = "Cancel",
  onCancel,
  isSubmitting = false,
  submitDisabled = false,
  showCancel = true,
  headerActions,
  infoSection,
}: DialogFormProps) {
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      onOpenChange(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(e);
    }
  };

  const dialogContent = (
    <DialogContent
      className={cn(
        maxWidthClasses[maxWidth],
        "w-full max-h-[90vh] flex flex-col",
        className,
      )}
    >
      <DialogHeader className="flex-shrink-0">
        <DialogTitle className="flex items-center justify-between">
          <div>
            {title}
            {description && (
              <DialogDescription className="mt-1">
                {description}
              </DialogDescription>
            )}
          </div>
          {headerActions && (
            <div className="flex items-center space-x-2">
              {headerActions}
            </div>
          )}
        </DialogTitle>
      </DialogHeader>

      <div className="flex-1 overflow-y-auto min-h-0 space-y-4">
        {/* Info Section (like file information, order details, etc.) */}
        {infoSection && (
          <div className="flex-shrink-0">
            {infoSection}
          </div>
        )}

        {/* Main Content */}
        {onSubmit
          ? (
            <form onSubmit={handleFormSubmit} className="space-y-4 p-2">
              {children}

              {/* Footer inside form for form submission */}
              {showFooter && !footerContent && (
                <div className="flex justify-end space-x-2 pt-4 border-t">
                  {showCancel && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancel}
                      disabled={isSubmitting}
                    >
                      {cancelLabel}
                    </Button>
                  )}
                  <Button
                    type="submit"
                    disabled={submitDisabled || isSubmitting}
                  >
                    {isSubmitting ? "Saving..." : submitLabel}
                  </Button>
                </div>
              )}
            </form>
          )
          : children}
      </div>

      {/* Custom Footer Content or Footer outside of form */}
      {showFooter && footerContent && (
        <DialogFooter className="flex-shrink-0">
          {footerContent}
        </DialogFooter>
      )}

      {/* Default Footer for non-form dialogs */}
      {showFooter && !onSubmit && !footerContent && (
        <DialogFooter className="flex-shrink-0">
          {showCancel && (
            <Button variant="outline" onClick={handleCancel}>
              {cancelLabel}
            </Button>
          )}
        </DialogFooter>
      )}
    </DialogContent>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      {dialogContent}
    </Dialog>
  );
}

// Convenience wrapper for simple form dialogs
export function SimpleDialogForm({
  title,
  description,
  children,
  onSubmit,
  submitLabel,
  ...props
}: Omit<DialogFormProps, "showFooter"> & {
  onSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <DialogForm
      title={title}
      description={description}
      onSubmit={onSubmit}
      submitLabel={submitLabel}
      showFooter={true}
      {...props}
    >
      {children}
    </DialogForm>
  );
}

// Convenience wrapper for view-only dialogs
export function ViewDialogForm({
  title,
  children,
  cancelLabel = "Close",
  ...props
}: Omit<
  DialogFormProps,
  "onSubmit" | "showFooter" | "submitLabel" | "submitDisabled" | "isSubmitting"
>) {
  return (
    <DialogForm
      title={title}
      showFooter={true}
      showCancel={true}
      cancelLabel={cancelLabel}
      {...props}
    >
      {children}
    </DialogForm>
  );
}
