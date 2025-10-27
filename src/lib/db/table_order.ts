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

// Re-export constants from the constants file for backward compatibility
export { optionsFactory, optionsPriority } from "../config/const";

export interface OrderTable {
  id: Generated<string>;
  name: ColumnType<string, string | undefined, string | undefined>; //order name
  product_code: ColumnType<string, string | undefined, string | undefined>; //index to products.code
  factory: ColumnType<string, string | undefined, string | undefined>; //lowercase related to users.company
  priority: ColumnType<string, string | undefined, string | undefined>; //lowercase
  quantity: ColumnType<number, number | undefined, number | undefined>;
  batch: ColumnType<string, string | undefined, string | undefined>;
  comments: ColumnType<
    Array<ColComment>,
    Array<ColComment> | undefined,
    Array<ColComment> | undefined
  >; //array of {email, content, timestamp, action}
  status: ColumnType<string, string | undefined, string | undefined>; //wrong,draft,approved,producing,completed,cancelled
  remark: ColumnType<string, string | undefined, string | undefined>; //optional remark
  created_at: ColumnType<Date, Date | undefined, never>;
  updated_at: ColumnType<Date, Date | undefined, Date | undefined>;
}

const tableName = "orders";

export type Order = Selectable<OrderTable>;
export type OrderInsert = Insertable<OrderTable>;
export type OrderUpdate = Updateable<OrderTable>;

export async function orderFirst(id: string) {
  return await db
    .selectFrom(tableName)
    .where("orders.id", "=", id)
    .executeTakeFirstOrThrow();
}

export async function orderAll(search: string, page = 1, limit = 120) {
  let q = db.selectFrom(tableName);
  if (search) {
    q = q.where((eb) =>
      eb.or([
        eb("id", "ilike", `%${search}%`),
        eb("name", "ilike", `%${search}%`),
        eb("factory", "ilike", `%${search}%`),
        eb("priority", "ilike", `%${search}%`),
        eb("batch", "ilike", `%${search}%`),
        eb("remark", "ilike", `%${search}%`),
        eb("product_code", "ilike", `%${search}%`),
      ])
    );
  }
  // Separate count query (no join, no select)
  const countResult = await q.select(db.fn.count<number>("id").as("count"))
    .executeTakeFirst();
  let total = 0;
  if (countResult) {
    total = countResult.count;
  }

  // Apply pagination
  const rows = await q.orderBy("orders.created_at", "desc")
    .offset((page - 1) * limit)
    .limit(limit)
    .selectAll()
    .execute();

  return { total, rows };
}

export async function orderInsert(rows: OrderInsert[] | OrderInsert) {
  const list = Array.isArray(rows) ? rows : [rows];
  const items = list.map((item) => {
    if (!item.id) {
      item.id = crypto.randomUUID();
    }
    return {
      ...item,
      created_at: new Date(),
      updated_at: new Date(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      comments: sql`${JSON.stringify(item.comments)}::jsonb` as any,
    };
  });
  return await db
    .insertInto(tableName)
    .values(items)
    .returningAll()
    .execute();
}

export async function orderUpdate(id: string, row: OrderUpdate) {
  row.updated_at = new Date();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateData: any = { ...row };

  // Only include comments if provided, otherwise keep existing value
  if ("comments" in row && row.comments !== undefined) {
    updateData.comments = sql`${JSON.stringify(row.comments)}::jsonb`;
  } else {
    delete updateData.comments;
  }

  return await db
    .updateTable(tableName)
    .set(updateData)
    .where("orders.id", "=", id)
    .returningAll()
    .executeTakeFirstOrThrow();
}

export async function orderDelete(id: string) {
  return await db
    .deleteFrom(tableName)
    .where("orders.id", "=", id)
    .returningAll()
    .executeTakeFirstOrThrow();
}

export async function orderTruncate() {
  return await db
    .deleteFrom(tableName)
    .where("orders.id", "is not", null)
    .execute();
}
