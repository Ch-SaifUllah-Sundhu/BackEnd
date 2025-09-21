// Custom error class to handle API errors consistently
class ApiError extends Error {
    constructor(
        message = "Something went wrong", // Default message
        statusCode,                       // HTTP status code (e.g., 400, 401, 500)
        errors = [],                      // Any extra error details
        stack = ""                        // Custom stack trace
    ) {
        super(message); // Call base Error class constructor

        this.statusCode = statusCode;
        this.data = null;  // Optional extra data
        this.success = false; // Always false for errors
        this.errors = errors;
        this.message = message;

        // If a stack trace is passed, use it
        if (stack) {
            this.stack = stack;
        } else {
            // Otherwise capture the stack trace automatically
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

export { ApiError };
