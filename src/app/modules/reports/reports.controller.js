import catchAsync from "../../shared/catchAsync.js";
import sendResponse from "../../shared/sendResponse.js";
import httpStatus from "http-status";

const getAllSalesProducts = catchAsync(async (req, res) => {
  // const result = await authService.login(req);
  const result = { products: [] };
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Sales Product ",
    data: result,
  });
});


export const reportsController = {
  getAllSalesProducts
}
