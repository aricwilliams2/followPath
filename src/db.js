import mysql from 'mysql2/promise';
import { getDbConfig } from './dbConfig.js';

const pool = mysql.createPool({
  ...getDbConfig(),
  waitForConnections: true,
  connectionLimit: 10,
  namedPlaceholders: true,
  timezone: 'Z',
});

/** Keep TIMESTAMP columns and elapsed math in UTC (avoids 4h skew on many Windows MySQL installs). */
pool.on('connection', (conn) => {
  conn.query("SET time_zone = '+00:00'");
});

export async function query(sql, params = {}) {
  const [rows] = await pool.execute(sql, params);
  return rows;
}

export { pool };
