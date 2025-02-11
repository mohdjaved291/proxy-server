/**
 * Type definitions for cache-related interfaces
 */

/**
 * Represents a single entry in the cache
 * @interface CacheEntry
 */
export interface CacheEntry {
    url: string;      // Unique identifier/URL for the cached item
    data: any;        // The actual cached data
    timestamp: number; // When the entry was created
    expiry: number;   // When the entry should expire
}

/**
 * Statistics for monitoring cache performance
 * @interface CacheStats
 */
export interface CacheStats {
    hits: number;          // Number of successful cache retrievals
    misses: number;        // Number of failed cache retrievals
    totalRequests: number; // Total number of cache operations
    cacheSize: number;     // Current number of items in cache
}
