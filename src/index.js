import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import {
  listModes,
  listMissions,
  getMissionById,
  startSession,
  getSessionState,
  submitAnswer,
} from './gameService.js';
import { register, login, getProfile, updateProfile } from './authService.js';
import {
  verifyEmailForPasswordReset,
  resetPasswordByEmail,
  changePassword,
} from './passwordResetService.js';
import { getLeaderboard, listMissionsWithScores } from './leaderboardService.js';
import { optionalAuth, requireAuth } from './authMiddleware.js';
import { ensureSchema } from './ensureSchema.js';

const app = express();
const PORT = Number(process.env.PORT || 3001);

app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
  })
);
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.post('/api/auth/register', async (req, res, next) => {
  try {
    const result = await register(req.body || {});
    if (result.error === 'INVALID_EMAIL') {
      res.status(400).json({ error: result.error, message: 'Enter a valid email address.' });
      return;
    }
    if (result.error === 'INVALID_USERNAME') {
      res.status(400).json({
        error: result.error,
        message: 'Username must be 3–24 characters (letters, numbers, underscore).',
      });
      return;
    }
    if (result.error === 'WEAK_PASSWORD') {
      res.status(400).json({ error: result.error, message: 'Password must be at least 6 characters.' });
      return;
    }
    if (result.error === 'ALREADY_EXISTS') {
      res.status(409).json({ error: result.error, message: 'Email or username already in use.' });
      return;
    }
    res.status(201).json(result);
  } catch (e) {
    next(e);
  }
});

app.post('/api/auth/login', async (req, res, next) => {
  try {
    const result = await login(req.body || {});
    if (result.error === 'INVALID_CREDENTIALS') {
      res.status(401).json({ error: result.error, message: 'Invalid email or password.' });
      return;
    }
    res.json(result);
  } catch (e) {
    next(e);
  }
});

app.get('/api/auth/me', requireAuth, async (req, res, next) => {
  try {
    const profile = await getProfile(req.userId);
    if (!profile) {
      res.status(404).json({ error: 'NOT_FOUND' });
      return;
    }
    res.json(profile);
  } catch (e) {
    next(e);
  }
});

app.post('/api/auth/forgot-password/verify-email', async (req, res, next) => {
  try {
    const result = await verifyEmailForPasswordReset(req.body?.email);
    if (result.error === 'INVALID_EMAIL') {
      res.status(400).json({ error: result.error, message: 'Enter a valid email address.' });
      return;
    }
    if (result.error === 'EMAIL_NOT_FOUND') {
      res.status(404).json({
        error: result.error,
        message: 'No account found with that email. Check the spelling or create an account.',
      });
      return;
    }
    res.json({ ok: true, email: result.email });
  } catch (e) {
    next(e);
  }
});

app.post('/api/auth/forgot-password/reset', async (req, res, next) => {
  try {
    const result = await resetPasswordByEmail({
      email: req.body?.email,
      password: req.body?.password,
    });
    if (result.error === 'WEAK_PASSWORD') {
      res.status(400).json({ error: result.error, message: 'Password must be at least 6 characters.' });
      return;
    }
    if (result.error === 'INVALID_EMAIL') {
      res.status(400).json({ error: result.error, message: 'Enter a valid email address.' });
      return;
    }
    if (result.error === 'EMAIL_NOT_FOUND') {
      res.status(404).json({ error: result.error, message: 'No account found with that email.' });
      return;
    }
    res.json({ message: 'Password updated. You can sign in with your new password.' });
  } catch (e) {
    next(e);
  }
});

app.post('/api/auth/change-password', requireAuth, async (req, res, next) => {
  try {
    const result = await changePassword({
      userId: req.userId,
      currentPassword: req.body?.currentPassword,
      newPassword: req.body?.newPassword,
    });
    if (result.error === 'WEAK_PASSWORD') {
      res.status(400).json({ error: result.error, message: 'Password must be at least 6 characters.' });
      return;
    }
    if (result.error === 'WRONG_PASSWORD') {
      res.status(401).json({ error: result.error, message: 'Current password is incorrect.' });
      return;
    }
    if (result.error === 'INVALID_PAYLOAD') {
      res.status(400).json({ error: result.error, message: 'Current and new password are required.' });
      return;
    }
    res.json({ message: 'Password updated.' });
  } catch (e) {
    next(e);
  }
});

