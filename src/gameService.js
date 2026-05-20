import { v4 as uuidv4 } from 'uuid';
import { query } from './db.js';
import { recordMissionResult } from './leaderboardService.js';

export async function listModes() {
  return query('SELECT id, slug, name, description FROM game_modes ORDER BY id');
}

export async function listMissions({ modeSlug } = {}) {
  if (modeSlug) {
    return query(
      `
      SELECT m.id, m.slug, m.title, m.intro_text, m.difficulty, gm.slug AS mode_slug, gm.name AS mode_name
      FROM missions m
      JOIN game_modes gm ON gm.id = m.mode_id
      WHERE gm.slug = :modeSlug
      ORDER BY m.id
      `,
      { modeSlug }
    );
  }
  return query(
    `
    SELECT m.id, m.slug, m.title, m.intro_text, m.difficulty, gm.slug AS mode_slug, gm.name AS mode_name
    FROM missions m
    JOIN game_modes gm ON gm.id = m.mode_id
    ORDER BY m.id
    `
  );
}

export async function getMissionById(missionId) {
  const rows = await query(
    `
    SELECT m.id, m.slug, m.title, m.intro_text, m.difficulty, gm.slug AS mode_slug, gm.name AS mode_name
    FROM missions m
    JOIN game_modes gm ON gm.id = m.mode_id
    WHERE m.id = :missionId
    `,
    { missionId }
  );
  return rows[0] || null;
}

async function loadMissionStops(missionId) {
  return query(
    `
    SELECT
      ms.step_order AS stepOrder,
      l.id AS locationId,
      l.name AS locationName,
      l.slug AS locationSlug,
      l.latitude AS lat,
      l.longitude AS lng,
      l.region,
      c.id AS clueId,
      c.question AS clueQuestion,
      c.scripture_ref AS scriptureRef,
      c.clue_type AS clueType,
      c.is_finale AS isFinale,
      c.time_limit_sec AS timeLimitSec,
      (
        SELECT ao.sort_order
        FROM answer_options ao
        WHERE ao.clue_id = c.id AND ao.is_correct = 1
        ORDER BY ao.id
        LIMIT 1
      ) AS correctSortOrder
    FROM mission_stops ms
    JOIN locations l ON l.id = ms.location_id
    JOIN clues c ON c.id = ms.clue_id
    WHERE ms.mission_id = :missionId
    ORDER BY ms.step_order
    `,
    { missionId }
  );
}

async function loadAnswerOptions(clueId) {
  return query(
    `
    SELECT
      ao.id,
      ao.option_text AS text,
      ao.sort_order AS sortOrder,
      l.latitude AS lat,
      l.longitude AS lng
    FROM answer_options ao
    LEFT JOIN locations l ON l.id = ao.location_id
    WHERE ao.clue_id = :clueId
    ORDER BY ao.sort_order, ao.id
    `,
    { clueId }
  );
}

function buildPublicView(stops, currentStep, status, score) {
  const total = stops.length;
  const done = status === 'complete';
  const revealedStops = done ? stops : stops.slice(0, Math.min(currentStep + 1, total));
  const current = !done && currentStep < total ? stops[currentStep] : null;

  return {
    totalStops: total,
    currentStep: Number(currentStep),
    score: Number(score),
    done,
    revealedStops: revealedStops.map((s) => {
      const sortOrder = Number(s.correctSortOrder);
      const answerLabel =
        Number.isFinite(sortOrder) && sortOrder >= 0 && sortOrder <= 25
          ? String.fromCharCode(65 + sortOrder)
          : '?';
      return {
        stepOrder: Number(s.stepOrder),
        answerLabel,
        location: {
          id: s.locationId,
          name: s.locationName,
          slug: s.locationSlug,
          lat: Number(s.lat),
          lng: Number(s.lng),
          region: s.region,
        },
      };
    }),
    currentClue: current
      ? {
          id: current.clueId,
          question: current.clueQuestion,
          scriptureRef: current.scriptureRef,
          clueType: current.clueType,
          isFinale: Boolean(current.isFinale),
          timeLimitSec: current.timeLimitSec,
          options: [],
        }
      : null,
  };
}

function sessionTimingFields(row) {
  const startedAt = row.createdAt;
  const elapsedSec = row.elapsedSec != null ? Number(row.elapsedSec) : null;
  return {
    startedAt: startedAt ? new Date(startedAt).toISOString() : null,
    elapsedSec,
  };
}

