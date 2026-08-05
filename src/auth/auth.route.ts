import { Router } from 'express';
import {
  loginHandler,
  logoutHandler,
  meHandler,
  refershHandler,
  registerHandler,
} from './auth.controller.js';
import { authorizeUser } from '../middlewares/auth.middleware.js';
const authRouter = Router();
authRouter.post('/register', registerHandler);
authRouter.post('/login', loginHandler);
authRouter.post('/logout', logoutHandler);
authRouter.post('/refresh', refershHandler);
authRouter.get('/me', authorizeUser, meHandler);
export default authRouter;
