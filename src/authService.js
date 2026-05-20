import bcrypt from 'bcryptjs';
import { query } from './db.js';
import { signToken } from './authMiddleware.js';

const USERNAME_RE = /^[a-zA-Z0-9_]{3,24}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function publicUser(row) {
  return {
    id: row.id,
    email: row.email,
    username: row.username,
    displayName: row.displayName,
    createdAt: row.createdAt,
  };
}

async function loadUserById(userId) {
  const rows = await query(
    `
    SELECT id, email, username, display_name AS displayName, created_at AS createdAt
    FROM users WHERE id = :userId
    `,
    { userId }
  );
  return rows[0] || null;
}

export async function register({ email, username, password, displayName }) {
  const normalizedEmail = String(email || '')
    .trim()
    .toLowerCase();
  const normalizedUsername = String(username || '').trim();

  if (!EMAIL_RE.test(normalizedEmail)) {
    return { error: 'INVALID_EMAIL' };
  }
  if (!USERNAME_RE.test(normalizedUsername)) {
    return { error: 'INVALID_USERNAME' };
  }
  if (!password || String(password).length < 6) {
    return { error: 'WEAK_PASSWORD' };
  }

  const existing = await query(
    `SELECT id FROM users WHERE email = :email OR username = :username LIMIT 1`,
    { email: normalizedEmail, username: normalizedUsername }
  );
  if (existing.length) {
    return { error: 'ALREADY_EXISTS' };
  }

  const passwordHash = await bcrypt.hash(String(password), 10);
  const name = String(displayName || normalizedUsername).trim().slice(0, 64) || normalizedUsername;

  const result = await query(
    `
    INSERT INTO users (email, username, display_name, password_hash)
    VALUES (:email, :username, :displayName, :passwordHash)
    `,
    {
      email: normalizedEmail,
      username: normalizedUsername,
      displayName: name,
      passwordHash,
    }
  );

  const userId = result.insertId;
  const user = await loadUserById(userId);
  const token = signToken(userId);
  return { token, user: publicUser(user) };
}

export async function login({ email, password }) {
  const normalizedEmail = String(email || '')
    .trim()
    .toLowerCase();
  if (!normalizedEmail || !password) {
    return { error: 'INVALID_CREDENTIALS' };
  }

  const rows = await query(
    `
    SELECT id, email, username, display_name AS displayName, password_hash AS passwordHash,
           created_at AS createdAt
    FROM users WHERE email = :email
    LIMIT 1
    `,
    { email: normalizedEmail }
  );
  const row = rows[0];
  if (!row) {
    return { error: 'INVALID_CREDENTIALS' };
  }

  const ok = await bcrypt.compare(String(password), row.passwordHash);
  if (!ok) {
    return { error: 'INVALID_CREDENTIALS' };
  }

  const token = signToken(row.id);
  return { token, user: publicUser(row) };
}

export async function getProfile(userId) {
  const user = await loadUserById(userId);
  if (!user) return null;

  const statsRows = await query(
    `
    SELECT
      COUNT(*) AS missionsCompleted,
      COALESCE(SUM(score), 0) AS totalPoints
    FROM mission_results
    WHERE user_id = :userId
    `,
    { userId }
  );

  const bestRows = await query(
    `
    SELECT COALESCE(MAX(best_score), 0) AS bestMissionScore
    FROM (
      SELECT MAX(score) AS best_score
      FROM mission_results
      WHERE user_id = :userId
      GROUP BY mission_id
    ) t
    `,
    { userId }
  );

  const recent = await query(
    `
    SELECT mr.score, mr.elapsed_sec AS elapsedSec, mr.completed_at AS completedAt, m.title AS missionTitle, m.slug AS missionSlug
    FROM mission_results mr
    JOIN missions m ON m.id = mr.mission_id
    WHERE mr.user_id = :userId
    ORDER BY mr.completed_at DESC
    LIMIT 10
    `,
    { userId }
  );

  const stats = statsRows[0] || { missionsCompleted: 0, totalPoints: 0 };
  const best = bestRows[0] || { bestMissionScore: 0 };

  return {
    user: publicUser(user),
    stats: {
      missionsCompleted: Number(stats.missionsCompleted),
      totalPoints: Number(stats.totalPoints),
      bestMissionScore: Number(best.bestMissionScore),
    },
    recentRuns: recent.map((r) => ({
      score: Number(r.score),
      elapsedSec: r.elapsedSec != null ? Number(r.elapsedSec) : null,
      completedAt: r.completedAt,
      missionTitle: r.missionTitle,
      missionSlug: r.missionSlug,
    })),
  };
}

export async function updateProfile(userId, { displayName, username }) {
  const updates = [];
  const params = { userId };

  if (displayName !== undefined) {
    updates.push('display_name = :displayName');
    params.displayName = String(displayName).trim().slice(0, 64) || null;
  }

  if (username !== undefined) {
    const normalizedUsername = String(username).trim();
    if (!USERNAME_RE.test(normalizedUsername)) {
      return { error: 'INVALID_USERNAME' };
    }
    const taken = await query(`SELECT id FROM users WHERE username = :username AND id != :userId LIMIT 1`, {
      username: normalizedUsername,
      userId,
    });
    if (taken.length) {
      return { error: 'USERNAME_TAKEN' };
    }
    updates.push('username = :username');
    params.username = normalizedUsername;
  }

  if (!updates.length) {
    return getProfile(userId);
  }

  await query(`UPDATE users SET ${updates.join(', ')} WHERE id = :userId`, params);
  return getProfile(userId);
}
