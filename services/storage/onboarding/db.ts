import { Pool } from 'pg';

if (!process.env.NEXT_PUBLIC_SUPABASE_POSTGRES_URL) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_POSTGRES_URL');
}

const pool = new Pool({
  connectionString: process.env.NEXT_PUBLIC_SUPABASE_POSTGRES_URL,
});

export { pool }; 