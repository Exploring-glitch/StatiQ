import multer from 'multer';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const uploadsDir = path.join(__dirname, '..', 'uploads');
export const avatarsDir = path.join(uploadsDir, 'avatars');
export const resumesDir = path.join(uploadsDir, 'resumes');
export const logosDir = path.join(uploadsDir, 'logos');
for (const d of [uploadsDir, avatarsDir, resumesDir, logosDir]) fs.mkdirSync(d, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, file, cb) => {
    if (file.fieldname === 'avatar') return cb(null, avatarsDir);
    if (file.fieldname === 'logo') return cb(null, logosDir);
    return cb(null, resumesDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const prefix = file.fieldname === 'avatar' ? 'avatar' : file.fieldname === 'logo' ? 'logo' : 'resume';
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

export const logoUpload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB
  fileFilter: checkFile(AVATAR_ALLOWED, 'Only JPG, PNG or WebP images are allowed'),
});

// Magic-byte check — mimetype/extension are client-supplied and trivially
// spoofed, so verify the file header matches its claimed type. Returns
// null when OK, otherwise an error message. Caller deletes the file on fail.
export const verifyUploadMagic = (filePath, ext) => {
  let fd;
  try {
    fd = fs.openSync(filePath, 'r');
    const buf = Buffer.alloc(12);
    const n = fs.readSync(fd, buf, 0, 12, 0);
    if (ext === '.pdf') {
      if (n < 4 || buf.subarray(0, 4).toString() !== '%PDF') return 'File content does not look like a PDF';
    } else if (ext === '.doc') {
      // OLE compound document: D0 CF 11 E0 (old .doc); new .doc saved as
      // OOXML is a ZIP — accept PK too.
      const ole = n >= 4 && buf[0] === 0xd0 && buf[1] === 0xcf && buf[2] === 0x11 && buf[3] === 0xe0;
      const zip = n >= 2 && buf[0] === 0x50 && buf[1] === 0x4b;
      if (!ole && !zip) return 'File content does not look like a Word document';
    } else if (ext === '.docx') {
      if (n < 2 || buf[0] !== 0x50 || buf[1] !== 0x4b) return 'File content does not look like a Word document';
    } else if (ext === '.jpg' || ext === '.jpeg') {
      if (n < 2 || buf[0] !== 0xff || buf[1] !== 0xd8) return 'File content does not look like a JPEG image';
    } else if (ext === '.png') {
      const sig = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
      if (n < 8 || !sig.every((b, i) => buf[i] === b)) return 'File content does not look like a PNG image';
    } else if (ext === '.webp') {
      // RIFF....WEBP
      if (n < 12 || buf.subarray(0, 4).toString() !== 'RIFF' || buf.subarray(8, 12).toString() !== 'WEBP') {
        return 'File content does not look like a WebP image';
      }
    }
    return null;
  } catch {
    return 'Could not verify uploaded file';
  } finally {
    if (fd !== undefined) {
      try { fs.closeSync(fd); } catch { /* ignore */ }
    }
  }
};
