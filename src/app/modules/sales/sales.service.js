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
  const { startDate, endDate, search, page = "1", limit = "5" } = req.query;

  const pageNumber = parseInt(page, 10);
  const pageSize = parseInt(limit, 10);
  const offset = (pageNumber - 1) * pageSize;

  let whereClause = `1=1`;
  const params = [];

  // Date filters
  if (startDate && endDate) {
    whereClause += ` AND s.sales_date BETWEEN ? AND ?`;
    params.push(new Date(startDate), new Date(endDate));
  } else if (startDate) {
    whereClause += ` AND s.sales_date >= ?`;
    params.push(new Date(startDate));
  } else if (endDate) {
    whereClause += ` AND s.sales_date <= ?`;
    params.push(new Date(endDate));
  }

  // Search filter on sales_code
  let orderByClause = ``;
  if (search && search.trim()) {
    whereClause += ` AND s.sales_code LIKE ?`;
    params.push(`%${search.trim()}%`);

    // Add sorting to prioritize exact matches
    orderByClause = `
      CASE
        WHEN s.sales_code = ? THEN 1
        WHEN s.sales_code LIKE ? THEN 2
        ELSE 3
      END ASC,
    `;
  }

  // Total count query
  const totalCountResult = await prisma.$queryRawUnsafe(
    `SELECT COUNT(*) as count
     FROM db_sales s
     WHERE ${whereClause};`,
    ...params
  );
  const totalCount = Number(totalCountResult[0]?.count) || 0;

  // Prepare params for main query (includes search term for CASE statement)
  const mainQueryParams = [...params];
  if (search && search.trim()) {
    mainQueryParams.push(search.trim()); // Exact match
    mainQueryParams.push(`${search.trim()}%`); // Starts with
  }

  // Fetch paginated data with smart sorting
  const sales = await prisma.$queryRawUnsafe(
    `SELECT
        s.id,
        s.sales_code,
        s.reference_no,
        s.customer_id,
        c.customer_name,
        s.payment_status,
        s.paid_amount,
        s.created_date,
        s.created_time,
        s.sales_date
      FROM db_sales s
      LEFT JOIN db_customers c ON s.customer_id = c.id
      WHERE ${whereClause}
      ORDER BY
        ${orderByClause}
        s.sales_date DESC,
        s.created_date DESC,
        s.id DESC
      LIMIT ? OFFSET ?;`,
    ...mainQueryParams,
    pageSize,
    offset
  );

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
