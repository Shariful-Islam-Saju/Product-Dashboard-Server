import prisma from "../config/db.js";

export const test = async (req, res, next) => {
  const { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    return res.status(400).json({
      error: "startDate and endDate query params are required.",
    });
  }

  try {
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
    res.status(200).json({ rows: formatted });
  } catch (error) {
    console.error("Sales query error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
