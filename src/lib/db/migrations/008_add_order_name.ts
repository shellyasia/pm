import { Kysely } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .alterTable("orders")
    .addColumn("name", "varchar", (col) => col.notNull().defaultTo(""))
    .execute();

  // Create index for name column to improve search performance
  await db.schema
    .createIndex("idx_orders_name")
    .on("orders")
    .column("name")
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  // Drop index first
  await db.schema
    .dropIndex("idx_orders_name")
    .execute();

  // Drop the name column
  await db.schema
    .alterTable("orders")
    .dropColumn("name")
    .execute();
}
