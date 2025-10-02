import { Router } from "express";
import { salesController } from "./sales.controller.js";
import auth from "../../middlewares/auth.js";

const router = Router();

router.get("/report", auth(), salesController.allSalesReport);
router.get("/items", auth(), salesController.getAllSalesItems);
router.get("/customer/:id", auth(), salesController.getSalesReportByProductID);

export const salesRouter = router;
