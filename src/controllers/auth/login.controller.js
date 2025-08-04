import prisma from "../../config/db.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

export const loginUser = async (req, res) => {
  try {
    const { username, mobile } = req.body;
    if (!username || !mobile) {
      return res
        .status(400)
        .json({ message: "Username and mobile are required." });
    }

    const user = await prisma.db_users.findFirst({
      where: {
        username,
        mobile,
      },
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid username or mobile." });
    }

    const role = await prisma.db_roles.findUnique({
      where: { id: user.role_id },
    });

    if (!role) {
      return res.status(404).json({ message: "Role not found." });
    }

    const token = jwt.sign(
      {
        userId: user.id,
        roleName: role.role_name,
        username,
        mobile,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );
    const isProduction = process.env.NODE_ENV === "production";
    res.cookie("Auth_Token", token, {
      httpOnly: true,
      secure: isProduction, // ✅ true in production, false in dev
      sameSite: isProduction ? "none" : "lax", // ✅ "none" for cross-site in prod, "lax" for local dev
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      user: {
        userId: user.id,
        role: user.role_id,
        name: user.first_name,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
