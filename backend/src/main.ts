import { ProxyServer } from './server/ProxyServer';
import { Logger } from './utils/logger';

/**
 * Main application entry point
 * Initializes and manages the proxy server lifecycle:
 * - Server startup
 * - Error handling
 * - Event listening
 * - Graceful shutdown
 */
async function main() {
    try {
        // Initialize proxy server on port 8080
        const proxy = new ProxyServer(8080);

        // Handle server-level errors
        proxy.on('error', (error) => {
            Logger.error('Proxy server error:', error);
        });

        // Log when server is ready to accept connections
        proxy.on('ready', () => {
            Logger.info('Proxy server is ready to accept connections');
        });

        // Start the proxy server
        proxy.start();

        /**
         * Graceful shutdown handler
         * Ensures clean server shutdown on SIGTERM signal:
         * - Stops accepting new connections
         * - Closes existing connections
         * - Performs cleanup
         */
        process.on('SIGTERM', async () => {
            Logger.info('Received SIGTERM signal. Shutting down...');
            // Stop the server gracefully
            await proxy.stop();
            // Exit with success code
            process.exit(0);
        });

    } catch (error) {
        // Log startup failures and exit with error code
        Logger.error('Failed to start proxy server:', error);
        process.exit(1);
    }
}

// Start the application
main();
