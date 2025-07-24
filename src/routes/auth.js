import { Router } from "express";
import { loginUser } from "../controllers/auth/login.controller.js";
import { logoutUser } from "../controllers/auth/logout.controller.js";

const authRouter = Router();

// 🔐 Registration route
// authRouter.post("/register", registerUser);

// 🔐 Login route
authRouter.post("/login", loginUser);

// Logout route
authRouter.post("/logout", logoutUser);

// Verify jst
export default authRouter;
