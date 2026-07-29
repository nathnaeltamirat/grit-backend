import express from 'express';
import errorMiddleware from './middlewares/error.middleware.js';
import authRouter from './auth/auth.route.js';

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

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/api/v1/auth', authRouter);
app.use(errorMiddleware);
export default app;
