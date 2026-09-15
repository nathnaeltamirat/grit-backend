import { Router } from "express";
import profileRouter from "./profile/profile.route.js";
import { updateAIAPIKeyHandler } from "./setting.controller.js";
import { authorizeUser } from "../middlewares/auth.middleware.js";
const settingRouter = Router();

settingRouter.use('/profile',profileRouter)
settingRouter.patch('/api-key',authorizeUser,updateAIAPIKeyHandler)
export default settingRouter