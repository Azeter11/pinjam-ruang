import { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import { AuthenticatedRequest } from '../types';
import { successResponse, errorResponse } from '../utils/response';

// ─── Upload image and return its public URL ───────────────────────────────────
export async function uploadImage(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.file) {
      errorResponse(res, 'Tidak ada file yang diunggah', 400, { code: 'NO_FILE' });
      return;
    }

    // Build the public URL for the uploaded image
    const protocol = req.protocol;
    const host = req.get('host');
    const imageUrl = `${protocol}://${host}/uploads/${req.file.filename}`;

    successResponse(res, { url: imageUrl }, 'Gambar berhasil diunggah');
  } catch (error) {
    next(error);
  }
}

// ─── Delete an old uploaded image by filename ─────────────────────────────────
export function deleteUploadedFile(filename: string): void {
  try {
    const filePath = path.join(process.cwd(), 'uploads', filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch {
    // silently ignore deletion errors
  }
}
