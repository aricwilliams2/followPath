import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';
import { getDbConfig, sqlForDatabase } from '../src/dbConfig.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const seedPath = path.join(__dirname, '../db/seed.sql');
const sql = sqlForDatabase(fs.readFileSync(seedPath, 'utf8'));

const conn = await mysql.createConnection({
  ...getDbConfig(),
  multipleStatements: true,
});

try {
  await conn.query(sql);
  const [rows] = await conn.query('SELECT COUNT(*) AS n FROM missions');
  console.log(`Seed complete — ${rows[0].n} missions in ${process.env.DB_NAME || 'carma'}.`);
} finally {
  await conn.end();
}
