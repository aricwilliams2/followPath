import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TIDB_CA_PATH = path.join(__dirname, '../certs/isrgrootx1.pem');

function needsTls(host, port) {
  if (process.env.DB_SSL === 'true') return true;
  if (String(host).includes('tidbcloud.com')) return true;
  if (Number(port) === 4000) return true;
  return false;
}

function buildSslOptions() {
  const ssl = {
    minVersion: 'TLSv1.2',
    rejectUnauthorized: true,
  };
  if (fs.existsSync(TIDB_CA_PATH)) {
    ssl.ca = fs.readFileSync(TIDB_CA_PATH);
  }
  return ssl;
}

/** Shared MySQL connection options (local + Render + TiDB Cloud). */
export function getDbConfig(extra = {}) {
  const host = process.env.DB_HOST || '127.0.0.1';
  const port = Number(process.env.DB_PORT || 3306);

  const config = {
    host,
    port,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'carma',
    ...extra,
  };

  if (needsTls(host, port)) {
    config.ssl = buildSslOptions();
  }

  return config;
}

/** Replace `USE carma` in SQL files with the configured database name. */
export function sqlForDatabase(sql, database = process.env.DB_NAME || 'carma') {
  return sql.replace(/^USE\s+[\w`]+\s*;/gim, `USE \`${database}\`;`);
}
