export const logoutUser = async (req, res) => {
  try {
    // Clear the cookie named "Auth_Token"
    res.clearCookie("Auth_Token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    res.status(200).json({ message: "✅ Logged out successfully!" });
  } catch (error) {
    console.error("❌ Logout error:", error);
    res.status(500).json({ message: "❌ Internal server error" });
  }
};
