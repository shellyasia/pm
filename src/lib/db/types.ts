export interface ColComment {
  email: string;
  content: string;
  created_at: string; // ISO string for JSON serialization
  action: "comment" | "approve" | "reject" | "created" | "updated" | "deleted";
}
