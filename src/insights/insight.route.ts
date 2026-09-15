import { Router } from 'express';
import { authorizeUser } from '../middlewares/auth.middleware.js';
import {
  specificFrictionInsightHandler,
  timeRangeFrictionInsightHandler,
} from './insight.controller.js';
const insightRouter = Router();

insightRouter.post('/specific', authorizeUser, specificFrictionInsightHandler);
insightRouter.post(
  '/timeRange',
  authorizeUser,
  timeRangeFrictionInsightHandler,
);

export default insightRouter;
