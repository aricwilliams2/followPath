import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-change-me-in-production';

export function signToken(userId) {
  return jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: '30d' });
}

export function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

/** Sets req.userId when a valid Bearer token is present. */
export function optionalAuth(req, _res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    req.userId = null;
    next();
    return;
  }
  try {
    const payload = verifyToken(header.slice(7));
    req.userId = Number(payload.sub) || null;
  } catch {
    req.userId = null;
  }
  next();
}

export function requireAuth(req, res, next) {
  optionalAuth(req, res, () => {
    if (!req.userId) {
      res.status(401).json({ error: 'UNAUTHORIZED' });
      return;
    }
    next();
  });
}
