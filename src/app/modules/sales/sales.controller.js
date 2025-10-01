import catchAsync from "../../shared/catchAsync.js";
import sendResponse from "../../shared/sendResponse.js";
import httpStatus from "http-status";
import { salesService } from "./sales.service.js";

const allSalesReport = catchAsync(async (req, res) => {
  const result = await salesService.allSalesReport(req);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Sales report retrieved successfully.",
    data: result,
  });
});

const getSalesReportByProductID = catchAsync(async (req, res) => {
  const result = await salesService.getSalesReportByProductID(req);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Product sales report retrieved successfully.",
    data: result,
  });
});

const getAllSalesItems = catchAsync(async (req, res) => {
  const result = await salesService.getAllSalesItems(req);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "All sales items retrieved successfully.",
    data: result,
  });
});

export const salesController = {
  allSalesReport,
  getAllSalesItems,
  getSalesReportByProductID,
};
