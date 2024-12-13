import { sql } from "drizzle-orm";
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

// type | inventory

export const notesTable = sqliteTable("notes", {
  id: text().primaryKey(),
  type: text().default("default").notNull(),
  title: text().default("").notNull(),
  listDisplayView: text("list_display_view").default("").notNull(),
  data: text(),
  created_at: text("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updated_at: text("updated_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  is_deleted: int().default(0).notNull(),
  bg_color: text().default("#ffffff").notNull(),
  pinned: int().default(0).notNull(),
});

export const usersTable = sqliteTable("users", {
  id: int().primaryKey({ autoIncrement: true }),
  name: text(),
  email: text().unique(),
  created_at: text("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export const notesVersionsTable = sqliteTable("notes_versions", {
  id: int().primaryKey({ autoIncrement: true }),
  note_id: text()
    .notNull()
    .references(() => notesTable.id),
  data: text(),
  created_at: text("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updated_at: text("updated_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updated_at_1: text("updated_at_1")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

/*

- Inventory
Ai Notes | Add OpenAI Key | Store using expo-secure-store
- Weblinks
- Pinned
Memorise | Spaced Repetition
Collection(Law Acts) | Files stored on the internet and copies on the device | Limit 10MB
Checklist (Nesting)
Trip
Tasks
- Workout | Diet
- Double Entry ledger 
    - Feeds(BlueSky, HackerNews, LokSatta, The Hindu, The Indian Express)
*/
