import { Router } from 'express';
import { authorizeUser } from '../middlewares/auth.middleware.js';
import { createFrictionHandler } from './friction.controller.js';
const frictionRouter = Router();
frictionRouter.post('/', authorizeUser, createFrictionHandler);

export default frictionRouter;
