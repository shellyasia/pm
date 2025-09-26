import {
  ColumnType,
  Generated,
  Insertable,
  Selectable,
  Updateable,
} from "kysely";
import { db } from "./db";

export type ProductStatus = "crawler" | "edited" | "approved" | "rejected";

export interface ProductTable {
  id: Generated<string>;
  html: string;
  code: string; //product code, should be unique
  status: ProductStatus;
  firmware: string;
  created_at: ColumnType<Date, Date | undefined, never>;
  updated_at: ColumnType<Date, Date | undefined, never>;
}

const tableName = "products";

export type Product = Selectable<ProductTable>;
export type ProductInsert = Insertable<ProductTable>;
export type ProductUpdate = Updateable<ProductTable>;

export async function dbProductFirst(id: string) {
  return await db
    .selectFrom(tableName)
    .selectAll()
    .where("id", "=", id)
    .executeTakeFirstOrThrow();
}

export async function dbProductAll(
  search: string,
  page = 1,
  limit = 60,
  fast = false,
) {
  // Build base query for filtering
  let baseQuery = db.selectFrom(tableName);

  //ignore case search
  if (search) {
    baseQuery = baseQuery.where("code", "ilike", `%${search}%`);
  }

  // Get total count with a separate query
  let total = 0;
  const countResult = await baseQuery
    .select(db.fn.count<number>("id").as("count"))
    .executeTakeFirst();
  if (countResult) {
    total = countResult.count;
  }

  // Build data query with ordering and pagination
  const dataQuery = baseQuery
    .orderBy("status", "asc")
    .offset((page - 1) * limit)
    .limit(limit);

  if (fast) {
    const rows = await dataQuery.select(["id", "code", "status"]).execute();
    return { total, rows: rows as Product[] };
  } else {
    const rows = await dataQuery.select([
      "id",
      "code",
      "status",
      "firmware",
      "created_at",
      "updated_at",
    ]).execute();
    return { total, rows: rows as Product[] };
  }
}

export async function dbProductInsert(rows: ProductInsert[] | ProductInsert) {
  // Generate UUID for id if not provided
  const rowsWithId = Array.isArray(rows)
    ? rows.map((row) => ({
        ...row,
        id: row.id || crypto.randomUUID(),
      }))
    : {
        ...rows,
        id: rows.id || crypto.randomUUID(),
      };

  return await db
    .insertInto(tableName)
    .values(rowsWithId)
    .returningAll()
    .executeTakeFirstOrThrow();
}

export async function dbProductSync(rows: ProductInsert[]) {
  const ids = rows.map((r) => String(r.id)) || [];
  // Delete existing products that are in the new rows and have status 'crawler'
  if (ids.length === 0) return;
  await db
    .deleteFrom(tableName)
    .where("status", "in", ["crawler", "approved"])
    .where("id", "in", ids)
    .execute();
  // Insert new rows
  return await db
    .insertInto(tableName)
    .values(rows)
    .returningAll()
    .execute();
}

export async function dbProductTruncate(status: ProductStatus = "crawler") {
  return await db
    .deleteFrom(tableName)
    .where("status", "=", status)
    .execute();
}

export async function dbProductUpdate(id: string, product: ProductUpdate) {
  return await db
    .updateTable(tableName)
    .set(product)
    .where("id", "=", id)
    .returningAll()
    .executeTakeFirstOrThrow();
}

export async function dbProductDelete(id: string) {
  return await db
    .deleteFrom(tableName)
    .where("id", "=", id)
    .returningAll()
    .executeTakeFirstOrThrow();
}
