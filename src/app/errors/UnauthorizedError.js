import AppError from "./AppError.js";

class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized", details = null) {
    super(401, message, details);
  }
}

export default UnauthorizedError;
