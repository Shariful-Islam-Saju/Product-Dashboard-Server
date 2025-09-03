import catchAsync from "../../shared/catchAsync.js";
import sendResponse from "../../shared/sendResponse.js";
import httpStatus from "http-status";
import { authService } from "./auth.service.js";
import config from "../../config/index.js";

const login = catchAsync(async (req, res) => {
  const result = await authService.login(req);
  const { refreshToken, ...other } = result;

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // only HTTPS in prod
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict", // or "none" if your client is on a different domain
    maxAge: Number(config.jwt.refresh_token_expires_in) * 1000,
    path: "/api/v1/auth/refresh-token", // refresh token only sent here
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User logged in successfully!",
    data: other,
  });
});

const logout = catchAsync(async (req, res) => {
  // Clear refresh token cookie
  res.clearCookie("refreshToken", {
    httpOnly: true, // JS cannot access
    secure: process.env.NODE_ENV === "production", // HTTPS only in prod
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    path: "/api/v1/auth/refresh-token", // clear for all paths
  });

  // Clear access token cookie
  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    path: "/", // clear for all paths
  });

  // Optional: If you are storing refresh tokens server-side (DB or Redis),
  // you can invalidate it here for extra security.

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User logged out successfully.",
    data: null,
  });
});

const refreshToken = catchAsync(async (req, res) => {
  const { refreshToken } = req.cookies;
  const result = await authService.refreshToken(refreshToken);
  const { accessToken } = result;

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // only HTTPS in prod
    sameSite: "strict",
    maxAge: Number(config.jwt.access_token_expires_in) * 1000, // 5 min
    path: "/",
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Access token generated successfully!",
    data: { accessToken },
  });
});

export const authController = {
  login,
  refreshToken,
  logout,
};
