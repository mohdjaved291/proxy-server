/**
 * Custom error class for proxy-related errors
 * Extends the built-in Error class with HTTP status code support
 * Used for throwing errors that can be properly handled and returned to clients
 */
export class ProxyError extends Error {
    /**
     * Creates a new ProxyError instance
     * @param message - Error message describing what went wrong
     * @param statusCode - HTTP status code to return to client (defaults to 500)
     * 
     * @example
     * throw new ProxyError('Invalid URL provided', 400);
     * throw new ProxyError('Cache operation failed');
     */
    constructor(
        message: string,
        public statusCode: number = 500
    ) {
        super(message);
        this.name = 'ProxyError';
        // Ensure proper inheritance in TypeScript
        Object.setPrototypeOf(this, ProxyError.prototype);
    }
}
