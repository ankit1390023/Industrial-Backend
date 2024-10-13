class apiError extends Error {
    constructor(
        statusCode,
        message = 'Something went wrong',
        errors = [],
        stack = '',
    ) {
        super(message);           //super class for overiding 
        this.statusCode = statusCode;
        this.data = null;  
        this.success = false;
        this.errors = errors;

        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

export { apiError };

// Automatic Capture: Use Error.captureStackTrace to automatically generate a stack trace, ensuring that even if no specific stack is provided, useful debugging information is still available.