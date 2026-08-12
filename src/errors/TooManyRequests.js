import BaseError from "./BaseError.js";

class TooManyRequestsError extends BaseError {
    constructor(message) {
        super(message, 429); // 429 is the status code for Too Many Requests
    }
}

export default TooManyRequestsError;
