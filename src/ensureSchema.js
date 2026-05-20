import { query } from './db.js';

/** Add answer_options.location_id on DBs created before map choice labels. */
async function ensureUsersAndLeaderboard() {
  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255) NOT NULL UNIQUE,
      username VARCHAR(32) NOT NULL UNIQUE,
      display_name VARCHAR(64) DEFAULT NULL,
      password_hash VARCHAR(255) NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS mission_results (
      id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      user_id INT UNSIGNED NOT NULL,
      mission_id INT UNSIGNED NOT NULL,
      session_id CHAR(36) DEFAULT NULL,
      score INT NOT NULL,
      elapsed_sec INT UNSIGNED DEFAULT NULL,
      completed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_results_user (user_id),
      INDEX idx_results_mission (mission_id),
      INDEX idx_results_mission_score (mission_id, score DESC, elapsed_sec ASC),
      CONSTRAINT fk_results_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
      CONSTRAINT fk_results_mission FOREIGN KEY (mission_id) REFERENCES missions (id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);

  const [col] = await query(
    `
    SELECT COUNT(*) AS n
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'game_sessions'
      AND COLUMN_NAME = 'user_id'
    `
  );

  if (Number(col.n) === 0) {
    await query(`ALTER TABLE game_sessions ADD COLUMN user_id INT UNSIGNED DEFAULT NULL AFTER mission_id`);
    await query(`ALTER TABLE game_sessions ADD INDEX idx_sessions_user (user_id)`);
    try {
      await query(
        `ALTER TABLE game_sessions ADD CONSTRAINT fk_session_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL`
      );
    } catch {
      /* FK may already exist */
    }
  }
}

async function ensureMissionTimingColumns() {
  const [sessElapsed] = await query(
    `
    SELECT COUNT(*) AS n FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'game_sessions' AND COLUMN_NAME = 'elapsed_sec'
    `
  );
  if (Number(sessElapsed.n) === 0) {
    await query(`ALTER TABLE game_sessions ADD COLUMN elapsed_sec INT UNSIGNED DEFAULT NULL AFTER score`);
    await query(
      `ALTER TABLE game_sessions ADD COLUMN completed_at TIMESTAMP NULL DEFAULT NULL AFTER elapsed_sec`
    );
  }

  const [resElapsed] = await query(
    `
    SELECT COUNT(*) AS n FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'mission_results' AND COLUMN_NAME = 'elapsed_sec'
    `
  );
  if (Number(resElapsed.n) === 0) {
    await query(
      `ALTER TABLE mission_results ADD COLUMN elapsed_sec INT UNSIGNED DEFAULT NULL AFTER score`
    );
  }

  await query(
    `
    UPDATE mission_results mr
    INNER JOIN game_sessions gs ON gs.id = mr.session_id
    SET mr.elapsed_sec = COALESCE(
      gs.elapsed_sec,
      GREATEST(1, TIMESTAMPDIFF(SECOND, gs.created_at, gs.completed_at))
    )
    WHERE mr.elapsed_sec IS NULL
      AND gs.status = 'complete'
      AND gs.completed_at IS NOT NULL
    `
  );
}

async function ensurePasswordResetTokens() {
  await query(`
    CREATE TABLE IF NOT EXISTS password_reset_tokens (
      id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      user_id INT UNSIGNED NOT NULL,
      token_hash CHAR(64) NOT NULL,
      expires_at TIMESTAMP NOT NULL,
      used_at TIMESTAMP NULL DEFAULT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_reset_token_hash (token_hash),
      INDEX idx_reset_user (user_id),
      CONSTRAINT fk_reset_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);
}

export async function ensureSchema() {
  await ensureUsersAndLeaderboard();
  await ensureMissionTimingColumns();
  await ensurePasswordResetTokens();
  const [col] = await query(
    `
    SELECT COUNT(*) AS n
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'answer_options'
      AND COLUMN_NAME = 'location_id'
    `
  );

  if (Number(col.n) === 0) {
    await query(
      `ALTER TABLE answer_options ADD COLUMN location_id INT UNSIGNED DEFAULT NULL AFTER clue_id`
    );
    try {
      await query(
        `ALTER TABLE answer_options ADD CONSTRAINT fk_options_location FOREIGN KEY (location_id) REFERENCES locations (id)`
      );
    } catch {
      // FK may already exist under another name
    }
  }

  await query(
    `
    UPDATE answer_options ao
    INNER JOIN locations l ON l.name = ao.option_text
    SET ao.location_id = l.id
    WHERE ao.location_id IS NULL
    `
  );

  await query(
    `
    UPDATE answer_options ao
    INNER JOIN locations l ON l.slug = 'antioch-syria'
    SET ao.location_id = l.id
    WHERE ao.option_text = 'Antioch' AND ao.location_id IS NULL
    `
  );

  await query(
    `
    INSERT INTO locations (name, slug, latitude, longitude, region)
    SELECT name, slug, latitude, longitude, region FROM (
      SELECT 'Tarsus' AS name, 'tarsus' AS slug, 36.917500 AS latitude, 34.892500 AS longitude, 'Cilicia' AS region
      UNION ALL SELECT 'Caesarea', 'caesarea', 32.500000, 34.890000, 'Coast'
      UNION ALL SELECT 'Athens', 'athens', 37.983800, 23.727500, 'Greece'
      UNION ALL SELECT 'Rome', 'rome', 41.902800, 12.496400, 'Italy'
      UNION ALL SELECT 'Philippi', 'philippi', 41.011700, 24.287000, 'Macedonia'
      UNION ALL SELECT 'Thessalonica', 'thessalonica', 40.640100, 22.944400, 'Greece'
      UNION ALL SELECT 'Tyre', 'tyre', 33.270500, 35.203300, 'Phoenicia'
      UNION ALL SELECT 'Samaria', 'samaria', 32.213300, 35.162200, 'Samaria'
      UNION ALL SELECT 'Egypt', 'egypt', 30.044400, 31.235700, 'Egypt'
      UNION ALL SELECT 'Jordan River', 'jordan-river', 31.839000, 35.545000, 'Jordan'
      UNION ALL SELECT 'Dead Sea', 'dead-sea', 31.500000, 35.500000, 'Judah'
      UNION ALL SELECT 'Mount Sinai', 'mount-sinai', 28.539200, 33.975000, 'Sinai'
    ) AS src
    WHERE NOT EXISTS (SELECT 1 FROM locations l WHERE l.slug = src.slug)
    `
  );

  await query(
    `
    UPDATE answer_options ao
    INNER JOIN locations l ON l.name = ao.option_text
    SET ao.location_id = l.id
    WHERE ao.location_id IS NULL
    `
  );

  await query(
    `
    UPDATE answer_options ao
    INNER JOIN locations l ON l.slug = 'antioch-syria'
    SET ao.location_id = l.id
    WHERE ao.option_text = 'Antioch' AND ao.location_id IS NULL
    `
  );
}
