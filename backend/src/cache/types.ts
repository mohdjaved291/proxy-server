/**
 * Type definitions for the LRU Cache implementation
 */

/**
 * Represents a node in the doubly-linked list cache structure
 * @interface CacheElement
 */
export interface CacheElement {
    timestamp: string;           // ISO timestamp of when element was cached
    data: Buffer;               // Cached data as buffer
    length: number;             // Size of cached data in bytes
    url: string;                // URL key for the cached content
    lruTimeTrack: number;       // Timestamp for LRU tracking
    next: CacheElement | null;  // Next element in linked list
    prev: CacheElement | null;  // Previous element in linked list
}

/**
 * Configuration options for cache initialization
 * @interface CacheOptions
 */
export interface CacheOptions {
    maxSize: number;        // Maximum total cache size in bytes
    maxElementSize: number; // Maximum size for any single cached element
}

/**
 * Statistics for monitoring cache performance
 * @interface CacheStats
 */
export interface CacheStats {
    size: number;          // Current total cache size in bytes
    items: number;         // Number of items currently in cache
    hits: number;          // Number of successful cache retrievals
    misses: number;        // Number of failed cache retrievals
    hitRate: number;       // Cache hit rate as percentage (hits/total requests)
}
