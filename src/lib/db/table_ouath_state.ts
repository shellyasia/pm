import { ColumnType, Insertable, Selectable, Updateable } from "kysely";
import { db } from "./db";
import crypto from "node:crypto";

export interface OauthStateTable {
  id: ColumnType<string, string | undefined, never>; //primary key and unique
  value: ColumnType<string, string | undefined, never>;
}

export type OauthState = Selectable<OauthStateTable>;
export type OauthStateInsert = Insertable<OauthStateTable>;
export type OauthStateUpdate = Updateable<OauthStateTable>;

const tableName = "oauth_states";

export async function oauthStateExist(id: string): Promise<boolean> {
  return await db
    .selectFrom(tableName)
    .where("id", "=", id)
    .selectAll()
    .executeTakeFirst()
    .then((row) => !!row);
}

export async function oauthStateCreate() {
  const id = crypto.randomUUID();
  const insert: OauthStateInsert = {
    id,
    value: new Date().toISOString(),
  };
  await db.insertInto(tableName).values(insert).execute();
  return id;
}

export async function oauthStateRemove(id: string) {
  if (!id) return;
  await db.deleteFrom(tableName).where("id", "=", id).execute();
}
