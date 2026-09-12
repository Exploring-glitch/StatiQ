import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Fail closed: never sign/verify with a guessable fallback in production.
const getJwtSecret = () => {
  if (process.env.JWT_SECRET) return process.env.JWT_SECRET;
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET must be set in production — refusing to sign/verify tokens');
  }
  console.warn('[auth] JWT_SECRET not set — using insecure dev fallback. Set JWT_SECRET in server/.env.');
  return 'dev-secret';
};

export const signToken = (id) =>
  jwt.sign({ id }, getJwtSecret(), {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

// Wraps async route handlers so errors reach the error middleware
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// Requires a valid Bearer token; attaches req.user
export const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) {
    res.status(401);
    throw new Error('Not authorized — no token');
  }
  // Resolved outside try so a missing production secret fails loudly (500),
  // not as a generic 401.
  const secret = getJwtSecret();
  try {
    const decoded = jwt.verify(token, secret);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      res.status(401);
      throw new Error('Not authorized — user not found');
    }
    req.user = user;
    next();
  } catch {
    res.status(401);
    throw new Error('Not authorized — invalid token');
  }
});

// Requires one of the given roles (use after protect)
export const authorize =
  (...roles) =>
  (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403);
      throw new Error('Forbidden — insufficient role');
    }
    next();
  };
