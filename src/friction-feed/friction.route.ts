import { Router } from 'express';
import { authorizeUser } from '../middlewares/auth.middleware.js';
import {
  createFrictionHandler,
  deleteFrictionHandler,
  getFrictionHandler,
  updateFrictionHandler,
} from './friction.controller.js';
const frictionRouter = Router();
frictionRouter.post('/', authorizeUser, createFrictionHandler);
frictionRouter.get('/', authorizeUser, getFrictionHandler);


frictionRouter.delete('/:id', authorizeUser, deleteFrictionHandler);
frictionRouter.patch('/:id', authorizeUser, updateFrictionHandler);
export default frictionRouter;
