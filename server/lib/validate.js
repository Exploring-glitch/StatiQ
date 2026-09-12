import mongoose from 'mongoose';

// Escape user input before embedding it in a RegExp (prevents
// ReDoS/crashes on crafted input like `[`). Capped at 100 chars.
export const escapeRegExp = (s) =>
  String(s ?? '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&').slice(0, 100);

// False for malformed ids so handlers can 404 instead of throwing a 500.
export const isValidObjectId = (id) => mongoose.isValidObjectId(id);
