import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pool } from './db.js';

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), '../database');

try {
  for (const file of ['schema.sql', 'seed.sql']) {
    await pool.query(fs.readFileSync(path.join(dir, file), 'utf8'));
    console.log(`OK: ${file}`);
  }
} catch (err) {
  console.error('Error:', err.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}