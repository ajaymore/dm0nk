import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { MasonryFlashList } from "@shopify/flash-list";
import { Button, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { faAddressCard } from "@fortawesome/free-regular-svg-icons/faAddressCard";
import { useEffect, useRef, useState } from "react";
import { drizzle, SqliteRemoteDatabase } from "drizzle-orm/sqlite-proxy";
import { notesTable, usersTable } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { library } from "@fortawesome/fontawesome-svg-core";
import { faBell as farBell } from "@fortawesome/free-regular-svg-icons/faBell";
import { faBookmark as farBookmark } from "@fortawesome/free-regular-svg-icons/faBookmark";
import { faCalendar as farCalendar } from "@fortawesome/free-regular-svg-icons/faCalendar";
import { faCircle } from "@fortawesome/free-regular-svg-icons/faCircle";
import { faCircleCheck as farCircleCheck } from "@fortawesome/free-regular-svg-icons/faCircleCheck";

library.add(
  faAddressCard,
  farBell,
  farBookmark,
  farCalendar,
  faCircle,
  farCircleCheck
);

console.log("icons initialized...");

// Use proxy for communication
// Figure migration strategy later or handcraft migrations
// The database should be based on user login

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
    this.worker = new Worker(`worker.js?sqlite3.dir=jswasm&sqlite3.logs=true`);
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

function useDatabase() {
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
    } else {
      setDb($globalThis.dbInstance.db);
    }
  }, []);

  return ready ? db : null;
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const db = useDatabase();
  const [users, setUsers] = useState<any[]>([]);

  console.log(users, " users");

  async function getUsers() {
    db!
      .select()
      .from(usersTable)
      // .where(eq(usersTable.email, "john@example.com"))
      .then((data) => {
        setUsers(data);
      });
  }

  useEffect(() => {
    if (db) {
      getUsers();
    }
  }, [db]);

  // create db instance

  return (
    <View style={{ flex: 1, paddingTop: insets.top + 16, gap: 4 }}>
      <Button
        title="create user"
        onPress={async () => {
          await db?.insert(usersTable).values({
            name: `John Doe ${new Date().getTime()}`,
            email: `john-${new Date().getTime()}@example.com`,
          });
          getUsers();
        }}
      />
      <MasonryFlashList
        data={users}
        numColumns={2}
        renderItem={({ item, columnIndex }) => {
          return (
            <View style={{ padding: 8, gap: 1 }}>
              <Text>{item.name}</Text>
              <Button
                title="Edit"
                onPress={async () => {
                  await db
                    ?.update(usersTable)
                    .set({ name: `${item.name}__edited` })
                    .where(eq(usersTable.id, item.id));
                  getUsers();
                }}
              />
              <Button
                title="Delete"
                onPress={async () => {
                  await db
                    ?.delete(usersTable)
                    .where(eq(usersTable.id, item.id));
                  getUsers();
                }}
              />
            </View>
          );
        }}
        estimatedItemSize={200}
      />
    </View>
  );
}
