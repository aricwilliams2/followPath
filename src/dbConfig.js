/** Shared MySQL connection options (local + Render + free cloud hosts). */
export function getDbConfig(extra = {}) {
  const config = {
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'carma',
    ...extra,
  };

  if (process.env.DB_SSL === 'true') {
    config.ssl = { rejectUnauthorized: true };
  }

  return config;
}

/** Replace `USE carma` in SQL files with the configured database name. */
export function sqlForDatabase(sql, database = process.env.DB_NAME || 'carma') {
  return sql.replace(/^USE\s+[\w`]+\s*;/gim, `USE \`${database}\`;`);
}
