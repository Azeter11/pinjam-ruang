import { Server as SocketServer, Socket } from 'socket.io';
import { verifyToken } from '../utils/jwt';
import { JwtPayload } from '../types';

interface AuthSocket extends Socket {
  user?: JwtPayload;
}

export function initSocketHandlers(io: SocketServer): void {
  // ─── JWT Authentication Middleware ─────────────────────────────────────────
  io.use((socket: AuthSocket, next) => {
    const token = socket.handshake.auth?.token as string | undefined;

    if (!token) {
      return next(new Error('Authentication error: token diperlukan'));
    }

    try {
      const decoded = verifyToken(token);
      socket.user = decoded;
      next();
    } catch {
      next(new Error('Authentication error: token tidak valid atau kadaluarsa'));
    }
  });

  // ─── Connection Handler ─────────────────────────────────────────────────────
  io.on('connection', (socket: AuthSocket) => {
    const user = socket.user!;
    console.log(`[Socket] User connected: ${user.email} (${user.role}) — socket: ${socket.id}`);

    // Join personal room
    socket.join(`user_${user.userId}`);
    console.log(`[Socket] ${user.email} joined room: user_${user.userId}`);

    // Admin joins admin room
    if (user.role === 'admin') {
      socket.join('admin_room');
      console.log(`[Socket] Admin ${user.email} joined admin_room`);
    }

    // ─── Client Events ────────────────────────────────────────────────────────

    // Ping/pong for connection health check
    socket.on('ping', () => {
      socket.emit('pong', { timestamp: new Date().toISOString() });
    });

    // Admin: manually broadcast room status change
    socket.on('admin:room_status_change', (data: { room_id: string; status: string }) => {
      if (user.role !== 'admin') return;
      io.emit('room_status_changed', {
        room_id: data.room_id,
        status: data.status,
        message: 'Status ruangan telah diubah oleh admin',
        timestamp: new Date().toISOString(),
      });
    });

    // ─── Disconnect ───────────────────────────────────────────────────────────
    socket.on('disconnect', (reason) => {
      console.log(`[Socket] User disconnected: ${user.email} — reason: ${reason}`);
    });

    socket.on('error', (err) => {
      console.error(`[Socket] Error for ${user.email}:`, err);
    });
  });
}
