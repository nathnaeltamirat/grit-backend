import { Router } from "express";
import { registerHandler } from "./auth.controller.js";
const authRouter = Router();
authRouter.post("/register",registerHandler)

export default authRouter