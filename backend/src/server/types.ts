import { IncomingMessage, ServerResponse } from 'http';

/**
 * Configuration options for the proxy server
 * @interface ProxyServerOptions
 */
export interface ProxyServerOptions {
    port: number;      // Port number for the server to listen on
    maxClients: number; // Maximum number of concurrent client connections
}

/**
 * Type definition for request handler functions
 * Handler must be async and handle both request and response objects
 * @type RequestHandler
 */
export type RequestHandler = (req: IncomingMessage, res: ServerResponse) => Promise<void>;
