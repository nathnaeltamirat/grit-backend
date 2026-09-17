import { Router } from 'express';
import { authorizeUser } from '../middlewares/auth.middleware.js';
import {
  deleteInsightHandler,
  getInsightHandler,
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
insightRouter.get('/',authorizeUser,getInsightHandler);
export default insightRouter;
