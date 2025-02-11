/**
 * In-memory cache implementation using Map data structure.
 * Provides basic caching functionality with expiration and statistics tracking.
 */
import { CacheEntry, CacheStats } from './CacheTypes';

export class CacheStorage {
    // Map to store cache entries with string keys
    private cache: Map<string, CacheEntry>;
    // Statistics tracker for cache performance
    private stats: CacheStats;

    /**
     * Initializes a new cache storage instance with empty cache and default statistics
     */
    constructor() {
        this.cache = new Map();
        this.stats = {
            hits: 0,
            misses: 0,
            totalRequests: 0,
            cacheSize: 0
        };
    }

    /**
     * Stores a value in the cache with automatic expiration
     * @param key - Unique identifier for the cached item
     * @param value - Data to be cached
     */
    set(key: string, value: any): void {
        // Create cache entry with 30-minute expiration
        const entry: CacheEntry = {
            url: key,
            data: value,
            timestamp: Date.now(),
            expiry: Date.now() + (30 * 60 * 1000) // 30 minutes expiration time
        };
        this.cache.set(key, entry);
        this.updateStats(false); // Update stats for cache write
    }

    /**
     * Retrieves a value from the cache if it exists and hasn't expired
     * @param key - Key to look up in the cache
     * @returns The cached value or null if not found/expired
     */
    get(key: string): any | null {
        const entry = this.cache.get(key);
        if (entry && entry.expiry > Date.now()) {
            this.updateStats(true); // Record cache hit
            return entry.data;
        }
        this.updateStats(false); // Record cache miss
        return null;
    }

    /**
     * Updates cache statistics based on operation outcome
     * @param isHit - Whether the operation was a cache hit
     */
    private updateStats(isHit: boolean): void {
        this.stats.totalRequests++;
        if (isHit) {
            this.stats.hits++;
        } else {
            this.stats.misses++;
        }
        this.stats.cacheSize = this.cache.size;
    }

    /**
     * Returns a copy of current cache statistics
     * @returns Current cache statistics
     */
    getStats(): CacheStats {
        return { ...this.stats }; // Return copy to prevent external modifications
    }
}
