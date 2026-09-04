import { Router } from "express";
import profileRouter from "./profiles/profile.route.js";
const settingRouter = Router();

settingRouter.use('/profile',profileRouter)

export default settingRouter