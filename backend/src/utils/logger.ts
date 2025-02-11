/**
 * Static logging utility class
 * Provides standardized logging methods with severity levels
 * Supports debug logging toggle via environment variable
 */
export class Logger {
    /**
     * Logs informational messages
     * Used for tracking normal application flow and status updates
     * @param message - Main message to log
     * @param args - Additional arguments to include in log
     * 
     * @example
     * Logger.info('Server started on port', 8080);
     */
    static info(message: string, ...args: any[]): void {
        console.log(`[INFO] ${message}`, ...args);
    }

    /**
     * Logs error messages
     * Used for tracking errors and exceptional conditions
     * @param message - Error message to log
     * @param args - Additional arguments (like error objects) to include
     * 
     * @example
     * Logger.error('Failed to connect to database', error);
     */
    static error(message: string, ...args: any[]): void {
        console.error(`[ERROR] ${message}`, ...args);
    }

    /**
     * Logs debug messages
     * Only outputs when DEBUG environment variable is set
     * Used for detailed troubleshooting information
     * @param message - Debug message to log
     * @param args - Additional debugging information to include
     * 
     * @example
     * Logger.debug('Cache hit for key:', key);
     */
    static debug(message: string, ...args: any[]): void {
        if (process.env.DEBUG) {
            console.debug(`[DEBUG] ${message}`, ...args);
        }
    }
}
