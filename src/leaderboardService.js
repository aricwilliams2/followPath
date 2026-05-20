import { query } from './db.js';

/**
 * Best run per user per mission (MySQL 5.7+): highest score, then fastest time.
 */
const BEST_RUNS_SUBQUERY = `
  SELECT
    mr.user_id,
    mr.mission_id,
    mr.score,
    MIN(mr.elapsed_sec) AS elapsed_sec,
    MAX(mr.completed_at) AS completed_at
  FROM mission_results mr
  INNER JOIN (
    SELECT user_id, mission_id, MAX(score) AS best_score
    FROM mission_results
    GROUP BY user_id, mission_id
  ) peak ON peak.user_id = mr.user_id
    AND peak.mission_id = mr.mission_id
    AND mr.score = peak.best_score
  GROUP BY mr.user_id, mr.mission_id, mr.score
`;

export async function recordMissionResult({ userId, missionId, sessionId, score, elapsedSec }) {
  if (!userId || !missionId) return;
  await query(
    `
    INSERT INTO mission_results (user_id, mission_id, session_id, score, elapsed_sec)
    VALUES (:userId, :missionId, :sessionId, :score, :elapsedSec)
    `,
    {
      userId,
      missionId,
      sessionId,
      score: Number(score),
      elapsedSec: elapsedSec != null ? Number(elapsedSec) : null,
    }
  );
}

function mapElapsed(row) {
  return row.elapsedSec != null ? Number(row.elapsedSec) : null;
}

function mapEntry(r, rank) {
  return {
    rank,
    userId: r.userId,
    username: r.username,
    displayName: r.displayName || r.username,
    missionId: r.missionId != null ? Number(r.missionId) : undefined,
    missionTitle: r.missionTitle || null,
    points: Number(r.points),
    elapsedSec: mapElapsed(r),
    completedAt: r.completedAt,
  };
}

/** Missions that have at least one saved score (for default tab / empty-state hints). */
export async function listMissionsWithScores() {
  const rows = await query(
    `
    SELECT
      mr.mission_id AS missionId,
      m.slug AS missionSlug,
      m.title AS missionTitle,
      COUNT(*) AS runCount,
      COUNT(DISTINCT mr.user_id) AS playerCount,
      MAX(mr.completed_at) AS lastScoreAt
    FROM mission_results mr
    JOIN missions m ON m.id = mr.mission_id
    GROUP BY mr.mission_id, m.slug, m.title
    ORDER BY lastScoreAt DESC
    `
  );
  return rows.map((r) => ({
    missionId: Number(r.missionId),
    missionSlug: r.missionSlug,
    missionTitle: r.missionTitle,
    runCount: Number(r.runCount),
    playerCount: Number(r.playerCount),
  }));
}

export async function getLeaderboard({ missionId, limit = 50 } = {}) {
  const cap = Math.min(Math.max(Number(limit) || 50, 1), 100);

  if (missionId) {
    const mid = Number(missionId);
    const [missionRow] = await query(`SELECT title FROM missions WHERE id = :mid`, { mid });
    const [counts] = await query(
      `
      SELECT
        COUNT(*) AS runCount,
        COUNT(DISTINCT user_id) AS playerCount
      FROM mission_results
      WHERE mission_id = :missionId
      `,
      { missionId: mid }
    );
    const rows = await query(
      `
      SELECT
        u.id AS userId,
        u.username,
        u.display_name AS displayName,
        best.score AS points,
        best.elapsed_sec AS elapsedSec,
        best.completed_at AS completedAt
      FROM (${BEST_RUNS_SUBQUERY}) best
      JOIN users u ON u.id = best.user_id
      WHERE best.mission_id = :missionId
      ORDER BY best.score DESC, COALESCE(best.elapsed_sec, 999999) ASC, best.completed_at ASC
      LIMIT ${cap}
      `,
      { missionId: mid }
    );
    const runCount = Number(counts?.runCount ?? 0);
    const playerCount = Number(counts?.playerCount ?? 0);
    return {
      scope: 'mission',
      missionId: mid,
      missionTitle: missionRow?.title || null,
      runCount,
      playerCount,
      entries: rows.map((r, i) => mapEntry({ ...r, missionId: mid, missionTitle: missionRow?.title }, i + 1)),
    };
  }

  // One row per user per mission (best run each) — never sum scores across missions.
  const rows = await query(
    `
    SELECT
      u.id AS userId,
      u.username,
      u.display_name AS displayName,
      best.mission_id AS missionId,
      m.title AS missionTitle,
      best.score AS points,
      best.elapsed_sec AS elapsedSec,
      best.completed_at AS completedAt
    FROM (${BEST_RUNS_SUBQUERY}) best
    JOIN users u ON u.id = best.user_id
    JOIN missions m ON m.id = best.mission_id
    ORDER BY best.score DESC, COALESCE(best.elapsed_sec, 999999) ASC, best.completed_at ASC
    LIMIT ${cap}
    `
  );

  return {
    scope: 'global',
    entries: rows.map((r, i) => mapEntry(r, i + 1)),
  };
}
