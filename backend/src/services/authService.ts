import { db } from '../config/db';
import { signToken } from '../utils/jwt';
import { User } from '../types';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { RowDataPacket } from 'mysql2/promise';

interface RegisterInput {
  name: string;
  email: string;
  password: string;
  role: 'mahasiswa' | 'dosen' | 'organisasi' | 'admin';
  faculty?: string;
}

interface LoginInput {
  email: string;
  password: string;
}

// ─── REGISTER ────────────────────────────────────────────────────────────────
export async function registerUser(input: RegisterInput): Promise<{ token: string; user: Omit<User, 'password'> }> {
  const { name, email, password, role, faculty } = input;

  // 1. Check if email already exists
  const [existingUsers] = await db.execute<RowDataPacket[]>(
    'SELECT id FROM users WHERE email = ?',
    [email]
  );

  if (existingUsers.length > 0) {
    const err = new Error('Email sudah terdaftar') as Error & { statusCode: number; code: string };
    err.statusCode = 409;
    err.code = 'EMAIL_EXISTS';
    throw err;
  }

  // 2. Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  const userId = uuidv4();

  // 3. Insert into users table
  await db.execute(
    'INSERT INTO users (id, name, email, password, role, faculty) VALUES (?, ?, ?, ?, ?, ?)',
    [userId, name, email, hashedPassword, role, faculty || null]
  );

  // 4. Get the created user
  const [rows] = await db.execute<RowDataPacket[]>(
    'SELECT id, name, email, role, faculty, created_at FROM users WHERE id = ?',
    [userId]
  );
  const userData = rows[0] as Omit<User, 'password'>;

  // 5. Generate JWT
  const token = signToken({ userId, email, role });

  return { token, user: userData };
}

// ─── LOGIN ───────────────────────────────────────────────────────────────────
export async function loginUser(input: LoginInput): Promise<{ token: string; user: Omit<User, 'password'> }> {
  const { email, password } = input;

  // 1. Get user by email
  const [rows] = await db.execute<RowDataPacket[]>(
    'SELECT * FROM users WHERE email = ?',
    [email]
  );

  if (rows.length === 0) {
    const err = new Error('Email atau password salah') as Error & { statusCode: number; code: string };
    err.statusCode = 401;
    err.code = 'INVALID_CREDENTIALS';
    throw err;
  }

  const user = rows[0] as User & { password?: string };

  // 2. Verify password
  const isMatch = await bcrypt.compare(password, user.password || '');
  if (!isMatch) {
    const err = new Error('Email atau password salah') as Error & { statusCode: number; code: string };
    err.statusCode = 401;
    err.code = 'INVALID_CREDENTIALS';
    throw err;
  }

  // Remove password from user object
  delete user.password;

  // 3. Generate custom JWT
  const token = signToken({ userId: user.id, email: user.email, role: user.role });

  return { token, user: user as Omit<User, 'password'> };
}

// ─── GET ME ──────────────────────────────────────────────────────────────────
export async function getUserById(userId: string): Promise<Omit<User, 'password'>> {
  const [rows] = await db.execute<RowDataPacket[]>(
    'SELECT id, name, email, role, faculty, created_at FROM users WHERE id = ?',
    [userId]
  );

  if (rows.length === 0) {
    const err = new Error('User tidak ditemukan') as Error & { statusCode: number; code: string };
    err.statusCode = 404;
    err.code = 'USER_NOT_FOUND';
    throw err;
  }

  return rows[0] as Omit<User, 'password'>;
}
