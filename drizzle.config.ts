import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "sqlite",
  driver: "expo",
  schema: "./src/lib/schema.ts",
  out: "./src/lib/drizzle",
});
