import { Router } from "express";
import { registerUser } from "../controllers/auth/register.controller.js ";
import { loginUser } from "../controllers/auth/login.controller.js";

const authRouter = Router();

// 🔐 Registration route
authRouter.post("/register", registerUser);

// 🔐 Login route
authRouter.post("/login", loginUser);

export default authRouter;
