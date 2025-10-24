import { Pool } from "pg";
import { Kysely, PostgresDialect } from "kysely";
import { config } from "@/lib/config/envs";

// https://vercel.com/docs/storage/vercel-postgres/using-an-orm#kysely
// https://kysely.dev/docs/getting-started

export interface Database {
  products: import("./table_product").ProductTable;
  users: import("./table_user").UserTable;
  orders: import("./table_order").OrderTable;
  attachments: import("./table_attachment").AttachmentTable;
  oauth_states: import("./table_ouath_state").OauthStateTable;
  hn_items: import("./table_hn").HnItemTable;
}

function createPgConnectionClient(): Kysely<Database> {
  const dialect = new PostgresDialect({
    pool: new Pool({
      connectionString: config.DATABASE_URL,
      max: 10,
    }),
  });
  return new Kysely<Database>({
    dialect,
    log: (msg) => {
      if (config.NODE_ENV !== "production") {
        //print sql
        console.log(
          msg.query.sql,
          "  params: ",
          msg.query.parameters.join(","),
        );
      }
    },
  });
}

export const db = createPgConnectionClient();
