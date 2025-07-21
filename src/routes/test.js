import { Router } from "express";
import { test } from "../controllers/test.controller.js";
const testRouter = Router();

// 🔐 Apply authentication middleware to all product routes
testRouter.get('/',test);

export default testRouter;
