import AppError from "./AppError.js";

class BadRequestError extends AppError {
  constructor(message = "Bad request", details = null) {
    super(400, message, details);
  }
}

export default BadRequestError;
