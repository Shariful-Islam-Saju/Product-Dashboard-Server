import prisma from "../../config/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your_default_secret"; // Replace in .env

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    // ✅ Check required fields
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "❌ Email and password are required." });
    }

    // ✅ Find user by email
    const user = await prisma.db_users.findFirst({
      where: { email },
    });

    if (!user || !user.password) {
      return res.status(401).json({ message: " Invalid email or password." });
    }

    // ✅ Compare password (stored as Bytes, need to convert to string)
    const hashedPassword = Buffer.from(user.password).toString("utf-8");
    const isMatch = await bcrypt.compare(password, hashedPassword);

    if (!isMatch) {
      return res.status(401).json({ message: " Invalid email or password." });
    }

    // ✅ Generate JWT Token
    const token = jwt.sign(
      { userId: user.id, role: user.role_id },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("Auth_Token", token, {
      httpOnly: true, // Prevent access from JavaScript
      secure: process.env.NODE_ENV === "production", // Only HTTPS in production
      sameSite: "lax", // CSRF protection (consider 'strict' or 'none' based on needs)
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
      path: "/", // Allow cookie for all routes
    });

    // ✅ Remove sensitive fields from response
    const { password: _, ...safeUser } = user;

    res.status(200).json({
      message: "✅ User logged in successfully!",
      token,
      user: safeUser,
    });
  } catch (error) {
    console.error("❌ Login error:", error);
    res.status(500).json({ message: " Internal server error" });
  }
};
