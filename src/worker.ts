/// <reference lib="webworker" />
import migrationsConfig from "@/lib/drizzle/migrations";
import { Database, OpfsDatabase, Sqlite3Static } from "@sqlite.org/sqlite-wasm";
import { QueryWithTypings, SQL, sql } from "drizzle-orm";
import { SQLiteSyncDialect } from "drizzle-orm/sqlite-core";
declare function importScripts(...urls: string[]): void;
declare global {
  function sqlite3InitModule(config: {
    print: typeof console.log;
    printErr: typeof console.error;
  }): Promise<any>;
}

let log: typeof console.log = () => {};
const error = console.error;

let db: OpfsDatabase | Database;

const start = (sqlite3: Sqlite3Static, dbName: string) => {
  log("Running SQLite3 version", sqlite3.version.libVersion);
  log("Database Name:", dbName);
  db =
    "opfs" in sqlite3
      ? new sqlite3.oo1.OpfsDb(`/${dbName}.sqlite3`)
      : new sqlite3.oo1.DB(`/${dbName}.sqlite3`, "ct");
  log(
    "opfs" in sqlite3
      ? `OPFS is available, created persisted database at ${db.filename}`
      : `OPFS is not available, created transient database ${db.filename}`
  );

  migrate();

  log("Database initialized post migrations");
  self.postMessage({ type: "READY" });
};

// Handle messages from main thread
self.onmessage = async (event) => {
  const { type, payload, responseId } = event.data;
  log("worker", { type, payload, responseId });

  try {
    switch (type) {
      case "SQL_QUERY":
        // const users = db.exec({
        //   sql: payload.sql,
        //   bind: payload.params,
        //   returnValue: "resultRows",
        // });
        const result = db.exec(payload);
        self.postMessage({ type: "SQL", payload: result, responseId });
        break;
    }
  } catch (e) {
    if (e instanceof Error) {
      error("Exception:", e.message);
      self.postMessage({ type: "ERROR", payload: e.message });
    } else {
      error("Exception:", String(e));
      self.postMessage({ type: "ERROR", payload: String(e) });
    }
  }
};

let dbName = "mydb";
let sqlite3Js = "sqlite3.js";
const urlParams = new URL(self.location.href).searchParams;
if (urlParams.has("sqlite3.dir")) {
  sqlite3Js = urlParams.get("sqlite3.dir") + "/" + sqlite3Js;
}
if (urlParams.has("sqlite3.logs") && urlParams.get("sqlite3.logs") === "true") {
  log = console.log;
}
if (urlParams.has("sqlite3.db")) {
  dbName = urlParams.get("sqlite3.db") as string;
}

importScripts(sqlite3Js);

self
  .sqlite3InitModule({
    print: log,
    printErr: error,
  })
  .then(function (sqlite3: Sqlite3Static) {
    log("Done initializing. Running demo...");
    try {
      start(sqlite3, dbName);
    } catch (e) {
      if (e instanceof Error) {
        error("Exception:", e.message);
      } else {
        error("Exception:", String(e));
      }
    }
  });

interface MigrationMeta {
  sql: string[];
  folderMillis: number;
  hash: string;
  bps: boolean;
}

interface MigrationConfig {
  journal: {
    entries: { idx: number; when: number; tag: string; breakpoints: boolean }[];
  };
  migrations: Record<string, string>;
}

function readMigrationFiles({
  journal,
  migrations,
}: MigrationConfig): MigrationMeta[] {
  const migrationQueries: MigrationMeta[] = [];

  for (const journalEntry of journal.entries) {
    const query =
      migrations[`m${journalEntry.idx.toString().padStart(4, "0")}`];

    if (!query) {
      throw new Error(`Missing migration: ${journalEntry.tag}`);
    }

    try {
      const result = query.split("--> statement-breakpoint").map((it) => {
        return it;
      });

      migrationQueries.push({
        sql: result,
        bps: journalEntry.breakpoints,
        folderMillis: journalEntry.when,
        hash: "",
      });
    } catch {
      throw new Error(`Failed to parse migration: ${journalEntry.tag}`);
    }
  }

  return migrationQueries;
}

function toQuery(sql: SQL<unknown>): QueryWithTypings {
  const sqliteDialect = new SQLiteSyncDialect();
  return sqliteDialect.sqlToQuery(sql);
}

function migrate(
  config?:
    | string
    | {
        migrationsFolder: string;
        migrationsTable?: string;
        migrationsSchema?: string;
      }
) {
  const migrations = readMigrationFiles(migrationsConfig);
  const migrationsTable =
    config === undefined
      ? "__drizzle_migrations"
      : typeof config === "string"
      ? "__drizzle_migrations"
      : config.migrationsTable ?? "__drizzle_migrations";

  // create table
  const migrationTableCreate = sql`
        CREATE TABLE IF NOT EXISTS ${sql.identifier(migrationsTable)} (
          id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
          hash text,
          created_at numeric
        )
      `;

  log(`migrationTableCreate`, toQuery(migrationTableCreate));

  db.exec({
    sql: toQuery(migrationTableCreate).sql,
  });

  const migrationTableCheck = sql`SELECT id, hash, created_at FROM ${sql.identifier(
    migrationsTable
  )} ORDER BY created_at DESC LIMIT 1`;

  log("migrationTableCheck", toQuery(migrationTableCheck));

  const dbMigrations = db.exec({
    sql: toQuery(migrationTableCheck).sql,
    returnValue: "resultRows",
    rowMode: "object",
  });

  log("dbMigrations", JSON.stringify(dbMigrations));

  const lastDbMigration = dbMigrations[0] ?? undefined;

  log("lastDbMigration", lastDbMigration);
  log(toQuery(sql`BEGIN`).sql);
  db.exec({ sql: toQuery(sql`BEGIN`).sql });

  try {
    for (const migration of migrations) {
      if (
        !lastDbMigration ||
        Number(lastDbMigration.created_at)! < migration.folderMillis
      ) {
        for (const stmt of migration.sql) {
          log(toQuery(sql.raw(stmt)).sql);
          db.exec({ sql: toQuery(sql.raw(stmt)).sql });
        }
        const stmt = toQuery(
          sql`INSERT INTO ${sql.identifier(
            migrationsTable
          )} ("hash", "created_at") VALUES(${migration.hash}, ${
            migration.folderMillis
          })`
        );
        log(stmt.sql, stmt.params);
        db.exec({
          sql: stmt.sql,
          bind: stmt.params as any,
        });
      }
    }
    log(toQuery(sql`COMMIT`).sql);
    db.exec({ sql: toQuery(sql`COMMIT`).sql });
  } catch (e) {
    log(toQuery(sql`ROLLBACK`).sql);
    db.exec({ sql: toQuery(sql`ROLLBACK`).sql });
    if (e instanceof Error) {
      error("Exception:", e.message);
    } else {
      error("Exception:", String(e));
    }
  }
}
