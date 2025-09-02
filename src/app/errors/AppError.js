class AppError extends Error {
  constructor(statusCode, message, details = null, stack = "") {
    super(message);
    this.statusCode = statusCode;
    this.details = details;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export default AppError;
