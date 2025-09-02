const login = async (req) => {
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
};

export const authService = {
  login,
};
