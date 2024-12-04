/// <reference lib="webworker" />

import { Database, OpfsDatabase, Sqlite3Static } from "@sqlite.org/sqlite-wasm";
declare function importScripts(...urls: string[]): void;
declare global {
  function sqlite3InitModule(config: {
    print: typeof console.log;
    printErr: typeof console.error;
  }): Promise<any>;
}

const log = console.log;
const error = console.error;

let db: OpfsDatabase | Database;

const start = (sqlite3: Sqlite3Static) => {
  log("Running SQLite3 version", sqlite3.version.libVersion);
  db =
    "opfs" in sqlite3
      ? new sqlite3.oo1.OpfsDb("/mydb.sqlite3")
      : new sqlite3.oo1.DB("/mydb.sqlite3", "ct");
  log(
    "opfs" in sqlite3
      ? `OPFS is available, created persisted database at ${db.filename}`
      : `OPFS is not available, created transient database ${db.filename}`
  );
  // Your SQLite code here.
  // migrations go here..
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  log("Database initialized with users table");
  self.postMessage({ type: "READY" });
};

// Handle messages from main thread
self.onmessage = async (event) => {
  const { type, payload, responseId } = event.data;
  console.log("worker", { type, payload, responseId });

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

let sqlite3Js = "sqlite3.js";
const urlParams = new URL(self.location.href).searchParams;
if (urlParams.has("sqlite3.dir")) {
  sqlite3Js = urlParams.get("sqlite3.dir") + "/" + sqlite3Js;
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
      start(sqlite3);
    } catch (e) {
      if (e instanceof Error) {
        error("Exception:", e.message);
      } else {
        error("Exception:", String(e));
      }
    }
  });

// import migrationConfig from "@/lib/drizzle/migrations";
// import {
//   createTableRelationsHelpers,
//   DefaultLogger,
//   entityKind,
//   sql,
//   extractTablesRelationalConfig,
//   type RelationalSchemaConfig,
//   type TablesRelationalConfig,
//   type DrizzleConfig,
//   Logger,
//   NoopLogger,
//   SelectedFieldsOrdered,
//   fillPlaceholders,
//   type Query,
// } from "drizzle-orm";
// import {
//   BaseSQLiteDatabase,
//   SQLiteSyncDialect,
//   type PreparedQueryConfig as PreparedQueryConfigBase,
//   type SQLiteExecuteMethod,
//   SQLitePreparedQuery,
//   SQLiteSession,
//   type SQLiteTransactionConfig,
// } from "drizzle-orm/sqlite-core";

// // SQLite WASM specific types
// interface SQLiteWasmRunResult {
//   changes: number;
//   lastInsertRowId: number | bigint;
// }

// export interface SQLiteWasmSessionOptions {
//   logger?: Logger;
// }

// type PreparedQueryConfig = Omit<PreparedQueryConfigBase, "statement" | "run">;

// export class SQLiteWasmSession<
//   TFullSchema extends Record<string, unknown>,
//   TSchema extends TablesRelationalConfig
// > extends SQLiteSession<"sync", SQLiteWasmRunResult, TFullSchema, TSchema> {
//   static override readonly [entityKind]: string = "SQLiteWasmSession";

//   private logger: Logger;

//   constructor(
//     private db: any, // SQLite WASM DB instance
//     dialect: SQLiteSyncDialect,
//     private schema: RelationalSchemaConfig<TSchema> | undefined,
//     options: SQLiteWasmSessionOptions = {}
//   ) {
//     super(dialect);
//     this.logger = options.logger ?? new NoopLogger();
//   }

//   prepareQuery<T extends Omit<PreparedQueryConfig, "run">>(
//     query: Query,
//     fields: SelectedFieldsOrdered | undefined,
//     executeMethod: SQLiteExecuteMethod,
//     isResponseInArrayMode: boolean,
//     customResultMapper?: (rows: unknown[][]) => unknown
//   ): SQLiteWasmPreparedQuery<T> {
//     const stmt = this.db.prepare(query.sql);
//     return new SQLiteWasmPreparedQuery(
//       stmt,
//       query,
//       this.logger,
//       fields,
//       executeMethod,
//       isResponseInArrayMode,
//       customResultMapper
//     );
//   }

//   override transaction<T>(
//     transaction: (tx: SQLiteWasmTransaction<TFullSchema, TSchema>) => T,
//     config: SQLiteTransactionConfig = {}
//   ): T {
//     const tx = new SQLiteWasmTransaction(
//       "sync",
//       this.dialect,
//       this,
//       this.schema
//     );
//     this.run(sql.raw(`begin${config?.behavior ? " " + config.behavior : ""}`));
//     try {
//       const result = transaction(tx);
//       this.run(sql`commit`);
//       return result;
//     } catch (err) {
//       this.run(sql`rollback`);
//       throw err;
//     }
//   }
// }

// interface MigrationMeta {
//   sql: string[];
//   folderMillis: number;
//   hash: string;
//   bps: boolean;
// }

// interface MigrationConfig {
//   journal: {
//     entries: { idx: number; when: number; tag: string; breakpoints: boolean }[];
//   };
//   migrations: Record<string, string>;
// }

// async function readMigrationFiles({
//   journal,
//   migrations,
// }: MigrationConfig): Promise<MigrationMeta[]> {
//   const migrationQueries: MigrationMeta[] = [];

//   for await (const journalEntry of journal.entries) {
//     const query =
//       migrations[`m${journalEntry.idx.toString().padStart(4, "0")}`];

//     if (!query) {
//       throw new Error(`Missing migration: ${journalEntry.tag}`);
//     }

//     try {
//       const result = query.split("--> statement-breakpoint").map((it) => {
//         return it;
//       });

//       migrationQueries.push({
//         sql: result,
//         bps: journalEntry.breakpoints,
//         folderMillis: journalEntry.when,
//         hash: "",
//       });
//     } catch {
//       throw new Error(`Failed to parse migration: ${journalEntry.tag}`);
//     }
//   }

//   return migrationQueries;
// }

// export interface MigrationRunConfig {
//   migrationsFolder: string;
//   migrationsTable?: string;
//   migrationsSchema?: string;
// }

// async function migrate(config?: string | MigrationRunConfig) {
//   const migrations = await readMigrationFiles(migrationConfig);
//   console.log("migrations", migrations);
//   const migrationsTable =
//     config === undefined
//       ? "__drizzle_migrations"
//       : typeof config === "string"
//       ? "__drizzle_migrations"
//       : config.migrationsTable ?? "__drizzle_migrations";

//   const migrationTableCreate = sql`
// 			CREATE TABLE IF NOT EXISTS ${sql.identifier(migrationsTable)} (
// 				id SERIAL PRIMARY KEY,
// 				hash text NOT NULL,
// 				created_at numeric
// 			)
// 		`;
//   // session.run(migrationTableCreate);
//   const dbMigrations = session.values<[number, string, string]>(
//     sql`SELECT id, hash, created_at FROM ${sql.identifier(
//       migrationsTable
//     )} ORDER BY created_at DESC LIMIT 1`
//   );

//   const lastDbMigration = dbMigrations[0] ?? undefined;
//   session.run(sql`BEGIN`);
// }

// migrate();
