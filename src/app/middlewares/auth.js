import jwt from "jsonwebtoken";
import httpStatus from "http-status";
import prisma from "../shared/prisma.js"; // your prisma instance
import AppError from "../errors/AppError.js";
// import config from "../config/index.js";

const auth = () => {
  return async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      // 1️⃣ Check if header exists
      if (!authHeader) {
        throw new AppError(
          httpStatus.UNAUTHORIZED,
          "Authorization header is missing."
        );
      }

      // 2️⃣ Check Bearer token format
      if (!authHeader.startsWith("Bearer ")) {
        throw new AppError(
          httpStatus.UNAUTHORIZED,
          "Invalid authorization format. Expected 'Bearer <token>'."
        );
      }

      // 3️⃣ Extract token
      const token = authHeader.split(" ")[1];
      if (!token) {
        throw new AppError(httpStatus.UNAUTHORIZED, "Token is missing.");
      }
      // 4️⃣ Verify token
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

      const { id, iat } = decoded;

      // 5️⃣ Check if user exists in DB
      const user = await prisma.db_users.findUnique({ where: { id } });
      if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "User not found.");
      }

      // 6️⃣ Check if password (or user) updated after token issued
      if (
        user.updated_at &&
        Math.floor(user.updated_at.getTime() / 1000) > iat
      ) {
        throw new AppError(httpStatus.UNAUTHORIZED, "You are not authorized.");
      }

      // 8️⃣ Attach user info to request
      req.user = user;

      next();
    } catch (error) {
      next(error);
    }
  };
};

export default auth;
