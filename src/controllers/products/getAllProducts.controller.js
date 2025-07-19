import prisma from "../../config/db.js";

export const getAllSalesProducts = async (req, res, next) => {
  try {
    const products = await prisma.db_salesitems.findMany();
    res.status(200).json({
      message: "✅ Product fetched successfully!",
      products,
    });
  } catch (error) {
    console.error(" Error fetching products:", error);
    res.status(500).json({ message: " Failed to fetch product" });
  }
};
