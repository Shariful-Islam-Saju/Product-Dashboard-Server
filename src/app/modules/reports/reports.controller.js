import catchAsync from "../../shared/catchAsync.js";
import sendResponse from "../../shared/sendResponse.js";
import httpStatus from "http-status";
import { reportsService } from "./reports.service.js";

const allProductsSalesReport = catchAsync(async (req, res) => {
  const result = await reportsService.allProductsSalesReport(req);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Sales report retrieved successfully.",
    data: result,
  });
});


const getProductSalesReportByID = catchAsync(async (req, res) => {
  const result = await reportsService.getProductSalesReportByID(req);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Product report retrieved successfully.",
    data: result,
  });
});

const getAllProducts = catchAsync(async (req, res) => {
  const result = await reportsService.getAllProducts(req);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "All products data retrieved successfully.",
    data: result,
  });
});


export const reportsController = {
  allProductsSalesReport,
  getAllProducts,
  getProductSalesReportByID,
};
