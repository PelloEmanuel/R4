import pg from 'pg';

// Pool de conexiones. Las consultas SIEMPRE usan parámetros ($1, $2...) para evitar SQL injection.
export const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});
