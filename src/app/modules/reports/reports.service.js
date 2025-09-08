import AppError from "../../errors/AppError.js";
import prisma from "../../shared/prisma.js";
import httpStatus from "http-status";

const allProductsSalesReport = async (req) => {
  const { startDate, endDate } = req.query;
  // 1️⃣ Validate query params
  if (!startDate || !endDate) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Both 'startDate' and 'endDate' query parameters are required."
    );
  }
  let rows;
  // 2️⃣ Fetch raw data with Prisma (tagged template)
  rows = await prisma.$queryRaw`
    SELECT
      si.item_id,
      DATE(s.sales_date) AS sales_date,
      SUM(si.sales_qty) AS total_qty,
      SUM(si.total_cost) AS total_amount,
      i.*
    FROM db_salesitems si
    JOIN db_sales s ON s.id = si.sales_id
    JOIN db_items i ON i.id = si.item_id
    WHERE s.sales_date BETWEEN ${startDate} AND ${endDate}
    GROUP BY si.item_id, DATE(s.sales_date)
    ORDER BY sales_date DESC, item_id;
  `;

  // 3️⃣ Handle empty result
  // if (!rows || rows.length === 0) {
  //   throw new AppError(
  //     httpStatus.NOT_FOUND,
  //     `No sales data found between ${startDate} and ${endDate}.`
  //   );
  // }

  // 4️⃣ Format each row
  const formatted = rows.map((row) => {
    const {
      item_id,
      sales_date,
      total_qty,
      total_amount,
      id, // item.id
      ...rest
    } = row;

    return {
      item_id,
      sales_date,
      total_qty: Number(total_qty),
      total_amount: Number(total_amount),
      item: { id, ...rest },
    };
  });

  // 5️⃣ Merge duplicate items (aggregate by item_id)
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
  return mergedData;
};

const getAllProducts = async (req) => {
  const allProducts = await prisma.db_items.findMany();
  return allProducts;
};

const getProductSalesReportByID = async (req) => {
  const productId = req.params.id;
  const { startDate, endDate } = req.query; // ✅ get dates from query
  if (!startDate || !endDate) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Both 'startDate' and 'endDate' query parameters are required."
    );
  }

  const result = await prisma.$queryRaw`
      SELECT
        DATE(s.sales_date) AS date,
        SUM(si.sales_qty) AS totalQty,
        SUM(si.total_cost) AS totalAmount
      FROM db_salesitems si
      JOIN db_sales s ON s.id = si.sales_id
      WHERE si.item_id = ${productId}
        AND s.sales_date BETWEEN ${new Date(startDate)} AND ${new Date(endDate)}
      GROUP BY DATE(s.sales_date)
      ORDER BY date ASC;
    `;

  return result;
};

export const reportsService = {
  allProductsSalesReport,
  getAllProducts,
  getProductSalesReportByID,
};
