import {
  pgTable,
  varchar,
  boolean,
  integer,
  timestamp,
  uuid,
  pgEnum,
  text,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// Define the enum for device platform
export const device_platform = pgEnum("device_platform", [
  "android",
  "ios",
  "macos",
  "windows",
  "web",
]);

export const user = pgTable("users", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .default(sql`uuid_generate_v4()`),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  presence: varchar("presence", { length: 50 }).notNull().default("offline"),
  webPushSubscription: text("web_push_subscription"),
  webPushEnabled: boolean("web_push_enabled").notNull().default(false),
  isAdmin: boolean("is_admin").notNull().default(false),
  userStatus: integer("user_status").notNull().default(0),
  emailVerified: boolean("email_verified").notNull().default(false),
  displayName: varchar("display_name", { length: 255 }).notNull(),
  firstName: varchar("first_name", { length: 255 }),
  lastName: varchar("last_name", { length: 255 }),
  createdAt: timestamp("created_at", { withTimezone: false })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: false })
    .notNull()
    .defaultNow(),
});

// password table
export const password = pgTable("passwords", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .default(sql`uuid_generate_v4()`),
  hash: text("hash").notNull(),
  userId: varchar("user_id", { length: 36 })
    .notNull()
    .unique()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: false })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: false })
    .notNull()
    .defaultNow(),
});

export const device_token = pgTable("device_tokens", {
  id: uuid("id")
    .primaryKey()
    .default(sql`uuid_generate_v4()`),
  token: text("token").notNull(),
  createdAt: timestamp("created_at", { withTimezone: false })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: false })
    .notNull()
    .defaultNow(),
  userId: varchar("user_id", { length: 36 })
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  platform: device_platform("platform").notNull(),
});

export const refresh_token = pgTable("refresh_tokens", {
  id: uuid("id")
    .primaryKey()
    .default(sql`uuid_generate_v4()`),
  userId: varchar("user_id", { length: 36 })
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiry: timestamp("expiry", { withTimezone: false }).notNull(),
});
