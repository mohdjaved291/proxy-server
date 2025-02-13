import axios, { AxiosResponseHeaders, RawAxiosResponseHeaders } from 'axios';

/**
 * Base URL for the proxy server
 * All requests will be made relative to this URL
 * Uses environment variable VITE_API_URL if available, falls back to localhost for development
 */
const PROXY_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

/**
 * Represents possible types of response data from the proxy
 * @type {ProxyResponseData}
 */
type ProxyResponseData = string | ArrayBuffer | Record<string, unknown> | null;

/**
 * Comprehensive response interface for proxy requests
 * @interface ProxyResponse
 * @property {boolean} success - Indicates if the request was successful
 * @property {ProxyResponseData} data - The response data from the proxied request
 * @property {number} status - HTTP status code of the response
 * @property {AxiosResponseHeaders | RawAxiosResponseHeaders} headers - Response headers
 * @property {boolean} cached - Indicates if the response was served from cache
 * @property {string} [error] - Error message if the request failed
 * @property {string} [contentType] - Content type of the response
**/

interface ProxyResponse {
    success: boolean;
    data: ProxyResponseData;
    status: number;
    headers: AxiosResponseHeaders | RawAxiosResponseHeaders;
    cached: boolean;
    error?: string;
    contentType?: string;
}

/**
 * Configure axios instance with default settings for proxy requests
 * - Sets base URL for all requests
 * - Configures timeout
 * - Customizes status validation to handle both success and error responses
 */

const axiosInstance = axios.create({
    baseURL: PROXY_BASE_URL,
    timeout: 30000, // 30 second timeout
    validateStatus: (status) => status >= 200 && status < 600 // Accept wider range of status codes
});

export const proxyService = {
    /**
     * Makes a proxy request to the specified URL
     * Handles URL formatting, caching verification, and error cases
     * 
     * Features:
     * - URL sanitization and protocol addition
     * - Cache status verification with double-request
     * - Comprehensive error handling
     * - Detailed logging for debugging
     * 
     * @param {string} url - Target URL to proxy
     * @returns {Promise<ProxyResponse>} Formatted response with cache status
     */
    async makeRequest(url: string): Promise<ProxyResponse> {
        try {
            // URL preprocessing
            let targetUrl = url.trim();

            // Remove existing proxy prefixes if present
            if (targetUrl.includes('/proxy?targetUrl=')) {
                targetUrl = decodeURIComponent(targetUrl.split('/proxy?targetUrl=')[1]);
            }

            // Ensure URL has proper protocol
            if (!targetUrl.match(/^https?:\/\//i)) {
                targetUrl = `http://${targetUrl}`;
            }

            // Clean URL formatting
            targetUrl = targetUrl.replace(/\/+$/, '');

            console.log('Making request for URL:', targetUrl);

            // Initial proxy request
            const response = await axiosInstance.get('/proxy', {
                params: { targetUrl }
            });

            // Debug logging for response headers
            console.log('Response headers:', response.headers);
            console.log('X-Cache header:', response.headers['x-cache']);

            // Cache status verification
            const cacheHeader = response.headers['x-cache'];
            const isCached = typeof cacheHeader === 'string' &&
                cacheHeader.toUpperCase() === 'HIT';

            console.log('Cache status:', cacheHeader, 'Is cached:', isCached);

            // Make verification request if not cached
            if (!isCached) {
                console.log('Making second request to verify caching...');
                const secondResponse = await axiosInstance.get('/proxy', {
                    params: { targetUrl }
                });
                const secondCacheHeader = secondResponse.headers['x-cache'];
                console.log('Second request cache status:', secondCacheHeader);

                return {
                    success: true,
                    data: secondResponse.data,
                    status: secondResponse.status,
                    headers: secondResponse.headers,
                    cached: secondCacheHeader?.toUpperCase() === 'HIT',
                    contentType: secondResponse.headers['content-type']
                };
            }

            // Return response for cached request
            return {
                success: true,
                data: response.data,
                status: response.status,
                headers: response.headers,
                cached: isCached,
                contentType: response.headers['content-type']
            };

        } catch (error) {
            // Handle Axios-specific errors
            if (axios.isAxiosError(error)) {
                console.error('Proxy request failed:', error.response?.data || error.message);
                return {
                    success: false,
                    data: null,
                    status: error.response?.status || 500,
                    headers: error.response?.headers || {},
                    cached: false,
                    error: error.response?.data?.error || error.message
                };
            }
            // Re-throw non-Axios errors
            throw error;
        }
    }
};

export type { ProxyResponse };
// Export a more convenient function name for the service
export const makeProxyRequest = proxyService.makeRequest;
