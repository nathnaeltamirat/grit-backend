import { Router } from 'express';
import { authorizeUser } from '../middlewares/auth.middleware.js';
import {
  createFrictionHandler,
  deleteFrictionHandler,
} from './friction.controller.js';
const frictionRouter = Router();
frictionRouter.post('/', authorizeUser, createFrictionHandler);
frictionRouter.delete('/:id', authorizeUser, deleteFrictionHandler);
export default frictionRouter;
