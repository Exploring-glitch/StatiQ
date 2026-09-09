import multer from 'multer';
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
    const safe = `${prefix}-${req.user._id}-${Date.now()}${ext}`;
    cb(null, safe);
  },
});

const RESUME_ALLOWED = new Set(['.pdf', '.doc', '.docx']);

export const resumeUpload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!RESUME_ALLOWED.has(ext)) {
      return cb(new Error('Only PDF, DOC or DOCX files are allowed'));
    }
    cb(null, true);
  },
});

const AVATAR_ALLOWED = new Set(['.jpg', '.jpeg', '.png', '.webp']);

export const avatarUpload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!AVATAR_ALLOWED.has(ext)) {
      return cb(new Error('Only JPG, PNG or WebP images are allowed'));
    }
    cb(null, true);
  },
});
