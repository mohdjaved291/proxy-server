import { ProxyResponse } from '../services/proxyService';

/**
 * Statistics for monitoring cache performance and usage
 * Used for analytics and cache optimization
 */
export interface CacheStats {
    hits: number;          // Number of successful cache retrievals
    misses: number;        // Number of failed cache retrievals
    totalRequests: number; // Total number of cache operations performed
    cacheSize: number;     // Current number of entries in the cache
}

/**
 * Represents a single entry in the cache
 * Includes metadata for cache management and expiration
 */
export interface CacheEntry {
    url: string;             // URL used as the cache key
    response: ProxyResponse; // Cached response data
    timestamp: number;       // When the entry was created (unix timestamp)
    expiry: number;         // When the entry should expire (unix timestamp)
}
