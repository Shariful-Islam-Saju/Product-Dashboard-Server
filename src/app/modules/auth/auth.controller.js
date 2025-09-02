import catchAsync from "../../shared/catchAsync.js";
import sendResponse from "../../shared/sendResponse.js";
import httpStatus from "http-status";
import { authService } from "./auth.service.js";

const login = catchAsync(async (req, res) => {
  const result = await authService.login(req);
  const { refreshToken, ...other } = result;

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // only HTTPS in prod
    sameSite: "none",
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    path: "/",
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User logged in successfully!",
    data: other,
  });
});

const logout = catchAsync(async (req, res) => {
  // Clear the refresh token cookie
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // only HTTPS in prod
    sameSite: "none",
    path: "/",
  });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "User logged out successfully!",
    data: null,
  });
});

const refreshToken = catchAsync(async (req, res) => {
  const { refreshToken } = req.cookies;

  // const result = await authService.refreshToken(refreshToken);
  // const { accessToken } = result;

  // res.cookie("accessToken", accessToken, {
  //   httpOnly: true,
  //   secure: process.env.NODE_ENV === "production", // only HTTPS in prod
  //   sameSite: "strict",
  //   maxAge: 5 * 60 * 1000, // 5 min
  //   path: "/",
  // });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Access token generated successfully!",
    data: { message: "success" },
  });
});

export const authController = {
  login,
  refreshToken,
  logout,
};
