import { Router } from 'express';
import { loginHandler, logoutHandler, registerHandler } from './auth.controller.js';
const authRouter = Router();
authRouter.post('/register', registerHandler);
authRouter.post('/login', loginHandler);
authRouter.post('/logout', logoutHandler);
export default authRouter;
