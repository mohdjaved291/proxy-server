/**
 * Global configuration constants for the proxy server
 * All memory values are in bytes, all time values are in milliseconds
 */
export const CONFIG = {
    // Server Configuration
    /** Default port number for the proxy server */
    DEFAULT_PORT: 8080,

    /** Maximum number of concurrent client connections allowed
     *  Higher values increase server capacity but consume more system resources
     */
    MAX_CLIENTS: 400,

    /** Maximum time to wait for a request to complete before timing out
     *  30 seconds (30000ms) is a reasonable default for most web requests
     */
    REQUEST_TIMEOUT: 30000,

    // Cache Configuration
    /** Total maximum size of the cache in bytes
     *  200MB (200 * 1024 * 1024 bytes) balances memory usage with cache effectiveness
     */
    CACHE_SIZE: 200 * 1024 * 1024,     // 200MB

    /** Maximum size of any single cached element
     *  10MB (10 * 1024 * 1024 bytes) prevents individual items from consuming too much cache space
     *  Items larger than this will not be cached
     */
    MAX_ELEMENT_SIZE: 10 * 1024 * 1024, // 10MB

    /** Interval for logging cache statistics
     *  Statistics are logged every minute (60000ms) to monitor cache performance
     */
    CACHE_STATS_INTERVAL: 60000,

    // Thread Pool Configuration
    /** Minimum number of worker threads to maintain
     *  Ensures responsive handling of requests even during low load
     */
    MIN_THREADS: 4,

    /** Maximum number of worker threads allowed
     *  Prevents thread pool from consuming excessive system resources
     *  Should be adjusted based on available CPU cores and expected load
     */
    MAX_THREADS: 32,

    /** Time a thread can remain idle before being terminated
     *  Helps optimize resource usage by cleaning up unnecessary threads
     *  Only applies to threads above MIN_THREADS count
     */
    THREAD_IDLE_TIMEOUT: 60000 // 60 seconds
};
