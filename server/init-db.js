/**
 * Script de un solo uso: crea las tablas (schema.sql) y carga datos iniciales (seed.sql).
 * Uso: DATABASE_URL="..." DB_SSL=true node server/init-db.js
 * OJO: schema.sql borra y recrea las tablas, así que borra los datos existentes.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pool } from './db.js';

// Carpeta /database, donde están los archivos .sql.
const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), '../database');

try {
  // Se ejecutan en orden: primero la estructura, después los datos.
  for (const file of ['schema.sql', 'seed.sql']) {
    await pool.query(fs.readFileSync(path.join(dir, file), 'utf8'));
    console.log(`OK: ${file}`);
  }
} catch (err) {
  console.error('Error:', err.message);
  process.exitCode = 1;
// Siempre se cierra la conexión, haya error o no.
} finally {
  await pool.end();
}