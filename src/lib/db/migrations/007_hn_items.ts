import { Kysely, sql } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable("hn_items")
    .addColumn("id", "integer", (col) => col.primaryKey())
    .addColumn("title", "varchar", (col) => col.notNull().defaultTo(""))
    .addColumn("url", "varchar", (col) => col.notNull().defaultTo(""))
    .addColumn("type", "varchar", (col) => col.notNull().defaultTo(""))
    .addColumn("score", "integer", (col) => col.notNull().defaultTo(0))
    .addColumn("created_at", "timestamp", (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .execute();

  // Create indexes for better search performance
  await db.schema
    .createIndex("idx_hn_items_title")
    .on("hn_items")
    .column("title")
    .execute();

  await db.schema
    .createIndex("idx_hn_items_url")
    .on("hn_items")
    .column("url")
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable("hn_items").execute();
}
