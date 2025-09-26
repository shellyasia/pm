import { Kysely, sql } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable("orders")
    .addColumn("id", "varchar", (col) => col.primaryKey().defaultTo(""))
    .addColumn("product_code", "varchar", (col) => col.notNull().defaultTo("")) //index to products.id
    .addColumn("factory", "varchar", (col) => col.notNull().defaultTo("normal")) //OrderFactory index
    .addColumn(
      "priority",
      "varchar",
      (col) => col.notNull().defaultTo("normal"),
    ) //OrderPriority
    .addColumn("quantity", "integer", (col) => col.notNull().defaultTo(0))
    .addColumn("batch", "varchar", (col) => col.notNull().defaultTo("")) //index
    .addColumn("comments", "jsonb", (col) => col.notNull().defaultTo("[]")) //array of {email, content, timestamp, action}
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

  // Create indexes
  await db.schema
    .createIndex("idx_orders_product_code")
    .on("orders")
    .column("product_code")
    .execute();

  await db.schema
    .createIndex("idx_orders_factory")
    .on("orders")
    .column("factory")
    .execute();

  await db.schema
    .createIndex("idx_orders_priority")
    .on("orders")
    .column("priority")
    .execute();

  await db.schema
    .createIndex("idx_orders_batch")
    .on("orders")
    .column("batch")
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable("orders").execute();
}
