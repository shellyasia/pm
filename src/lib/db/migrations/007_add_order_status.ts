import { Kysely } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .alterTable("orders")
    .addColumn("status", "varchar", (col) => col.notNull().defaultTo("draft"))
    .addColumn("remark", "text", (col) => col.notNull().defaultTo(""))
    .execute();

  // Create index for status column
  await db.schema
    .createIndex("idx_orders_status")
    .on("orders")
    .column("status")
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  // Drop index first
  await db.schema
    .dropIndex("idx_orders_status")
    .execute();

  // Drop the status column
  await db.schema
    .alterTable("orders")
    .dropColumn("status")
    .execute();
}
