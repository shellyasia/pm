import { Kysely, sql } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable("users")
    .addColumn("email", "varchar", (col) => col.primaryKey().defaultTo("")) //primary key and unique
    .addColumn("name", "varchar", (col) => col.notNull().defaultTo(""))
    .addColumn("role", "varchar", (col) => col.notNull().defaultTo("viewer")) //Role: admin, editor, viewer
    .addColumn("company", "varchar", (col) => col.notNull().defaultTo("normal")) //Factory: normal, factory1, factory2
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
    .createIndex("idx_users_company")
    .on("users")
    .column("company")
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable("users").execute();
}
