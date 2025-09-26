import * as path from "path";
import { promises as fs } from "fs";
import {
  FileMigrationProvider,
  Kysely,
  Migrator,
  PostgresDialect,
} from "kysely";
import { Database } from "./db";
import { loadEnvConfig } from "@next/env";
import { Pool } from "pg";
import process from "process";

async function runMigration(direction: "up" | "down" = "up") {
  //1. load dotenv
  const projectDir = process.cwd();
  loadEnvConfig(projectDir);

  // Import config after loading environment variables
  const { config } = await import("@/lib/config/envs");

  //2. create database connection
  const dialect = new PostgresDialect({
    pool: new Pool({
      connectionString: config.DATABASE_URL,
      max: 10,
    }),
  });

  const db = new Kysely<Database>({
    dialect,
  });

  const migrator = new Migrator({
    db,
    provider: new FileMigrationProvider({
      fs,
      path,
      // This needs to be an absolute path.
      migrationFolder: path.join(__dirname, "migrations"),
    }),
  });

  // Check migration status first
  console.log("Checking migration status...");
  const migrations = await migrator.getMigrations();

  console.log("Migration status:");
  migrations.forEach((migration) => {
    console.log(
      `- ${migration.name}: ${migration.executedAt ? "EXECUTED" : "PENDING"}`,
    );
  });

  let error, results;

  if (direction === "down") {
    console.log("Running migration down (rollback one step)...");
    ({ error, results } = await migrator.migrateDown());
  } else {
    console.log("Running migrations up (to latest)...");
    ({ error, results } = await migrator.migrateToLatest());
  }

  results?.forEach((it) => {
    if (it.status === "Success") {
      console.log(`migration "${it.migrationName}" was executed successfully`);
    } else if (it.status === "Error") {
      console.error(`failed to execute migration "${it.migrationName}"`);
    }
  });

  if (error) {
    console.error("failed to migrate");
    console.error(error);
    process.exit(1);
  }

  await db.destroy();
  return { error: error, result: results };
}

// Parse command line arguments
const args = process.argv.slice(2);
const direction = args[0] as "up" | "down";

if (direction && !["up", "down"].includes(direction)) {
  console.error('Invalid argument. Use "up" or "down"');
  console.log("Usage: npm run migrate [up|down]");
  process.exit(1);
}

runMigration(direction);
