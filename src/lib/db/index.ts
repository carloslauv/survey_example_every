import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

// DATABASE_URL is required at runtime. During build, a placeholder is used
// so the module loads without error; actual queries will always have the real URL.
const sql = neon(
  process.env.DATABASE_URL ?? "postgresql://user:pass@host/db?sslmode=require"
);

export const db = drizzle(sql, { schema });
