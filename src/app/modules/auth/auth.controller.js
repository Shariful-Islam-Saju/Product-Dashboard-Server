import catchAsync from "../../shared/catchAsync.js";
import sendResponse from "../../shared/sendResponse.js";
import httpStatus from "http-status";
import { authService } from "./auth.service.js";
// import config from "../../config/index.js";

const login = catchAsync(async (req, res) => {
  const result = await authService.login(req);
  const { refreshToken, accessToken, ...other } = result;

  res.cookie("accessToken", accessToken, {
    httpOnly: true, // inaccessible from JavaScript
    secure: process.env.NODE_ENV === "production", // HTTPS only in production
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // cross-site in prod, lax in dev
    maxAge: Number(process.env.ACCESS_TOKEN_EXPIRES_IN) * 1000, // 5 min
    path: "/",
  });
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true, // inaccessible from JavaScript
    secure: process.env.NODE_ENV === "production", // HTTPS only in production
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // cross-site in prod, lax in dev
    maxAge: Number(process.env.REFRESH_TOKEN_EXPIRES_IN) * 1000, // 5 min
    path: "/", // refresh token only sent here
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User logged in successfully!",
    data: { ...other, accessToken },
  });
});

const logout = catchAsync(async (req, res) => {
  // Clear refresh token cookie
  res.clearCookie("refreshToken", {
    httpOnly: true, // inaccessible from JavaScript
    secure: process.env.NODE_ENV === "production", // HTTPS only in production
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // cross-site in prod, lax in dev
    path: "/", // clear for all paths
  });

  // Clear access token cookie
  res.clearCookie("accessToken", {
    httpOnly: true, // inaccessible from JavaScript
    secure: process.env.NODE_ENV === "production", // HTTPS only in production
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // cross-site in prod, lax in dev
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
    httpOnly: true, // inaccessible from JavaScript
    secure: process.env.NODE_ENV === "production", // HTTPS only in production
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // cross-site in prod, lax in dev
    maxAge: Number(process.env.ACCESS_TOKEN_EXPIRES_IN) * 1000, // 5 min
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
