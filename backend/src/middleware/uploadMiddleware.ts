import multer from 'multer';
import path from 'path';
import fs from 'fs';

// ─── Ensure uploads directory exists ─────────────────────────────────────────
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ─── Room image storage configuration ──────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `room-${uniqueSuffix}${ext}`);
  },
});

// ─── Room image file filter ───────────────────────────────────────────────────
const fileFilter = (
  _req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Format file tidak valid. Hanya JPEG, PNG, WEBP, dan GIF yang diizinkan.'));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB max
  },
});

// ─── Proposal PDF storage configuration ────────────────────────────────────────
const proposalStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `proposal-${uniqueSuffix}${ext}`);
  },
});

// ─── Proposal PDF file filter ──────────────────────────────────────────────────
const proposalFileFilter = (
  _req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Format file tidak valid. Hanya file PDF yang diizinkan.'));
  }
};

export const uploadProposal = multer({
  storage: proposalStorage,
  fileFilter: proposalFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB max
  },
});
