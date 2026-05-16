import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import projectRoutes from './routes/projects';
import taskRoutes from './routes/tasks';
import userRoutes from './routes/users';
import messageRoutes from './routes/messages';
import notificationRoutes from './routes/notifications';
import prisma from './utils/prisma';
import { auth } from './middleware/auth';

// Load environment variables
dotenv.config();

const app: Application = express();

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedPatterns = [
      /^http:\/\/localhost:\d+$/,
      /^http:\/\/127\.0\.0\.1:\d+$/,
      /\.vercel\.app$/,
      /\.railway\.app$/
    ];

    const isAllowed = allowedPatterns.some(pattern => pattern.test(origin));
    
    if (isAllowed) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);

// Activity Log Route
app.get('/api/activityLog', auth, async (req: any, res: Response) => {
  try {
    const activity = await prisma.activityLog.findMany({
      orderBy: { timestamp: 'desc' },
      take: 50
    });
    res.json(activity);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching activity log' });
  }
});

app.post('/api/activityLog', auth, async (req: any, res: Response) => {
  try {
    const { action, targetName, projectId } = req.body;
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    
    const saved = await prisma.activityLog.create({
      data: {
        userId: req.userId,
        userName: user ? user.name : 'Unknown User',
        action,
        targetName,
        projectId
      }
    });
    res.status(201).json(saved);
  } catch (error) {
    res.status(500).json({ message: 'Error creating activity log' });
  }
});

// Health Check
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', message: 'TaskOrbit API is running' });
});

// 404 Handler for API routes
app.use('/api', (req: Request, res: Response) => {
  res.status(404).json({ error: 'Not Found' });
});

import path from 'path';

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../client/dist')));

  app.get('*', (req: Request, res: Response) => {
    res.sendFile(path.resolve(__dirname, '../../client', 'dist', 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.send('API is running...');
  });
}

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

export default app;
