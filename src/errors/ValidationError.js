import BaseError from "./BaseError.js";

class ValidationError extends BaseError {
    constructor(issues) {
        // issues: Zod's array of { path, message, code, ... } objects
        const message = issues.map(issue => `${issue.path.join('.')}: ${issue.message}`).join(', ');
        super(message, 400); // 400 is the status code for bad request / validation error
    }
}

export default ValidationError;