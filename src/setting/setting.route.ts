import { Router } from "express";
import profileRouter from "./profile/profile.route.js";
const settingRouter = Router();

settingRouter.use('/profile',profileRouter)

export default settingRouter