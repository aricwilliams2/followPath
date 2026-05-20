import bcrypt from 'bcryptjs';
import { query } from './db.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeEmail(email) {
  return String(email || '')
    .trim()
    .toLowerCase();
}

export function validatePassword(password) {
  if (!password || String(password).length < 6) {
    return { error: 'WEAK_PASSWORD' };
  }
  return null;
}

/** Check that an account exists for this email (for forgot-password step 1). */
export async function verifyEmailForPasswordReset(email) {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail || !EMAIL_RE.test(normalizedEmail)) {
    return { error: 'INVALID_EMAIL' };
  }

  const users = await query(`SELECT id, email FROM users WHERE email = :email LIMIT 1`, {
    email: normalizedEmail,
  });
  if (!users.length) {
    return { error: 'EMAIL_NOT_FOUND' };
  }

  return { ok: true, email: users[0].email };
}

/** Set a new password when email matches an account (forgot-password step 2). */
export async function resetPasswordByEmail({ email, password }) {
  const weak = validatePassword(password);
  if (weak) return weak;

  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) {
    return { error: 'INVALID_EMAIL' };
  }

  const users = await query(`SELECT id FROM users WHERE email = :email LIMIT 1`, {
    email: normalizedEmail,
  });
  if (!users.length) {
    return { error: 'EMAIL_NOT_FOUND' };
  }

  const passwordHash = await bcrypt.hash(String(password), 10);
  await query(`UPDATE users SET password_hash = :passwordHash WHERE id = :userId`, {
    passwordHash,
    userId: users[0].id,
  });

  return { ok: true };
}

export async function changePassword({ userId, currentPassword, newPassword }) {
  const weak = validatePassword(newPassword);
  if (weak) return weak;

  if (!currentPassword || !newPassword) {
    return { error: 'INVALID_PAYLOAD' };
  }

  const rows = await query(`SELECT password_hash AS passwordHash FROM users WHERE id = :userId`, { userId });
  const row = rows[0];
  if (!row) {
    return { error: 'NOT_FOUND' };
  }

  const ok = await bcrypt.compare(String(currentPassword), row.passwordHash);
  if (!ok) {
    return { error: 'WRONG_PASSWORD' };
  }

  const passwordHash = await bcrypt.hash(String(newPassword), 10);
  await query(`UPDATE users SET password_hash = :passwordHash WHERE id = :userId`, { passwordHash, userId });
  return { ok: true };
}
