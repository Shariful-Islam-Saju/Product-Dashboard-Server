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

    if (!startDate || !endDate) {
      return res.status(400).json({
        error: "startDate and endDate query params are required.",
      });
    }

    // Optional: Validate date format here
    const rows = await prisma.$queryRawUnsafe(
      `
      SELECT
        si.item_id,
        DATE(s.sales_date) AS sales_date,
        SUM(si.sales_qty) AS total_qty,
        SUM(si.total_cost) AS total_amount,
        i.*
      FROM db_salesitems si
      JOIN db_sales s ON s.id = si.sales_id
      JOIN db_items i ON i.id = si.item_id
      WHERE s.sales_date BETWEEN ? AND ?
      GROUP BY si.item_id, DATE(s.sales_date)
      ORDER BY sales_date DESC, item_id
    `,
      startDate,
      endDate
    );
    // Separate item fields into nested "item" object
    const formatted = rows.map((row) => {
      const {
        item_id,
        sales_date,
        total_qty,
        total_amount,
        // extract known sales fields
        id, // this is the item.id, we’ll include it in item
        ...rest
      } = row;

      const item = { id, ...rest }; // rest contains all other i.* fields

      return {
        item_id,
        sales_date,
        total_qty,
        total_amount,
        item,
      };
    });
    const mergedData = Object.values(
      formatted.reduce((acc, curr) => {
        const id = curr.item_id;

        if (!acc[id]) {
          acc[id] = { ...curr };
        } else {
          acc[id].total_qty += curr.total_qty;
          acc[id].total_amount += curr.total_amount;
        }

        return acc;
      }, {})
    );

    res.status(200).json({
      products: mergedData,
    });
  } catch (error) {
    console.error("Error fetching all products:", error);
    res.status(500).json({ message: "Failed to fetch products" });
  }
};
