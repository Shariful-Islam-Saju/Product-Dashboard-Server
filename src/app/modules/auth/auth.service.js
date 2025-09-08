// import config from "../../config/index.js";
import AppError from "../../errors/AppError.js";
import jwtHelpers from "../../helpers/jwtHelpers.js";
import prisma from "../../shared/prisma.js";
import httpStatus from "http-status";
const login = async (req, res) => {
  const { username, mobile } = req.body;

  // Validate input
  if (!username || !mobile) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Username and mobile are required."
    );
  }

  // Find user
  const user = await prisma.db_users.findFirst({
    where: { username, mobile },
    select: {
      id: true,
      username: true,
      first_name: true,
      last_name: true,
      mobile: true,
      email: true,
      profile_picture: true,
    },
  });

  if (!user) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Invalid username or mobile.");
  }

  // 4️⃣ Generate new access token
  const accessToken = jwtHelpers.generateToken(
    user,
    process.env.ACCESS_TOKEN_SECRET,
    Number(process.env.ACCESS_TOKEN_EXPIRES_IN)
  );

  const refreshToken = jwtHelpers.generateToken(
    user,
    process.env.REFRESH_TOKEN_SECRET,
    Number(process.env.REFRESH_TOKEN_EXPIRES_IN)
  );
  // Return only refresh token
  return { refreshToken, accessToken, user };
};

const refreshToken = async (token) => {
  let decodedData;
  try {
    // 1️⃣ Verify the refresh token
    decodedData = jwtHelpers.verifyToken(
      token,
      process.env.REFRESH_TOKEN_SECRET
    );
  } catch (err) {
    // 401 Unauthorized: token invalid or expired
    throw new AppError(httpStatus.UNAUTHORIZED, "Invalid refresh token");
  }

  // 2️⃣ Check if user still exists
  const user = await prisma.db_users.findUnique({
    where: { id: Number(decodedData.id) },
    select: {
      id: true,
      username: true,
      first_name: true,
      last_name: true,
      mobile: true,
      email: true,
      profile_picture: true,
    },
  });

  if (!user) {
    // 404 Not Found: user removed
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  // 4️⃣ Generate new access token
  const accessToken = jwtHelpers.generateToken(
    user,
    process.env.ACCESS_TOKEN_SECRET,
    Number(process.env.ACCESS_TOKEN_EXPIRES_IN)
  );

  // 5️⃣ Return new access token
  return {
    accessToken,
  };
};

export const authService = {
  login,
  refreshToken,
};
