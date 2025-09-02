import AppError from "./AppError.js";

class ConflictError extends AppError {
  constructor(message = "Conflict error", details = null) {
    super(409, message, details);
  }
}

export default ConflictError;
