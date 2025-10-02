import AppError from "../../errors/AppError.js";
import prisma from "../../shared/prisma.js";

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
  const { startDate, endDate, search, page = "1", limit = "50" } = req.query;

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
  const salesID = Number(req.params.id);

  // Validate salesID
  if (!salesID || isNaN(salesID)) {
    throw new AppError("Valid Sales ID is required");
  }

  // ✅ Get the single sale with all its details (safe query)
  const sales = await prisma.$queryRaw`
    SELECT
      s.id,
      s.sales_code,
      -- s.reference_no,
      s.sales_date,
      -- s.sales_status,
      s.payment_status,
      s.paid_amount,
      s.subtotal,
      -- s.invoice_terms,
      s.created_date,
      s.created_time,
      s.created_by,

      -- Customer details
      c.id AS customer_id,
      c.customer_name
      -- c.mobile,
      -- c.email,
      -- c.address,

      -- Store + Warehouse
      -- st.store_name,
      -- w.warehouse_name

    FROM db_sales s
    LEFT JOIN db_customers c ON s.customer_id = c.id
    LEFT JOIN db_store st ON s.store_id = st.id
    LEFT JOIN db_warehouse w ON s.warehouse_id = w.id
    WHERE s.id = ${salesID}
    LIMIT 1;
  `;

  // ✅ Get all items for this sale (safe query)
  const items = await prisma.$queryRaw`
    SELECT
      si.id AS sales_item_id,
      si.sales_qty,
      si.price_per_unit,
      -- si.tax_type,
      -- si.tax_id,
      -- si.tax_amt,
      -- si.discount_type,
      -- si.discount_input,
      si.discount_amt,
      si.unit_total_cost,
      si.total_cost,
      -- si.description AS item_description,

      -- Item details
      i.id AS item_id,
      i.item_code,
      i.item_name,
      i.sku
      -- i.hsn,
      -- i.sac,
      -- i.item_image,
      -- i.unit_id

    FROM db_salesitems si
    LEFT JOIN db_items i ON si.item_id = i.id
    LEFT JOIN db_category cat ON i.category_id = cat.id
    LEFT JOIN db_brands br ON i.brand_id = br.id
    LEFT JOIN db_units u ON i.unit_id = u.id
    WHERE si.sales_id = ${salesID}
    ORDER BY si.id ASC;
  `;

  // ⚡️ Safe return: since sales is always an array
  return { ...sales[0], items };
};

export const salesService = {
  allSalesReport,
  getAllSalesItems,
  getSalesReportByProductID,
};
