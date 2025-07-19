import dotenv from "dotenv";

import jwt from "jsonwebtoken";
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

export const protectedRoute = (req, res, next) => {
  try {
    const token = req.cookies?.Auth_Token;

    if (!token) {
      return res
        .status(401)
        .json({ message: " Access denied. No token provided." });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log(decoded);
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
