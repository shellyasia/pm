"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { RefreshCw } from "lucide-react";

interface SyncDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isSyncing: boolean;
  onSync: () => Promise<void>;
}

export function SyncDialog({
  open,
  onOpenChange,
  isSyncing,
  onSync,
}: SyncDialogProps) {
  return (
    <AlertDialog
      open={open}
      onOpenChange={(open) => {
        if (!isSyncing) {
          onOpenChange(open);
        }
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Sync Firmware Attachments</AlertDialogTitle>
          <AlertDialogDescription>
            {isSyncing
              ? "Syncing firmware attachments from products..."
              : "This will sync firmware attachments from products. Are you sure you want to continue?"}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isSyncing}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={async (e) => {
              e.preventDefault();
              await onSync();
              onOpenChange(false);
            }}
            disabled={isSyncing}
          >
            {isSyncing
              ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Syncing...
                </>
              )
              : (
                "Sync Firmware"
              )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
