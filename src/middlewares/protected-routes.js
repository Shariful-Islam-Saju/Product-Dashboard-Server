import dotenv from "dotenv";

import jwt from "jsonwebtoken";
import prisma from "../config/db.js";
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

export const protectedRoute = async (req, res, next) => {
  try {
    const token = req.cookies?.Auth_Token;

    if (!token) {
      return res
        .status(401)
        .json({ message: " Access denied. No token provided." });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET);

    if (!decoded.userId || !decoded.mobile || !decoded.username) {
      throw new Error("Invalid or expired token.");
    }
    const user = await prisma.db_users.findFirst({
      where: {
        username: decoded.username,
        mobile: decoded.mobile,
      },
    });

    if (!user) {
      throw new Error("Invalid or expired token.");
    }

    // Attach user info to request
    req.user = {
      userId: decoded.userId,
      role: decoded.role,
    };

    next(); // Allow access to the route
  } catch (error) {
    console.error(" Auth error:", error);
    return res.status(403).json({ message: " Invalid or expired token." });
  }
};
