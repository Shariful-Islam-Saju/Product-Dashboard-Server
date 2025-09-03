import { Router } from "express";
import { authController } from "./auth.controller.js";

const router = Router();

router.post("/login", authController.login);
router.get("/refresh-token", authController.refreshToken);
router.post("/logout", authController.logout);

export const authRouter = router;

