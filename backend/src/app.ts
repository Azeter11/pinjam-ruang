import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';

import { env } from './config/env';
import routes from './routes';
import uploadRoutes from './routes/uploadRoutes';
import { errorMiddleware } from './middleware/errorMiddleware';
import { initSocketHandlers } from './socket/socketHandler';
import { setSocketIO } from './services/bookingService';

// ─── Express App ──────────────────────────────────────────────────────────────
const app = express();
const httpServer = createServer(app);

// ─── Socket.IO ────────────────────────────────────────────────────────────────
const io = new SocketServer(httpServer, {
  cors: {
    origin: env.CLIENT_URL,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Inject io instance into booking service
setSocketIO(io);

// Initialize socket handlers
initSocketHandlers(io);

// ─── Global Middleware ────────────────────────────────────────────────────────
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

if (env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Static Files (Uploaded Images) ──────────────────────────────────────────
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/upload', uploadRoutes);
app.use('/api', routes);

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint tidak ditemukan',
    data: null,
    error: { code: 'NOT_FOUND' },
  });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use(errorMiddleware);

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = parseInt(env.PORT, 10);

httpServer.listen(PORT, () => {
  console.log(`\n🚀 Pinjam Ruang API Server`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`🌐 HTTP  → http://localhost:${PORT}`);
  console.log(`⚡ WS    → ws://localhost:${PORT}`);
  console.log(`📁 Env   → ${env.NODE_ENV}`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
});

export { app, httpServer, io };
