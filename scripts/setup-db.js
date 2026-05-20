/**
 * Create base tables (schema.sql) and load missions (seed.sql).
 * Run once against a new hosted MySQL database before first API deploy.
 *
 *   cd apps/api && npm run setup-db
 */
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';
import { getDbConfig, sqlForDatabase } from '../src/dbConfig.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbDir = path.join(__dirname, '../db');

async function runFile(conn, filename) {
  const raw = fs.readFileSync(path.join(dbDir, filename), 'utf8');
  const sql = sqlForDatabase(raw);
  console.log(`Running ${filename}…`);
  await conn.query(sql);
}

const conn = await mysql.createConnection({
  ...getDbConfig(),
  multipleStatements: true,
});

try {
  await runFile(conn, 'schema.sql');
  await runFile(conn, 'seed.sql');
  const [rows] = await conn.query('SELECT COUNT(*) AS n FROM missions');
  console.log(`Done — ${rows[0].n} missions in ${process.env.DB_NAME || 'carma'}.`);
} finally {
  await conn.end();
}
