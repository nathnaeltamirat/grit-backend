import { Router } from "express";
import { authorizeUser } from "../../middlewares/auth.middleware.js";
import { updateProfileHandler } from "./profile.controller.js";
const profileRouter = Router();
profileRouter.patch('/',authorizeUser,updateProfileHandler);
export default profileRouter