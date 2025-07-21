import prisma from "../config/db.js";

export const test = async (req, res, next) => {
  const id = req.body.id;
  console.log(id);
  const user = await prisma.db_users.findUnique({ where: { id } });
  const passwordBytes = user.password;
  const passwordStr = Buffer.from(passwordBytes).toString("utf8"); // "a982f729009f419aa59b7f0fac336201"
  console.log(passwordStr);
  res.status(200).json({
    message: "Hi",
  });
};
