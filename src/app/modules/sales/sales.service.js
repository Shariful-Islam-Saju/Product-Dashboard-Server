import AppError from "../../errors/AppError.js";
import prisma from "../../shared/prisma.js";
import httpStatus from "http-status";

// const allSalesReport = async (req) => {
//   const { startDate, endDate } = req.query;
//   // 1️⃣ Validate query params
//   if (!startDate || !endDate) {
//     throw new AppError(
//       httpStatus.BAD_REQUEST,
//       "Both 'startDate' and 'endDate' query parameters are required."
//     );
//   }
//   let rows;
//   // 2️⃣ Fetch raw data with Prisma (tagged template)
//   const sales = await prisma.db_sales.findMany();

//   // 3️⃣ Handle empty result
//   // if (!rows || rows.length === 0) {
//   //   throw new AppError(
//   //     httpStatus.NOT_FOUND,
//   //     `No sales data found between ${startDate} and ${endDate}.`
//   //   );
//   // }

//   // 4️⃣ Format each row
//   // const formatted = rows.map((row) => {
//   //   const {
//   //     item_id,
//   //     sales_date,
//   //     total_qty,
//   //     total_amount,
//   //     id, // item.id
//   //     ...rest
//   //   } = row;

//   //   return {
//   //     item_id,
//   //     sales_date,
//   //     total_qty: Number(total_qty),
//   //     total_amount: Number(total_amount),
//   //     item: { id, ...rest },
//   //   };
//   // });

//   // // 5️⃣ Merge duplicate items (aggregate by item_id)
//   // const mergedData = Object.values(
//   //   formatted.reduce((acc, curr) => {
//   //     const id = curr.item_id;

//   //     if (!acc[id]) {
//   //       acc[id] = { ...curr };
//   //     } else {
//   //       acc[id].total_qty += curr.total_qty;
//   //       acc[id].total_amount += curr.total_amount;
//   //     }

//   //     return acc;
//   //   }, {})
//   // );
//   return sales;
// };

const allSalesReport = async (req) => {
  const { startDate, endDate, page = "1", limit = "50" } = req.query;

  // 1️⃣ Validate query params
  if (!startDate || !endDate) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Both 'startDate' and 'endDate' query parameters are required."
    );
  }

  const pageNumber = parseInt(page, 10);
  const pageSize = parseInt(limit, 10);
  const offset = (pageNumber - 1) * pageSize;

  // 2️⃣ Get total count for pagination
  const totalCountResult = await prisma.$queryRaw`
    SELECT COUNT(*) as count
    FROM db_sales
    WHERE sales_date BETWEEN ${new Date(startDate)} AND ${new Date(endDate)};
  `;
  const totalCount = Number(totalCountResult[0]?.count) || 0;

  // 3️⃣ Fetch paginated sales (exclude BigInt/Decimal columns)
  const sales = await prisma.$queryRaw`
    SELECT
      id,
      sales_date,
      subtotal,
      tot_discount_to_all_amt,
      grand_total,
      paid_amount,
      sales_status,
      customer_id,
      store_id,
      warehouse_id
    FROM db_sales
    WHERE sales_date BETWEEN ${new Date(startDate)} AND ${new Date(endDate)}
    ORDER BY sales_date ASC
    LIMIT ${pageSize} OFFSET ${offset};
  `;

  // 4️⃣ Return structured result
  return {
    data: sales,
    pagination: {
      total: totalCount,
      page: pageNumber,
      limit: pageSize,
      totalPages: Math.ceil(totalCount / pageSize),
    },
  };
};


const getAllSalesItems = async (req) => {
  const allItems = await prisma.db_items.findMany();
  return allItems;
};

const getSalesReportByProductID = async (req) => {
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

export const salesService = {
  allSalesReport,
  getAllSalesItems,
  getSalesReportByProductID,
};
