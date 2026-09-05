import { Router } from 'express';
import { authorizeUser } from '../../middlewares/auth.middleware.js';
import { updatePasswordhandler, updateProfileHandler } from './profile.controller.js';
const profileRouter = Router();
profileRouter.patch('/', authorizeUser, updateProfileHandler);
profileRouter.patch('/password', authorizeUser, updatePasswordhandler);
export default profileRouter;
