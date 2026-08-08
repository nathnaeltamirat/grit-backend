import { Router } from 'express';
import { authorizeUser } from '../middlewares/auth.middleware.js';
import {
  createFrictionHandler,
  deleteFrictionHandler,
  getFrictionHandler,
} from './friction.controller.js';
const frictionRouter = Router();
frictionRouter.post('/', authorizeUser, createFrictionHandler);
frictionRouter.delete('/:id', authorizeUser, deleteFrictionHandler);
frictionRouter.get('/', authorizeUser, getFrictionHandler);
export default frictionRouter;
