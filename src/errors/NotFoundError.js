import BaseError from "./BaseError.js";

// Error code 404: Not Found
class NotFoundError extends BaseError {
    constructor(message) {
        super(message, 404); // 404 is the status code for not found
    }
}

export default NotFoundError;