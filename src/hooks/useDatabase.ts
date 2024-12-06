import { drizzle, SqliteRemoteDatabase } from "drizzle-orm/sqlite-proxy";
import { useEffect, useState } from "react";

export type WorkerMessage = {
  type: "SQL_QUERY";
  payload?: any;
};

export type WorkerResponse = {
  type: "QUERY_RESPONSE" | "ERROR" | "READY";
  payload: {} | undefined;
  responseId: string;
};

class Database {
  public db: SqliteRemoteDatabase<Record<string, never>>;
  private worker: Worker;
  private callbacks: Map<string, (value: any) => void>;

  constructor(isReadyCallback: () => void) {
    this.db = drizzle(async (sql, params, method) => {
      // console.log([sql, params, method]);
      try {
        const data: any = await this.sendMessage("SQL_QUERY", {
          sql,
          params,
          method,
        });
        return { rows: data };
      } catch (e: any) {
        console.error("Error from sqlite proxy server:", e);
        throw e;
      }
    });
    this.worker = new Worker(`/worker.js?sqlite3.dir=jswasm&sqlite3.logs=true`);
    this.callbacks = new Map();

    this.worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
      const { type, payload, responseId } = event.data;

      if (type === "ERROR") {
        console.error("Database error:", payload);
        return;
      }

      if (type === "READY") {
        console.log("Database ready");
        isReadyCallback();
        return;
      }

      const callback = this.callbacks.get(responseId);
      if (callback) {
        callback(payload);
        this.callbacks.delete(type);
      }
    };
  }

  private generateUniqueId(): string {
    return `id-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
  }

  private sendMessage<T>(
    type: WorkerMessage["type"],
    message?: any
  ): Promise<T> {
    const id = this.generateUniqueId();
    return new Promise((resolve) => {
      this.callbacks.set(id, resolve);
      const payload = {
        sql: message.sql,
        bind: message.params,
        ...(message.method !== "run" && { returnValue: "resultRows" }),
      };
      this.worker.postMessage({ responseId: id, payload, type });
    });
  }
}

export function useDatabase() {
  const [ready, setReady] = useState(false);
  const [db, setDb] = useState<SqliteRemoteDatabase<
    Record<string, never>
  > | null>(null);

  useEffect(() => {
    const $globalThis = globalThis as any;
    if (!$globalThis.dbInstance) {
      $globalThis.dbInstance = new Database(() => {
        setReady(true);
      });
      setDb($globalThis.dbInstance.db);
    } else if (!ready && $globalThis.dbInstance) {
      setDb($globalThis.dbInstance.db);
      setReady(true);
    } else {
      setDb($globalThis.dbInstance.db);
    }
  }, []);

  return ready ? db : null;
}
