import catchAsync from "../../shared/catchAsync.js";
import sendResponse from "../../shared/sendResponse.js";
import httpStatus from "http-status";
import { reportsService } from "./reports.service.js";

const salesReport = catchAsync(async (req, res) => {
  const result = await reportsService.salesReport(req);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Sales report retrieved successfully.",
    data: result,
  });
});

export const reportsController = {
  salesReport,
};
