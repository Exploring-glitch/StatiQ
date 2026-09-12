import multer from 'multer';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const uploadsDir = path.join(__dirname, '..', 'uploads');
fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const prefix = file.fieldname === 'avatar' ? 'avatar' : 'resume';
    // Random suffix so filenames can't be guessed/enumerated.
    const rand = crypto.randomBytes(8).toString('hex');
    const safe = `${prefix}-${req.user._id}-${Date.now()}-${rand}${ext}`;
    cb(null, safe);
  },
});

// Extension AND mimetype must agree — extension alone is trivially spoofed
// (e.g. a script renamed to .pdf).
const checkFile = (allowed, errMsg) => (_req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const mimes = allowed[ext];
  if (!mimes || !mimes.includes(file.mimetype)) {
    return cb(new Error(errMsg));
  }
  cb(null, true);
};

const RESUME_ALLOWED = {
  '.pdf': ['application/pdf'],
  '.doc': ['application/msword'],
  '.docx': ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
};

export const resumeUpload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: checkFile(RESUME_ALLOWED, 'Only PDF, DOC or DOCX files are allowed'),
});

const AVATAR_ALLOWED = {
  '.jpg': ['image/jpeg'],
  '.jpeg': ['image/jpeg'],
  '.png': ['image/png'],
  '.webp': ['image/webp'],
};

export const avatarUpload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB
  fileFilter: checkFile(AVATAR_ALLOWED, 'Only JPG, PNG or WebP images are allowed'),
});
