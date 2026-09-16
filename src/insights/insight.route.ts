import { Router } from 'express';
import { authorizeUser } from '../middlewares/auth.middleware.js';
import {
  deleteInsightHandler,
  specificFrictionInsightHandler,
  timeRangeFrictionInsightHandler,
  updateInsightHandler,
} from './insight.controller.js';
const insightRouter = Router();

insightRouter.post('/specific', authorizeUser, specificFrictionInsightHandler);
insightRouter.post(
  '/timeRange',
  authorizeUser,
  timeRangeFrictionInsightHandler,
);

insightRouter.patch('/:id', authorizeUser, updateInsightHandler);
insightRouter.delete('/:id', authorizeUser, deleteInsightHandler);
export default insightRouter;
