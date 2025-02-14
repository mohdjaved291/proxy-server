import * as http from 'http';
import * as https from 'https';
import { URL } from 'url';
import { EventEmitter } from 'events';
import { Logger } from '../utils/logger';
import { ProxyError } from '../utils/errors';
import { LRUCache } from '../cache/LRUCache';

/**
 * HTTP/HTTPS proxy server with caching capabilities
 * Features:
 * - Support for both HTTP and HTTPS proxying
 * - LRU caching of responses
 * - CORS support
 * - Error handling and logging
 * @extends EventEmitter
 */
export class ProxyServer extends EventEmitter {
    private server: http.Server;
    private cache: LRUCache;
    private readonly port: number;
    private isRunning: boolean = false;

    /**
     * Creates a new proxy server instance
     * @param port - Port number to listen on (defaults to 8080)
     */
    constructor(port: number = 8080) {
        super();
        this.port = port;
        this.cache = new LRUCache();

        // Initialize HTTP server with request handler
        this.server = http.createServer((req, res) => {
            // Set default CORS headers
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');

            // Handle CORS preflight requests
            if (req.method === 'OPTIONS') {
                res.writeHead(204);
                res.end();
                return;
            }

            // Handle all other requests with error handling
            this.handleRequest(req, res).catch(error => {
                Logger.error('Unhandled request error:', error);
                if (!res.headersSent) {
                    res.writeHead(500);
                    res.end('Internal Server Error');
                }
            });
        });

        // Handle server-level errors
        this.server.on('error', (error) => {
            Logger.error('Server error:', error);
            this.isRunning = false;
        });
    }

