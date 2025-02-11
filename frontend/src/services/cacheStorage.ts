import { CacheEntry, CacheStats } from '../types/cache';
import { ProxyResponse } from '../services/proxyService';

/**
 * Service for managing cached responses in localStorage.
 * Handles saving, retrieving, and managing cache statistics for proxy responses.
 * Uses a prefix to namespace cache entries and prevent conflicts with other storage.
 */
class CacheStorageService {
    // Prefix for all cache-related localStorage keys to avoid naming conflicts
    private prefix = 'proxy_cache_';

    /**
     * Saves a proxy response to the cache with an expiration time.
     * @param url - The URL used as the cache key
     * @param data - The proxy response data to cache
     */
    public saveToCache(url: string, data: ProxyResponse): void {
        // Create cache entry with metadata including expiration
        const entry: CacheEntry = {
            url,
            response: data,
            timestamp: Date.now(),
            expiry: Date.now() + (30 * 60 * 1000) // 30 minutes expiration
        };
        // Store serialized entry in localStorage
        localStorage.setItem(this.prefix + url, JSON.stringify(entry));
        // Update cache statistics (false indicates a cache miss/write)
        this.updateStats(false);
    }

    /**
     * Retrieves a cached response if it exists and hasn't expired.
     * @param url - The URL to lookup in the cache
     * @returns The cached response or null if not found/expired
     */
    public getFromCache(url: string): ProxyResponse | null {
        const item = localStorage.getItem(this.prefix + url);
        if (!item) return null;

        const entry = JSON.parse(item) as CacheEntry;
        // Check if entry hasn't expired
        if (entry.expiry > Date.now()) {
            // Update stats to record cache hit
            this.updateStats(true);
            return entry.response;
        }
        return null;
    }

    /**
     * Updates cache statistics after each operation.
     * @param isHit - Whether the operation was a cache hit (true) or miss (false)
     */
    private updateStats(isHit: boolean): void {
        const stats = this.getStats();
        const newStats: CacheStats = {
            hits: isHit ? stats.hits + 1 : stats.hits,
            misses: !isHit ? stats.misses + 1 : stats.misses,
            totalRequests: stats.totalRequests + 1,
            cacheSize: this.getCacheSize()
        };
        // Store updated statistics
        localStorage.setItem(this.prefix + 'stats', JSON.stringify(newStats));
    }

    /**
     * Retrieves current cache statistics.
     * @returns Current cache statistics or default values if no stats exist
     */
    public getStats(): CacheStats {
        const stats = localStorage.getItem(this.prefix + 'stats');
        // Return default stats if none exist
        return stats ? JSON.parse(stats) as CacheStats : {
            hits: 0,
            misses: 0,
            totalRequests: 0,
            cacheSize: 0
        };
    }

    /**
     * Calculates the current number of cached items.
     * @returns Number of items in the cache (excluding stats entry)
     */
    private getCacheSize(): number {
        // Count all localStorage keys that start with the cache prefix
        return Object.keys(localStorage)
            .filter(key => key.startsWith(this.prefix))
            .length;
    }

    /**
     * Clears all cached items and resets statistics.
     * Removes all entries with the cache prefix from localStorage.
     */
    public clearCache(): void {
        // Remove all cache entries
        Object.keys(localStorage)
            .filter(key => key.startsWith(this.prefix))
            .forEach(key => localStorage.removeItem(key));

        // Reset statistics to default values
        localStorage.setItem(this.prefix + 'stats', JSON.stringify({
            hits: 0,
            misses: 0,
            totalRequests: 0,
            cacheSize: 0
        }));
    }
}

// Export a singleton instance
export const cacheStorage = new CacheStorageService();
