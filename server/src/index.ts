import { createServer } from 'http';
import { Server } from 'socket.io';
import app from './app';
import prisma from './utils/prisma';

const PORT = parseInt(process.env.PORT || '5000', 10);

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: [
      "http://localhost:5173", 
      "http://localhost:5174", 
      "http://localhost:5175", 
      "http://localhost:5176",
      "http://localhost:5177",
      "http://localhost:5178",
      "http://localhost:5179",
      "http://localhost:5180"
    ],
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Make io accessible in routes
app.set('io', io);

io.on('connection', (socket) => {
  console.log(`[Socket] User connected: ${socket.id}`);

  socket.on('join-room', (roomId: string) => {
    socket.join(roomId);
    console.log(`[Socket] ${socket.id} joined room: ${roomId}`);
  });

  socket.on('disconnect', () => {
    console.log(`[Socket] User disconnected: ${socket.id}`);
  });
});

// Graceful Shutdown Logic
const shutdown = (signal: string) => {
  console.log(`\n[Server] ${signal} received — shutting down gracefully`);
  httpServer.close(async () => {
    console.log('[Server] HTTP server closed');
    await prisma.$disconnect();
    console.log('[DB] Prisma disconnected');
    process.exit(0);
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('unhandledRejection', (err: Error) => {
  console.error(`[Server] Unhandled Rejection: ${err.message}`);
  httpServer.close(() => process.exit(1));
});

const start = async () => {
  httpServer.listen(PORT, () => {
    console.log(`[Server] Running on port ${PORT}`);
  }).on('error', (err: any) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`[Server] Port ${PORT} is in use.`);
      process.exit(1);
    } else {
      console.error('[Server] Startup error:', err);
    }
  });
};

start();
