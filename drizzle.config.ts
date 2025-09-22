import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";
config({ path: ".env" });

const connectionString = process.env.DATABASE_CONNECTION_STRING!;

console.log("Connection string:", connectionString);

export default defineConfig({
  schema: "./src/lib/drizzle/schema.ts",
  out: "./src/lib/drizzle/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: connectionString,
  },
});
