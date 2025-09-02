import {
  PrismaClientKnownRequestError,
  PrismaClientValidationError,
} from "@prisma/client/runtime/library.js";
import httpStatus from "http-status";
import AppError from "./AppError.js";

const globalErrorHandler = (err, req, res, next) => {
  console.error(err);

  let statusCode = httpStatus.INTERNAL_SERVER_ERROR;
  let message = err.message || "Something went wrong!";
  let errorDetails = err.details || null;

  // Prisma Validation Error
  if (err instanceof PrismaClientValidationError) {
    statusCode = httpStatus.BAD_REQUEST;
    message = "Prisma validation error";
    errorDetails = err.message;
  }

  // Prisma Known Request Error
  else if (err instanceof PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      statusCode = httpStatus.CONFLICT; // Duplicate key
      message = "Duplicate key error";
      errorDetails = err.meta;
    }
  }

  // Custom AppError
  else if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    errorDetails = err.details;
  }

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    error: errorDetails,
  });
};

export default globalErrorHandler;
