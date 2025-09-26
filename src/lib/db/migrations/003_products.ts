import { Kysely, sql } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable("products")
    .addColumn("id", "varchar", (col) => col.primaryKey().defaultTo("")) //confluence page id
    .addColumn("html", "text", (col) => col.notNull().defaultTo(""))
    .addColumn("code", "varchar", (col) => col.notNull().defaultTo(""))
    .addColumn("status", "varchar", (col) => col.notNull().defaultTo(""))
    .addColumn("firmware", "varchar", (col) => col.notNull().defaultTo(""))
    .addColumn(
      "created_at",
      "timestamp",
      (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`),
    )
    .addColumn(
      "updated_at",
      "timestamp",
      (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`),
    )
    .execute();

  //add index on code
  await db.schema
    .createIndex("idx_products_code")
    .on("products")
    .column("code")
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable("products").execute();
}
