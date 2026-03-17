import { Pool, type QueryResultRow } from "pg";
import { requireEnv } from "@/lib/env";

let pool: Pool | undefined;

export function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: requireEnv("DATABASE_URL"),
      max: 4,
      ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : undefined,
    });
  }

  return pool;
}

export async function dbQuery<T extends QueryResultRow>(text: string, params: readonly unknown[] = []) {
  return getPool().query<T>(text, params as unknown[]);
}
