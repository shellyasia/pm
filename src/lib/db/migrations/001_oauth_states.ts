import { Kysely } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable("oauth_states")
    .addColumn("id", "varchar", (col) => col.primaryKey().notNull())
    .addColumn("value", "varchar", (col) => col.notNull().defaultTo(""))
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable("oauth_states").execute();
}
