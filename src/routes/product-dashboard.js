import { Router } from "express";
import { protectedRoutes } from "../middlewares/protected-routes.js";
import { getAllSalesProducts } from "../controllers/getAllProducts.controller.js";

const productRouter = Router();

// 🔐 Apply authentication middleware to all product routes
productRouter.use(protectedRoutes);

// 📦 GET all sales products (main dashboard route)
productRouter.get("/", getAllSalesProducts);

export default productRouter;
