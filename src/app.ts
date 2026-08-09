import express, { NextFunction, Request, Response } from 'express';
import errorMiddleware from './middlewares/error.middleware.js';
import authRouter from './auth/auth.route.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import frictionRouter from './friction-feed/friction.route.js';
const app = express();

app.use((req, res, next) => {
  res.set({
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    Pragma: 'no-cache',
    Expires: '0',
    'Surrogate-Control': 'no-store',
  });
  next();
});
const allowedOrigins = ['http://localhost:5173','https://grit-frontend-8kk7.vercel.app'];
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.get('/health', (req: Request, res: Response, next: NextFunction) => {
  return res.status(200).json({
    success: true,
    message: 'The app is live',
  });
});
app.use('/api/v1/auth', authRouter);
app.use("/api/v1/friction",frictionRouter)
app.use(errorMiddleware);
export default app;
