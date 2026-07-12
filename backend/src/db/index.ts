import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.warn('⚠️ Warning: DATABASE_URL is not set in environmental variables. Database actions will fail.');
}

export const pool = new Pool({
  connectionString,
  ssl: connectionString?.includes('supabase.co') || connectionString?.includes('supabase.com')
    ? { rejectUnauthorized: false }
    : false
});

// Test connection
pool.on('connect', () => {
  console.log('⚡ Connected to the PostgreSQL Database successfully.');
});

pool.on('error', (err) => {
  console.error('❌ Database Pool Error:', err);
});

export const query = async (text: string, params?: any[]) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log(`🔍 Executed query [${duration}ms]:`, { text: text.trim().substring(0, 100) + '...', rowsCount: res.rowCount });
    return res;
  } catch (error) {
    console.error('❌ Query execution failed:', { text, error });
    throw error;
  }
};
