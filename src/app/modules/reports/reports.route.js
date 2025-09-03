import { Router } from "express";
import { reportsController } from "./reports.controller.js";
import auth from "../../middlewares/auth.js";

const router = Router();

router.get("/products-sold", auth(), reportsController.getAllSalesProducts);// this api is give me the details of the how much product is sells in a date

export const reportsRouter = router;
