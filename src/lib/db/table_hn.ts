import { ColumnType, Generated, Insertable, Selectable, Updateable } from "kysely";
import { db } from "./db";

export type Role = "admin" | "editor" | "viewer";

export interface HnItemTable {
  id: Generated<number>;
  title: ColumnType<string, string | undefined, never>;
  url: ColumnType<string, string | undefined, never>;
  type: ColumnType<string, string | undefined, never>;
  score: ColumnType<number, number | undefined, never>;
  created_at: ColumnType<Date, Date | undefined, never>;
}

export type HnItem = Selectable<HnItemTable>;
export type HnItemInsert = Insertable<HnItemTable>;
export type HnItemUpdate = Updateable<HnItemTable>;

const tableName = "hn_items";


export async function dbHnItemUpsert(item: HnItemInsert): Promise<HnItem | undefined> {
  return await db
    .insertInto(tableName)
    .values(item)
    .onConflict((oc) => oc.column("id").doUpdateSet(item))
    .returningAll()
    .executeTakeFirst();
}



export async function dbHnItemAll(search: string = "", page = 1, limit = 60) {
  let q = db.selectFrom(tableName);
  if (search) {
    q = q.where((eb) =>
      eb("title", "ilike", `%${search}%`).or("url", "ilike", `%${search}%`)
    );
  }
  let total = 0;
  const countResult = await q.select(db.fn.count<number>("id").as("count"))
    .executeTakeFirst();
  if (countResult) {
    total = countResult.count;
  }
  q = q.orderBy("id", "desc").offset((page - 1) * limit).limit(limit);
  const rows = await q.selectAll().execute();
  return { total, rows };
}
