import httpStatus from "http-status";

/**
 * 404 Not Found middleware
 */
const notFound = (req, res, next) => {
  return res.status(httpStatus.NOT_FOUND).json({
    success: false,
    message: "API Not Found!",
    error: null, // use null instead of empty string for clarity
  });
};

export default notFound;
