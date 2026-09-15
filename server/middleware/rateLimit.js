import rateLimit from 'express-rate-limit';

// Brute-force guard for login/register.
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many attempts — please try again in a few minutes.' },
});

// Flood guard for authenticated write endpoints (job posts, applications).
export const writeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests — please slow down.' },
});

// Flood guard for public read endpoints (job browsing) — prevents
// scraping / ReDoS probing from a single IP.
export const publicLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests — please slow down.' },
});

// Simple in-memory per-account login throttle (complements the per-IP
// authLimiter): slows credential-stuffing against a single email without
// a DB/Redis dependency. Resets on success.
const loginAttempts = new Map(); // email -> { count, firstAt }
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_MAX = 10;

export const loginAccountGate = (req, res, next) => {
  const email = String(req.body?.email || '').toLowerCase().trim();
  if (!email) return next();
  const now = Date.now();
  const rec = loginAttempts.get(email);
  if (rec && now - rec.firstAt > LOGIN_WINDOW_MS) loginAttempts.delete(email);
  const cur = loginAttempts.get(email);
  if (cur && cur.count >= LOGIN_MAX) {
    return res.status(429).json({ message: 'Too many attempts for this account — try again in a few minutes.' });
  }
  next();
};

export const recordLoginFailure = (email) => {
  const key = String(email || '').toLowerCase().trim();
  if (!key) return;
  const now = Date.now();
  const rec = loginAttempts.get(key);
  if (!rec || now - rec.firstAt > LOGIN_WINDOW_MS) {
    loginAttempts.set(key, { count: 1, firstAt: now });
  } else {
    rec.count += 1;
  }
};

export const clearLoginFailures = (email) => {
  loginAttempts.delete(String(email || '').toLowerCase().trim());
};
