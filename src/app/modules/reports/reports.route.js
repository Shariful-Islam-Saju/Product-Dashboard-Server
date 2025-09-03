import { Router } from "express";
import { reportsController } from "./reports.controller.js";
import auth from "../../middlewares/auth.js";

const router = Router();

router.get("/products/sales-report", auth(), reportsController.salesReport);// this api is give me the details of the how much product is sells in a date

export const reportsRouter = router;
