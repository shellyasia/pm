import {
  ColumnType,
  Generated,
  Insertable,
  Selectable,
  sql,
  Updateable,
} from "kysely";
import { db } from "./db";
import { ColComment } from "./types";

export interface AttachmentTable {
  id: Generated<number>; //auto incrementing primary key
  product_code: ColumnType<string, string | undefined, never>; //index to products.code
  hash: ColumnType<string, string | undefined, string | undefined>; //sha256 hash of the file - cannot be updated
  name: ColumnType<string, string | undefined, string | undefined>; //attachment name, not unique
  size: ColumnType<number, number | undefined, string | undefined>; //file size in bytes - cannot be updated
  mimetype: ColumnType<string, string | undefined, string | undefined>; //file mime type - cannot be updated
  status: ColumnType<string, string | undefined, string | undefined>; //approved rejected deleted inactive active draft
  download_count: ColumnType<number, number | undefined, number | undefined>; //download count
  remark: ColumnType<string, string | undefined, string | undefined>; //optional remark
  tag: ColumnType<string, string | undefined, string | undefined>; //only one tag per attachment, e.g. "manual","testing", "firmware", "printing", "certificate"
  comments: ColumnType<ColComment[], ColComment[] | undefined, ColComment[] | undefined>; //array of {email, content, created_at, action}
  created_at: ColumnType<Date, Date | undefined, never>;
  updated_at: ColumnType<Date, Date | undefined, Date>;
}

const tableName = "attachments";

export type Attachment = Selectable<AttachmentTable>;
export type AttachmentInsert = Insertable<AttachmentTable>;
export type AttachmentUpdate = Updateable<AttachmentTable>;

export async function dbAttachmentFirst(id: number): Promise<Attachment> {
  return await db
    .selectFrom(tableName)
    .where("id", "=", id)
    .selectAll()
    .executeTakeFirstOrThrow();
}

export async function dbAttachmentAll(
  search: string,
  page = 1,
  limit = 60,
  product_code = "",
  fast = false,
) {
  let q = db.selectFrom(tableName);
  //only show active attachments by default
  //ignore case search
  if (search) {
    q = q.where((eb) =>
      eb.or([
        eb("remark", "ilike", `%${search}%`),
        eb("name", "ilike", `%${search}%`),
        eb("product_code", "=", search),
      ])
    );
  }
  if (product_code) {
    q = q.where("product_code", "=", product_code);
  }

  // Get total count
  const countResult = await q.select(db.fn.count<number>("id").as("count"))
    .executeTakeFirst();
  let total = 0;
  if (countResult) {
    total = countResult.count;
  }
  const dataQuery = q
    .orderBy("updated_at", "desc")
    .offset((page - 1) * limit)
    .limit(limit);

  if (fast) {
    const rows = await dataQuery.select([
      "id",
      "name",
      "product_code",
      "tag",
      "status",
    ])
      .execute() as Attachment[];
    return { total, rows };
  }
  // Apply pagination
  const rows = await dataQuery.selectAll()
    .execute() as Attachment[];

  return { total, rows };
}

export async function dbAttachmentInsert(attachment: AttachmentInsert) {
  attachment.created_at = new Date();
  attachment.updated_at = new Date();

  // // Ensure comments is properly formatted for JSONB
  const insertData = {
    ...attachment,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    comments: sql`${JSON.stringify(attachment.comments)}::jsonb` as any,
  };

  return await db
    .insertInto(tableName)
    .values(insertData)
    .returningAll()
    .executeTakeFirstOrThrow();
}

export async function dbAttachmentUpdate(
  id: number,
  attachment: AttachmentUpdate,
) {
  attachment.updated_at = new Date();

  return await db
    .updateTable(tableName)
    .set(attachment)
    .where("id", "=", id)
    .returningAll()
    .executeTakeFirstOrThrow();
}

export async function dbAttachmentUpsert(attachment: AttachmentInsert) {
  attachment.updated_at = new Date();
  return await db
    .insertInto(tableName)
    .values(attachment)
    .onConflict((oc) => oc.column("id").doUpdateSet(attachment))
    .returningAll()
    .executeTakeFirst();
}