app.patch('/api/auth/profile', requireAuth, async (req, res, next) => {
  try {
    const result = await updateProfile(req.userId, req.body || {});
    if (result?.error === 'INVALID_USERNAME') {
      res.status(400).json({ error: result.error, message: 'Invalid username format.' });
      return;
    }
    if (result?.error === 'USERNAME_TAKEN') {
      res.status(409).json({ error: result.error, message: 'Username already taken.' });
      return;
    }
    res.json(result);
  } catch (e) {
    next(e);
  }
});

app.get('/api/leaderboard/missions-with-scores', async (_req, res, next) => {
  try {
    res.json(await listMissionsWithScores());
  } catch (e) {
    next(e);
  }
});

app.get('/api/leaderboard', async (req, res, next) => {
  try {
    const missionId = req.query.missionId ? Number(req.query.missionId) : undefined;
    const limit = req.query.limit ? Number(req.query.limit) : 50;
    res.json(await getLeaderboard({ missionId, limit }));
  } catch (e) {
    next(e);
  }
});

app.get('/api/modes', async (_req, res, next) => {
  try {
    res.json(await listModes());
  } catch (e) {
    next(e);
  }
});

app.get('/api/missions', async (req, res, next) => {
  try {
    const modeSlug = req.query.mode ? String(req.query.mode) : undefined;
    res.json(await listMissions({ modeSlug }));
  } catch (e) {
    next(e);
  }
});

app.get('/api/missions/:missionId', async (req, res, next) => {
  try {
    const missionId = Number(req.params.missionId);
    if (!missionId || Number.isNaN(missionId)) {
      res.status(400).json({ error: 'INVALID_MISSION' });
      return;
    }
    const mission = await getMissionById(missionId);
    if (!mission) {
      res.status(404).json({ error: 'NOT_FOUND' });
      return;
    }
    res.json(mission);
  } catch (e) {
    next(e);
  }
});

app.post('/api/sessions', optionalAuth, async (req, res, next) => {
  try {
    const missionId = Number(req.body?.missionId);
    if (!missionId || Number.isNaN(missionId)) {
      res.status(400).json({ error: 'INVALID_MISSION' });
      return;
    }
    const state = await startSession(missionId, req.userId);
    if (!state) {
      res.status(404).json({ error: 'MISSION_NOT_AVAILABLE' });
      return;
    }
    res.status(201).json(state);
  } catch (e) {
    next(e);
  }
});

app.get('/api/sessions/:sessionId', async (req, res, next) => {
  try {
    const state = await getSessionState(req.params.sessionId);
    if (!state) {
      res.status(404).json({ error: 'SESSION_NOT_FOUND' });
      return;
    }
    res.json(state);
  } catch (e) {
    next(e);
  }
});

app.post('/api/sessions/:sessionId/answer', optionalAuth, async (req, res, next) => {
  try {
    const clueId = Number(req.body?.clueId);
    const answerOptionId = Number(req.body?.answerOptionId);
    if (!clueId || !answerOptionId || Number.isNaN(clueId) || Number.isNaN(answerOptionId)) {
      res.status(400).json({ error: 'INVALID_PAYLOAD' });
      return;
    }
    const result = await submitAnswer(req.params.sessionId, clueId, answerOptionId, req.userId);
    if (result.error === 'SESSION_NOT_FOUND') {
      res.status(404).json(result);
      return;
    }
    if (result.error === 'SESSION_COMPLETE' || result.error === 'CLUE_MISMATCH') {
      res.status(409).json(result);
      return;
    }
    if (result.error === 'INVALID_OPTION') {
      res.status(400).json(result);
      return;
    }
    res.json(result);
  } catch (e) {
    next(e);
  }
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'SERVER_ERROR', message: err.message });
});

function assertDatabaseConfig() {
  const host = process.env.DB_HOST || '127.0.0.1';
  const isLocal = host === '127.0.0.1' || host === 'localhost';
  if (process.env.RENDER && isLocal) {
    console.error(
      'Database not configured for Render. In the Render dashboard → Environment, set:\n' +
        '  DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME\n' +
        '(from TiDB Cloud, db4free, etc. — not 127.0.0.1)\n' +
        '  DB_SSL=true if your host requires SSL\n' +
        'Then run npm run setup-db locally once against that database.'
    );
    process.exit(1);
  }
}

async function main() {
  assertDatabaseConfig();
  await ensureSchema();
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Follow the Path API listening on port ${PORT}`);
  });
}

main().catch((err) => {
  console.error('Failed to start API:', err);
  process.exit(1);
});
