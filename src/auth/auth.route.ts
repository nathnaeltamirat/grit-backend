import { Router } from 'express';
import {
  loginHandler,
  logoutHandler,
  refershHandler,
  registerHandler,
} from './auth.controller.js';
const authRouter = Router();
authRouter.post('/register', registerHandler);
authRouter.post('/login', loginHandler);
authRouter.post('/logout', logoutHandler);
authRouter.post('/refresh', refershHandler);
export default authRouter;
