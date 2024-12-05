import { sql } from "drizzle-orm";
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

// type | inventory

export const notesTable = sqliteTable("notes", {
  id: text().primaryKey(),
  type: text(),
  data: text(),
  created_at: text("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updated_at: text("updated_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  rand: text().default(""),
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
