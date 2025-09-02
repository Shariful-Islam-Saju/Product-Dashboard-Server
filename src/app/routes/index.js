import { Router } from "express";
// import { userRouter } from "../modules/user/user.route.js";
import { authRouter } from "../modules/auth/auth.route.js";

const router = Router();

const moduleRoutes = [
  // { path: "/user", route: userRouter },
  { path: "/auth", route: authRouter },
];

moduleRoutes.forEach(({ path, route }) => router.use(path, route));

export default router;
