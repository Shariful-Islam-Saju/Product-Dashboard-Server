import { Router } from "express";
import { getAllSalesProducts } from "../../controllers/products/getAllProducts.controller.js";

const productRouter = Router();

// 🔐 Apply authentication middleware to all product routes

// 📦 GET all sales products (main dashboard route)
productRouter.get("/", getAllSalesProducts);

export default productRouter;
