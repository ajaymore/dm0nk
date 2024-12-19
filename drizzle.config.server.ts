import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  schema: "./src/lib/schema.server.ts",
  out: "./src/lib/drizzle.server",
});

/*
npx drizzle-kit generate --config=drizzle.config.server.ts
npx drizzle-kit migrate --config=drizzle.config.server.ts
npx drizzle-kit push --config=drizzle.config.server.ts
*/
