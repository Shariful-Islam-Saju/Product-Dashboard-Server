import { Router } from "express";
import { protectedRoute } from "../middlewares/protected-routes.js";
import { getAllSalesProducts } from "../controllers/products/getAllProducts.controller.js";

const productRouter = Router();

// 🔐 Apply authentication middleware to all product routes
productRouter.use(protectedRoute);

// 📦 GET all sales products (main dashboard route)
productRouter.get("/", getAllSalesProducts);

export default productRouter;
