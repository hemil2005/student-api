import BaseError from "./BaseError.js";

class ConflictError extends BaseError {
    constructor(message) {
        super(message, 409); // 409 is the status code for conflict
    }
}

export default ConflictError;
