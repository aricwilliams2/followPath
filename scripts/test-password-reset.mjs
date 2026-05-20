import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { pool, query } from '../src/db.js';
import { ensureSchema } from '../src/ensureSchema.js';
import { register, login } from '../src/authService.js';
import {
  verifyEmailForPasswordReset,
  resetPasswordByEmail,
  changePassword,
} from '../src/passwordResetService.js';

const email = `reset-test-${Date.now()}@example.com`;
const username = `rst${Date.now().toString(36).slice(-5)}`;
const oldPass = 'oldpass123';
const newPass = 'newpass456';

async function main() {
  await ensureSchema();
  await register({ email, username, password: oldPass, displayName: 'Reset Test' });

  const missing = await verifyEmailForPasswordReset('nobody@example.com');
  if (missing.error !== 'EMAIL_NOT_FOUND') throw new Error('Expected EMAIL_NOT_FOUND');

  const found = await verifyEmailForPasswordReset(email);
  if (!found.ok) throw new Error('Email should be found');

  const reset = await resetPasswordByEmail({ email, password: newPass });
  if (reset.error) throw new Error(reset.error);

  const badOld = await login({ email, password: oldPass });
  if (!badOld.error) throw new Error('Old password should not work');

  const good = await login({ email, password: newPass });
  if (good.error) throw new Error('New password login failed');

  const user = await query(`SELECT id FROM users WHERE email = :email`, { email });
  const ch = await changePassword({
    userId: user[0].id,
    currentPassword: newPass,
    newPassword: 'another789',
  });
  if (ch.error) throw new Error(ch.error);

  const hash = await query(`SELECT password_hash FROM users WHERE id = :id`, { id: user[0].id });
  const ok = await bcrypt.compare('another789', hash[0].password_hash);
  if (!ok) throw new Error('changePassword did not persist');

  console.log('✅ Password reset + change-password tests passed.');
  await pool.end();
}

main().catch(async (e) => {
  console.error('❌', e.message);
  try {
    await pool.end();
  } catch {
    //
  }
  process.exit(1);
});
