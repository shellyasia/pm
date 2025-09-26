import { Kysely, sql } from "kysely";

const tableName = "attachments";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable(tableName)
    .addColumn("id", "serial", (col) => col.primaryKey()) //auto incrementing primary key
    .addColumn("hash", "varchar", (col) => col.notNull()) //sha256 hash of the file
    .addColumn("name", "varchar", (col) => col.notNull().defaultTo("")) //attachment name, not unique
    .addColumn("size", "integer", (col) => col.notNull().defaultTo(0)) //file size in bytes
    .addColumn("mimetype", "varchar", (col) => col.notNull().defaultTo("")) //file mime type
    .addColumn("status", "varchar", (col) => col.notNull().defaultTo("active")) //active, archived, deleted
    .addColumn("download_count", "integer", (col) => col.notNull().defaultTo(0)) //download count
    .addColumn("remark", "varchar", (col) => col.notNull().defaultTo("")) //optional remark
    .addColumn("tag", "varchar", (col) => col.notNull().defaultTo("")) //only one tag per attachment, e.g. "manual", "firmware", "printing", "certificate"
    .addColumn("product_code", "varchar", (col) => col.notNull().defaultTo("")) //index to products.id
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
    .addColumn("comments", "jsonb", (col) => col.notNull().defaultTo("[]")) //array of {email, content, created_at, action}
    .execute();

  // Create indexes

  await db.schema
    .createIndex("idx_attachments_hash")
    .on(tableName)
    .column("hash")
    .execute();

  await db.schema
    .createIndex("idx_attachments_status")
    .on(tableName)
    .column("status")
    .execute();

  await db.schema
    .createIndex("idx_attachments_tag")
    .on(tableName)
    .column("tag")
    .execute();

  await db.schema
    .createIndex("idx_attachments_product_code")
    .on(tableName)
    .column("product_code")
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable(tableName).execute();
}
