import * as SQLite from "expo-sqlite";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import migrations from "@/lib/drizzle/migrations";
import * as FileSystem from "expo-file-system";

const DB_NAME = "dm0nk.db";
const expo = SQLite.openDatabaseSync(DB_NAME);
export const db = drizzle(expo);

export const serialize = async () => {
  try {
    const data = await expo.serializeAsync();
    const fileUri = FileSystem.documentDirectory + "doc.html";
    // await FileSystem.writeAsStringAsync(fileUri, data, {
    //   encoding: FileSystem.EncodingType.UTF8,
    // });
    // save as base64
  } catch (e) {
    alert(e);
  }
};

export function useMigrate() {
  const { success, error } = useMigrations(db, migrations);
  return { success, error };
}
