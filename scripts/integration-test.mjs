/**
 * End-to-end: register → start session (authed) → complete mission → mission_results row.
 * Run from apps/api: node scripts/integration-test.mjs
 */
import 'dotenv/config';
import { query, pool } from '../src/db.js';
import { ensureSchema } from '../src/ensureSchema.js';
import { register, login } from '../src/authService.js';
import { startSession, submitAnswer, getSessionState } from '../src/gameService.js';

const TEST_EMAIL = `ftp-test-${Date.now()}@example.com`;
const TEST_USER = `ftptest${Date.now().toString(36).slice(-6)}`;

async function getCorrectOptionId(clueId) {
  const rows = await query(
    `SELECT id FROM answer_options WHERE clue_id = :clueId AND is_correct = 1 LIMIT 1`,
    { clueId }
  );
  return rows[0]?.id;
}

async function completeMission(sessionId, authUserId = null) {
  let state = await getSessionState(sessionId);
  let steps = 0;
  const maxSteps = 30;

  while (!state.done && steps < maxSteps) {
    const clue = state.currentClue;
    if (!clue) throw new Error('No current clue while mission incomplete');
    const optionId = await getCorrectOptionId(clue.id);
    if (!optionId) throw new Error(`No correct option for clue ${clue.id}`);

    const res = await submitAnswer(sessionId, clue.id, optionId, authUserId);
    if (res.error) throw new Error(`submitAnswer failed: ${res.error}`);
    state = res;
    steps += 1;
  }

  if (!state.done) throw new Error('Mission did not complete');
  return state;
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

async function main() {
  console.log('Ensuring schema…');
  await ensureSchema();

  console.log('Registering test user…');
  const reg = await register({
    email: TEST_EMAIL,
    username: TEST_USER,
    password: 'testpass123',
    displayName: 'FTP Test',
  });
  if (reg.error) throw new Error(`register: ${reg.error}`);
  const userId = reg.user.id;
  console.log('  userId', userId);

  const missions = await query(`SELECT id, slug, title FROM missions ORDER BY id`);
  assert(missions.length > 0, 'No missions in DB — run npm run seed');

  const shortMission =
    missions.find((m) => m.slug === 'prophet-joppa-intro') || missions[0];
  console.log('Mission:', shortMission.title, `(id ${shortMission.id})`);

  const before = await query(
    `SELECT COUNT(*) AS n FROM mission_results WHERE user_id = :userId`,
    { userId }
  );
  const beforeN = Number(before[0].n);

  console.log('Starting session WITH userId (simulates signed-in start)…');
  const session = await startSession(shortMission.id, userId);
  assert(session?.sessionId, 'startSession returned no sessionId');

  const sessRow = await query(
    `SELECT user_id AS userId FROM game_sessions WHERE id = :id`,
    { id: session.sessionId }
  );
  console.log('  game_sessions.user_id =', sessRow[0]?.userId);
  assert(Number(sessRow[0]?.userId) === userId, 'Session missing user_id on start');

  console.log('Completing mission…');
  const done = await completeMission(session.sessionId);
  console.log('  score', done.score, 'elapsedSec', done.elapsedSec, 'scoreSaved', done.scoreSaved);
  assert(done.scoreSaved === true, 'scoreSaved should be true when user_id set');

  const after = await query(
    `
    SELECT id, score, elapsed_sec, session_id
    FROM mission_results
    WHERE user_id = :userId AND mission_id = :missionId
    ORDER BY id DESC
    LIMIT 5
    `,
    { userId, missionId: shortMission.id }
  );
  console.log('mission_results rows:', after);

  assert(after.length > beforeN, 'No new mission_results row inserted');
  const latest = after[0];
  assert(Number(latest.score) === Number(done.score), 'Saved score mismatch');
  assert(latest.session_id === session.sessionId, 'session_id not linked');
  assert(Number(latest.elapsed_sec) < 600, `elapsed_sec looks wrong: ${latest.elapsed_sec}`);

  console.log('\nTesting guest session (no userId) — should NOT insert…');
  const guest = await startSession(shortMission.id, null);
  const guestDone = await completeMission(guest.sessionId);
  assert(!guestDone.scoreSaved, 'Guest should not set scoreSaved');
  const guestRows = await query(
    `SELECT COUNT(*) AS n FROM mission_results WHERE session_id = :sid`,
    { sid: guest.sessionId }
  );
  assert(Number(guestRows[0].n) === 0, 'Guest session should not create mission_results');

  console.log('\nTesting late auth attach on answer…');
  const late = await startSession(shortMission.id, null);
  const lateDone = await completeMission(late.sessionId, userId);
  assert(lateDone.scoreSaved === true, 'Late auth should save score');

  const lateRows = await query(
    `SELECT COUNT(*) AS n FROM mission_results WHERE session_id = :sid`,
    { sid: late.sessionId }
  );
  assert(Number(lateRows[0].n) === 1, 'Late auth session should have mission_results');

  console.log('\n✅ All integration tests passed.');
  await pool.end();
}

main().catch(async (e) => {
  console.error('\n❌ Test failed:', e.message);
  console.error(e);
  try {
    await pool.end();
  } catch {
    //
  }
  process.exit(1);
});
