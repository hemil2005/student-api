import BaseError from "./BaseError.js";

class UnauthorizedError extends BaseError {
    constructor(message) {
        super(message, 401); // 401 is the status code for unauthorized
    }
}

export default UnauthorizedError;
