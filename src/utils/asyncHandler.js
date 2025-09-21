// A wrapper for async route handlers to avoid try/catch everywhere
const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        // Promise.resolve ensures async errors are caught
        Promise.resolve(requestHandler(req, res, next)).catch(next);
    };
};

export { asyncHandler };

/*
Alternative version (commented):
- Explicit try/catch
- Handles errors inside middleware directly
*/
