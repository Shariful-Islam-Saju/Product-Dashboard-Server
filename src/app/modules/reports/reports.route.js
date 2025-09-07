import { Router } from "express";
import { reportsController } from "./reports.controller.js";
import auth from "../../middlewares/auth.js";

const router = Router();

router.get(
  "/products/sales-report",
  auth(),
  reportsController.allProductsSalesReport
);
router.get("/products", auth(), reportsController.getAllProducts);
router.get("/product/:id", auth(), reportsController.getProductSalesReportByID);

export const reportsRouter = router;
