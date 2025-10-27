// Order-related constants that are safe to use in client components
export const optionsFactory: string[] = [
  "broadwell",
  "frankever",
  "heiman",
  "smatek",
  "ogemray",
  "shelly",
  "wynnewood",
  "null", // null/blank factory
].map((f) => f.toLowerCase());

export const optionsPriority: string[] = ["urgent", "high", "normal", "low"]
  .map((p) => p.toLowerCase());

export const optionsTag: string[] = [
  "manual",
  "firmware",
  "printing",
  "testing",
  "certificate",
].map((t) => t.toLowerCase());

export const optionsStatus: string[] = [
  "approved",
  "rejected",
  "wrong",
  "draft",
  "archived",
  "deleted",
  "deprecated",
].map((s) => s.toLowerCase());
