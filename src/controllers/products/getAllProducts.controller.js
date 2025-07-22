import prisma from "../../config/db.js";

export const getAllSalesProducts = async (req, res, next) => {
  // try {
  //   // Extract page and limit from query parameters, with defaults
  //   const page = parseInt(req.query.page) || 1;
  //   const limit = parseInt(req.query.limit) || 10; // Default to 10 items per page
  //   const skip = (page - 1) * limit;
  //   console.log(req.query);
  //   // Fetch paginated sales products
  //   const products = await prisma.db_salesitems.findMany({
  //     skip,
  //     take: limit,
  //     orderBy: { sales_qty: "desc" },
  //   });
  //   // Fetch total count for pagination metadata
  //   const totalProducts = await prisma.db_salesitems.count();

  //   // Calculate next page
  //   const totalPages = Math.ceil(totalProducts / limit);
  //   const nextPage = page < totalPages ? page + 1 : null;

  //   // Fetch related item info for each product
  //   const productsWithItemInfo = await Promise.all(
  //     products.map(async (item) => {
  //       const relatedItem = item.item_id
  //         ? await prisma.db_items.findUnique({ where: { id: item.item_id } })
  //         : null;

  //       return {
  //         ...item,
  //         item_info: relatedItem, // Attach related item as `item_info`
  //       };
  //     })
  //   );

  //   res.status(200).json({
  //     message: "✅ Products fetched successfully!",
  //     products: productsWithItemInfo,
  //     nextPage,
  //   });
  // } catch (error) {
  //   console.error("Error fetching products:", error);
  //   res.status(500).json({ message: "Failed to fetch products" });
  // }

  try {
    const { startDate, endDate } = req.query;
    console.log(startDate, endDate);
    // Fetch all sales products ordered by sales_qty
    const products = await prisma.db_salesitems.findMany({
      take: 10,
    });

    // Fetch related item info for each product
    const productsWithItemInfo = await Promise.all(
      products.map(async (item) => {
        const relatedItem = item.item_id
          ? await prisma.db_items.findUnique({ where: { id: item.item_id } })
          : null;

        return {
          ...item,
          item_info: relatedItem, // Attach related item as `item_info`
        };
      })
    );

    res.status(200).json({
      message: "✅ All products fetched successfully!",
      products: productsWithItemInfo,
    });
  } catch (error) {
    console.error("Error fetching all products:", error);
    res.status(500).json({ message: "Failed to fetch products" });
  }
};
