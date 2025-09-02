import prisma from "../../config/db.js";
import bcrypt from "bcryptjs";

// Create User
export const registerUser = async (req, res) => {
  try {
    const {
      username,
      first_name,
      last_name,
      email,
      password,
      mobile,
      gender,
      dob,
      country,
      state,
      city,
      postcode,
      role_id,
      profile_picture,
      store_id,
    } = req.body;

    // ✅ Validate required fields
    if (!email || !password || !username) {
      return res
        .status(400)
        .json({ message: "❌ Email, password, and username are required." });
    }

    
    // ✅ Check if email already exists
    const existingUser = await prisma.db_users.findFirst({
      where: { email },
    });

    if (existingUser) {
      return res
        .status(409)
        .json({ message: "❌ User already exists with this email." });
    }

    // ✅ Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Create user
    const newUser = await prisma.db_users.create({
      data: {
        username,
        first_name,
        last_name,
        email,
        mobile,
        gender,
        dob: dob ? new Date(dob) : null,
        country,
        state,
        city,
        postcode,
        role_id,
        profile_picture,
        store_id,
        password: Buffer.from(hashedPassword), // Store as Bytes
        created_date: new Date(),
        created_time: new Date().toLocaleTimeString(),
        created_by: "system",
        system_ip: req.ip,
        system_name: req.hostname,
      },
    });

    const { password: _, ...userData } = newUser;

    res.status(201).json({
      message: "✅ User registered successfully!",
      user: userData,
    });
  } catch (error) {
    console.error("❌ Registration error:", error);
    res.status(500).json({ message: "❌ Internal server error" });
  }
};
