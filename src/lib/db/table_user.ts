import { ColumnType, Insertable, Selectable, Updateable } from "kysely";
import { db } from "./db";

export type Role = "admin" | "editor" | "viewer";

export interface UserTable {
  email: ColumnType<string, string | undefined, never>; //primary key and unique
  name: ColumnType<string, string | undefined, never>;
  role: ColumnType<Role, Role | undefined, never>;
  company: ColumnType<string | string, string | undefined, never>; //index
  created_at: ColumnType<Date, Date | undefined, never>;
  updated_at: ColumnType<Date, Date | undefined, never>;
}
export type User = Selectable<UserTable>;
export type UserInsert = Insertable<UserTable>;
export type UserUpdate = Updateable<UserTable>;

const tableName = "users";

export async function dbUserFirst(email: string) {
  return await db
    .selectFrom(tableName)
    .where("email", "=", email)
    .selectAll()
    .executeTakeFirstOrThrow();
}

export async function dbUserFirstOrCreate(email: string): Promise<User> {
  let user = await db
    .selectFrom(tableName)
    .where("email", "=", email)
    .selectAll()
    .executeTakeFirst();
  if (!user) {
    const now = new Date();
    const insert: UserInsert = {
      email,
      name: email.split("@")[0],
      role: "viewer",
      company: "null",
      created_at: now,
      updated_at: now,
    };
    await db.insertInto(tableName).values(insert).execute();
    user = insert as User;
  }
  return user;
}

export async function dbUserUpdate(email: string, update: UserUpdate) {
  return await db
    .updateTable(tableName)
    .set(update)
    .where("email", "=", email)
    .returningAll()
    .executeTakeFirstOrThrow();
}

export async function dbUserAll(search: string = "", page = 1, limit = 60) {
  let q = db.selectFrom(tableName);
  if (search) {
    q = q.where((eb) =>
      eb("email", "ilike", `%${search}%`).or("company", "ilike", `%${search}%`)
    );
  }
  let total = 0;
  const countResult = await q.select(db.fn.count<number>("email").as("count"))
    .executeTakeFirst();
  if (countResult) {
    total = countResult.count;
  }
  q = q.orderBy("created_at", "desc").offset((page - 1) * limit).limit(limit);
  const rows = await q.selectAll().execute();
  return { total, rows };
}
