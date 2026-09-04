import { Router } from "express";
import { authorizeUser } from "../middlewares/auth.middleware.js";
import { specificFrictionInsightHandler } from "./insights.controller.js";
const insightRouter = Router();

insightRouter.post("/specific",authorizeUser,specificFrictionInsightHandler)

export default insightRouter;