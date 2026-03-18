import { Pool } from 'pg';
import { getEnv } from './env.js';

let pool: Pool | null = null;

export function getPool(): Pool {
  if (pool) {
    return pool;
  }

  const env = getEnv();
  pool = new Pool({
    connectionString: env.DATABASE_URL,
    ssl: env.DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false }
  });

  return pool;
}
