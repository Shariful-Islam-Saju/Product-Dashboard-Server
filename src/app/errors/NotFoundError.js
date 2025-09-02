import AppError from "./AppError.js";

class NotFoundError extends AppError {
  constructor(message = "Resource not found", details = null) {
    super(404, message, details);
  }
}

export default NotFoundError;
