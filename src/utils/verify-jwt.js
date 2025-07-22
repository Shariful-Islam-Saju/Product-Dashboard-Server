import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("❌ JWT_SECRET not defined in environment variables.");
}

export const verifyJwt = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(" ")[1];
    if (!token) {
      return res
        .status(401)
        .json({ message: "Access denied. No token provided." });
    }
    // ✅ Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET);
    // ✅ Attach decoded user info to request
    req.user = {
      userId: decoded.userId,
      role: decoded.role,
    };
    return res.status(200).json({
      user: {
        id: decoded.userId,
        role: decoded.role,
      },
    });
  } catch (error) {
    console.error("🔐 Auth error:", error.message);
    return res.status(403).json({ message: "Invalid or expired token." });
  }
};