export async function getSessionState(sessionId) {
  const rows = await query(
    `
    SELECT gs.id, gs.mission_id AS missionId, gs.current_step AS currentStep, gs.score, gs.status,
           gs.created_at AS createdAt, gs.completed_at AS completedAt, gs.elapsed_sec AS elapsedSec,
           m.title AS missionTitle, m.intro_text AS introText, m.slug AS missionSlug
    FROM game_sessions gs
    JOIN missions m ON m.id = gs.mission_id
    WHERE gs.id = :sessionId
    `,
    { sessionId }
  );
  if (!rows.length) return null;

  const row = rows[0];
  const stops = await loadMissionStops(row.missionId);
  const view = buildPublicView(stops, row.currentStep, row.status, row.score);
  const timing = sessionTimingFields(row);

  if (view.currentClue) {
    const options = await loadAnswerOptions(view.currentClue.id);
    view.currentClue.options = options.map((o) => {
      const opt = { id: o.id, text: o.text, sortOrder: Number(o.sortOrder) };
      if (o.lat != null && o.lng != null) {
        opt.lat = Number(o.lat);
        opt.lng = Number(o.lng);
      }
      return opt;
    });
  }

  return {
    sessionId: row.id,
    mission: {
      id: row.missionId,
      title: row.missionTitle,
      introText: row.introText,
      slug: row.missionSlug,
    },
    ...timing,
    ...view,
  };
}

export async function startSession(missionId, userId = null) {
  const missions = await query('SELECT id FROM missions WHERE id = :missionId', { missionId });
  if (!missions.length) return null;

  const stops = await loadMissionStops(missionId);
  if (!stops.length) return null;

  const id = uuidv4();
  await query(
    `
    INSERT INTO game_sessions (id, mission_id, user_id, current_step, score, status)
    VALUES (:id, :missionId, :userId, 0, 0, 'active')
    `,
    { id, missionId, userId: userId || null }
  );

  return getSessionState(id);
}

export async function submitAnswer(sessionId, clueId, answerOptionId, authUserId = null) {
  const sessions = await query(
    `
    SELECT id, mission_id AS missionId, user_id AS userId, current_step AS currentStep, score, status,
           created_at AS createdAt, completed_at AS completedAt, elapsed_sec AS elapsedSec
    FROM game_sessions WHERE id = :sessionId
    `,
    { sessionId }
  );
  if (!sessions.length) return { error: 'SESSION_NOT_FOUND' };
  const s = sessions[0];
  if (s.status === 'complete') return { error: 'SESSION_COMPLETE' };

  const sessionUserId = s.userId != null ? Number(s.userId) : null;
  const effectiveUserId = sessionUserId ?? (authUserId != null ? Number(authUserId) : null);

  const stops = await loadMissionStops(s.missionId);
  const currentStop = stops[s.currentStep];
  if (!currentStop || Number(clueId) !== Number(currentStop.clueId)) {
    return { error: 'CLUE_MISMATCH' };
  }

  const options = await query(
    `SELECT id, is_correct AS isCorrect FROM answer_options WHERE id = :answerOptionId AND clue_id = :clueId`,
    { answerOptionId, clueId }
  );
  if (!options.length) return { error: 'INVALID_OPTION' };

  const ok = Boolean(options[0].isCorrect);
  const points = ok ? 100 + (currentStop.isFinale ? 50 : 0) : 0;

  let nextStep = s.currentStep;
  let score = s.score;
  let status = s.status;

  if (ok) {
    score += points;
    if (s.currentStep >= stops.length - 1) {
      status = 'complete';
      nextStep = s.currentStep;
    } else {
      nextStep = s.currentStep + 1;
    }
    let elapsedSec = null;
    if (status === 'complete') {
      const elapsedRows = await query(
        `
        SELECT GREATEST(1, TIMESTAMPDIFF(SECOND, created_at, NOW())) AS elapsedSec
        FROM game_sessions WHERE id = :sessionId
        `,
        { sessionId }
      );
      elapsedSec = Number(elapsedRows[0]?.elapsedSec) || 1;

      await query(
        `
        UPDATE game_sessions
        SET current_step = :nextStep, score = :score, status = :status,
            user_id = COALESCE(user_id, :effectiveUserId),
            elapsed_sec = :elapsedSec, completed_at = NOW()
        WHERE id = :sessionId
        `,
        { nextStep, score, status, elapsedSec, sessionId, effectiveUserId: effectiveUserId ?? null }
      );
    } else if (effectiveUserId && !sessionUserId) {
      await query(
        `
        UPDATE game_sessions
        SET current_step = :nextStep, score = :score, status = :status, user_id = :effectiveUserId
        WHERE id = :sessionId
        `,
        { nextStep, score, status, sessionId, effectiveUserId }
      );
    } else {
      await query(
        `UPDATE game_sessions SET current_step = :nextStep, score = :score, status = :status WHERE id = :sessionId`,
        { nextStep, score, status, sessionId }
      );
    }

    if (status === 'complete' && effectiveUserId) {
      await recordMissionResult({
        userId: effectiveUserId,
        missionId: s.missionId,
        sessionId,
        score,
        elapsedSec,
      });
    }
  }

  const state = await getSessionState(sessionId);
  return {
    correct: ok,
    pointsAwarded: ok ? points : 0,
    scoreSaved: ok && status === 'complete' && Boolean(effectiveUserId),
    ...state,
  };
}