    /**
     * Handles incoming HTTP requests
     * Supports various endpoints:
     * - /: Server status
     * - /status: Detailed server status
     * - /proxy: Main proxy endpoint
     * @param clientReq - Incoming client request
     * @param clientRes - Server response object
     */
    private async handleRequest(clientReq: http.IncomingMessage, clientRes: http.ServerResponse): Promise<void> {
        // Define CORS headers for all responses
        const corsHeaders: Record<string, string> = {
            'Access-Control-Allow-Origin': 'https://proxy-server-frontend.onrender.com',
            'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
            'Access-Control-Allow-Headers': 'Accept, Content-Type, Origin',
            'Access-Control-Expose-Headers': 'X-Cache, X-Cache-Lookup',
            'Access-Control-Allow-Credentials': 'true'
        };

        try {
            // Handle CORS preflight requests
            if (clientReq.method === 'OPTIONS') {
                clientRes.writeHead(204, corsHeaders);
                clientRes.end();
                return;
            }

            if (!clientReq.url) {
                throw new ProxyError('No URL provided', 400);
            }

            Logger.debug(`Incoming request: ${clientReq.method} ${clientReq.url}`);

            // Parse request URL
            const parsedUrl = new URL(clientReq.url, `http://localhost:${this.port}`);

            // Route handling based on pathname
            switch (parsedUrl.pathname) {
                case '/':
                    // Root endpoint - server status
                    clientRes.writeHead(200, {
                        'Content-Type': 'application/json',
                        ...corsHeaders
                    });
                    clientRes.end(JSON.stringify({
                        message: 'Proxy server is running',
                        status: 'ok'
                    }));
                    return;

                case '/status':
                    // Detailed server status
                    clientRes.writeHead(200, {
                        'Content-Type': 'application/json',
                        ...corsHeaders
                    });
                    clientRes.end(JSON.stringify({
                        status: this.isRunning ? 'Connected' : 'Disconnected',
                        port: this.port,
                        timestamp: new Date().toISOString()
                    }));
                    return;

                case '/favicon.ico':
                    // Handle favicon requests
                    clientRes.writeHead(204, {
                        ...corsHeaders,
                        'Content-Type': 'image/x-icon'
                    });
                    clientRes.end();
                    return;

                case '/proxy':
                    // Main proxy functionality
                    const targetUrl = parsedUrl.searchParams.get('targetUrl');
                    if (!targetUrl) {
                        throw new ProxyError('No target URL provided', 400);
                    }

                    // Ensure URL has protocol
                    let formattedUrl = targetUrl;
                    if (!formattedUrl.match(/^https?:\/\//i)) {
                        formattedUrl = `http://${formattedUrl}`;
                    }

                    try {
                        // Check cache first
                        const cachedResponse = await this.cache.find(formattedUrl);
                        const responseHeaders = {
                            ...corsHeaders,
                            'Content-Type': 'text/html',
                            'X-Cache-Lookup': formattedUrl
                        };

                        if (cachedResponse) {
                            // Serve cached response
                            Logger.debug('Cache hit for:', formattedUrl);
                            clientRes.writeHead(200, {
                                ...responseHeaders,
                                'X-Cache': 'HIT',
                                'X-Cache-Date': cachedResponse.timestamp
                            });
                            clientRes.end(cachedResponse.data);
                            return;
                        }

                        // Cache miss - make proxy request
                        Logger.debug('Cache miss for:', formattedUrl);
                        await this.makeProxyRequest(new URL(formattedUrl), clientRes, responseHeaders);
                        return;
                    } catch (error) {
                        Logger.error('Cache/Proxy error:', error);
                        throw error;
                    }

                default:
                    throw new ProxyError(`Endpoint not found: ${parsedUrl.pathname}`, 404);
            }

        } catch (error) {
            // Error handling with appropriate status codes
            Logger.error('Request Handler Error:', error);
            if (!clientRes.headersSent) {
                const statusCode = error instanceof ProxyError ? error.statusCode : 500;
                clientRes.writeHead(statusCode, {
                    'Content-Type': 'application/json',
                    ...corsHeaders
                });
                clientRes.end(JSON.stringify({
                    error: error instanceof Error ? error.message : 'Unknown error',
                    status: 'error',
                    statusCode
                }));
            }
        }
    }

    /**
     * Makes a proxy request to the target URL
     * @param targetUrl - Destination URL for the proxy request
     * @param clientRes - Original client response object
     * @param headers - Headers to include in the response
     */
    private makeProxyRequest(targetUrl: URL, clientRes: http.ServerResponse, headers: Record<string, string>): Promise<void> {
        return new Promise((resolve, reject) => {
            // Configure proxy request options
            const options: http.RequestOptions = {
                protocol: targetUrl.protocol,
                hostname: targetUrl.hostname,
                port: targetUrl.port || (targetUrl.protocol === 'https:' ? '443' : '80'),
                path: targetUrl.pathname + targetUrl.search,
                method: 'GET',
                headers: {
                    'Host': targetUrl.host,
                    'User-Agent': 'Node/ProxyServer',
                    'Accept': '*/*'
                }
            };

            // Choose appropriate protocol (HTTP/HTTPS)
            const requester = targetUrl.protocol === 'https:' ? https : http;

            const proxyReq = requester.request(options, async (proxyRes) => {
                try {
                    // Collect response data
                    const chunks: Buffer[] = [];
                    proxyRes.on('data', (chunk) => chunks.push(chunk));
                    proxyRes.on('end', async () => {
                        const responseData = Buffer.concat(chunks);

                        try {
                            // Attempt to cache the response
                            await this.cache.add(responseData, targetUrl.href);

                            // Prepare response headers
                            const responseHeaders = {
                                ...headers,
                                ...Object.fromEntries(
                                    Object.entries(proxyRes.headers)
                                        .filter(([_, value]) => value !== undefined)
                                ),
                                'X-Cache': 'MISS',
                                'Content-Type': proxyRes.headers['content-type'] || 'text/html'
                            };

                            // Send response to client
                            clientRes.writeHead(proxyRes.statusCode || 200, responseHeaders);
                            clientRes.end(responseData);

                            Logger.debug(`Proxy request completed for ${targetUrl.href}, cached: ${responseData.length} bytes`);
                            resolve();
                        } catch (cacheError) {
                            Logger.error('Cache storage error:', cacheError);
                            // Send response even if caching fails
                            clientRes.writeHead(proxyRes.statusCode || 200, {
                                ...headers,
                                'X-Cache': 'MISS',
                                'X-Cache-Error': 'Failed to cache response'
                            });
                            clientRes.end(responseData);
                            resolve();
                        }
                    });
                } catch (error) {
                    reject(error);
                }
            });

            // Handle proxy request errors
            proxyReq.on('error', (error) => {
                Logger.error('Proxy request error:', error);
                reject(error);
            });

            proxyReq.end();
        });
    }

    /**
     * Extracts and validates target URL from request
     * @param reqUrl - Original request URL
     * @returns Formatted target URL
     */
    private getTargetUrl(reqUrl: string): string {
        try {
            const parsedUrl = new URL(reqUrl, 'https://proxy-server-frontend.onrender.com');
            const targetUrl = parsedUrl.searchParams.get('targetUrl');

            if (!targetUrl) {
                Logger.error('No target URL provided in request');
                throw new ProxyError('No target URL provided', 400);
            }

            // Ensure URL has protocol
            if (!targetUrl.match(/^https?:\/\//i)) {
                return `http://${targetUrl}`;
            }

            return targetUrl;
        } catch (error) {
            Logger.error('Error parsing target URL:', error);
            throw new ProxyError('Invalid target URL', 400);
        }
    }

    /**
     * Starts the proxy server
     */
    public start(): void {
        this.server.listen(this.port, () => {
            this.isRunning = true;
            Logger.info(`Proxy server listening on port ${this.port}`);
        });
    }

    /**
     * Stops the proxy server
     */
    public stop(): void {
        this.server.close(() => {
            this.isRunning = false;
            Logger.info('Server stopped');
        });
    }
}
