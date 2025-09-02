import {
  PrismaClientKnownRequestError,
  PrismaClientValidationError,
} from "@prisma/client/runtime/library.js";
import httpStatus from "http-status";
import ApiError from "../errors/ApiError.js"; // adjust path if needed

const globalErrorHandler = (err, req, res, next) => {
  console.error(err);

  let statusCode = httpStatus.INTERNAL_SERVER_ERROR;
  let message = err.message || "Something went wrong!";
  let success = false;
  let error = err;

  // Handle Prisma Validation Errors
  if (err instanceof PrismaClientValidationError) {
    message = "Validation Error";
    error = err.message;
    statusCode = httpStatus.BAD_REQUEST;
  }

  // Handle Prisma Known Errors
  else if (err instanceof PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      message = "Duplicate key error";
      error = err.meta;
      statusCode = httpStatus.CONFLICT; // 409
    }
  }

  // Handle custom ApiError
  else if (err instanceof ApiError) {
    statusCode = err.statusCode || httpStatus.BAD_REQUEST;
    message = err.message;
    error = err.details || err.message;
  }

  res.status(statusCode).json({
    success,
    statusCode,
    message,
    error,
  });
};

export default globalErrorHandler;
