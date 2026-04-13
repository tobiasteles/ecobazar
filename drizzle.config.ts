import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./db/schema.ts", // Verifique se o caminho está correto (ex: ./src/db/schema.ts)
  out: "./drizzle",
  dialect: "postgresql", // Em vez de 'driver: pg', agora usamos 'dialect'
  dbCredentials: {
    url: process.env.DATABASE_URL!, // Em vez de 'connectionString', agora é apenas 'url'
  },
});