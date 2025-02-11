import { EventEmitter } from 'events';
import { CacheElement, CacheOptions } from './types';
import { CONFIG } from '../config/constants';
import { Logger } from '../utils/logger';

/**
 * LRU (Least Recently Used) Cache implementation with thread-safe operations
 * Features:
 * - Doubly-linked list for O(1) access and removal
 * - Memory size tracking and limits
 * - Thread-safe operations using mutex
 * - Performance monitoring and statistics
 * @extends EventEmitter
 */
export class LRUCache extends EventEmitter {
    // Doubly-linked list pointers
    private head: CacheElement | null = null;
    private tail: CacheElement | null = null;
    // Hash map for O(1) lookups
    private cacheMap: Map<string, CacheElement> = new Map();
    // Memory management
    private cacheSize: number = 0;
    private readonly maxSize: number = CONFIG.CACHE_SIZE;
    private readonly maxElementSize: number = CONFIG.MAX_ELEMENT_SIZE;
    // Thread safety
    private mutex: Promise<unknown> = Promise.resolve();
    // Performance metrics
    private hits: number = 0;
    private misses: number = 0;

    /**
     * Initializes the LRU cache and starts statistics logging
     */
    constructor() {
        super();
        Logger.info(`Initializing LRU Cache with max size: ${this.maxSize} bytes`);

        // Log cache statistics every minute
        setInterval(() => {
            this.logStats();
        }, 60000);
    }

    /**
     * Logs current cache statistics for monitoring
     */
    private logStats() {
        const hitRate = this.hits + this.misses > 0
            ? (this.hits / (this.hits + this.misses) * 100).toFixed(2)
            : '0.00';

        Logger.info(`Cache Stats - Size: ${this.cacheSize} bytes, Items: ${this.cacheMap.size}, ` +
            `Hit Rate: ${hitRate}%, Hits: ${this.hits}, Misses: ${this.misses}`);
    }

    /**
     * Provides thread-safe execution of cache operations
     * @param fn - Async function to execute with mutex lock
     */
    private async lock<T>(fn: () => Promise<T>): Promise<T> {
        const next = this.mutex.then(async () => {
            try {
                return await fn();
            } catch (error) {
                throw error;
            }
        });
        this.mutex = next.catch(() => { });
        return next;
    }

    /**
     * Moves a cache element to the front of the list (most recently used)
     * @param element - Element to move to front
     */
    private moveToFront(element: CacheElement): void {
        if (element === this.head) return;

        // Unlink from current position
        if (element.prev) element.prev.next = element.next;
        if (element.next) element.next.prev = element.prev;
        if (element === this.tail) this.tail = element.prev;

        // Link to front
        element.next = this.head;
        element.prev = null;
        if (this.head) this.head.prev = element;
        this.head = element;
        if (!this.tail) this.tail = element;
    }

    /**
     * Searches for an element in the cache
     * @param url - URL to look up
     * @returns Found cache element or null
     */
    async find(url: string): Promise<CacheElement | null> {
        return this.lock(async () => {
            const element = this.cacheMap.get(url);
            if (element) {
                this.hits++;
                Logger.debug(`Cache hit for URL: ${url}`);
                element.lruTimeTrack = Date.now();
                this.moveToFront(element);
                return element;
            }
            this.misses++;
            Logger.debug(`Cache miss for URL: ${url}`);
            return null;
        });
    }

    /**
     * Removes the least recently used element from the cache
     */
    private async removeLRU(): Promise<void> {
        if (!this.tail) return;

        const lruElement = this.tail;
        // Update list pointers
        this.tail = this.tail.prev;
        if (this.tail) this.tail.next = null;
        else this.head = null;

        // Remove from map and update size
        this.cacheMap.delete(lruElement.url);
        this.cacheSize -= lruElement.length + Buffer.byteLength(lruElement.url);
        Logger.debug(`Removed LRU element: ${lruElement.url}, freed ${lruElement.length} bytes`);
    }

    /**
     * Adds a new element to the cache
     * @param data - Buffer containing the data to cache
     * @param url - URL key for the cached data
     * @returns Whether the addition was successful
     */
    async add(data: Buffer, url: string): Promise<boolean> {
        return this.lock(async () => {
            const elementSize = data.length + Buffer.byteLength(url);

            // Check size constraints
            if (elementSize > this.maxElementSize) {
                Logger.debug(`Element too large for cache: ${elementSize} bytes`);
                return false;
            }

            // Remove existing entry if present
            const existing = this.cacheMap.get(url);
            if (existing) {
                this.cacheSize -= existing.length + Buffer.byteLength(existing.url);
                this.cacheMap.delete(url);
            }

            // Ensure space available
            while (this.cacheSize + elementSize > this.maxSize) {
                await this.removeLRU();
            }

            // Create and add new element
            const element: CacheElement = {
                data,
                length: data.length,
                url,
                lruTimeTrack: Date.now(),
                timestamp: new Date().toISOString(),
                next: null,
                prev: null
            };

            this.cacheMap.set(url, element);
            this.cacheSize += elementSize;

            // Add to front of list
            if (!this.head) {
                this.head = element;
                this.tail = element;
            } else {
                element.next = this.head;
                this.head.prev = element;
                this.head = element;
            }

            Logger.debug(`Added to cache: ${url}, size: ${elementSize} bytes`);
            return true;
        });
    }

    /**
     * Clears all cached data and resets statistics
     */
    async clear(): Promise<void> {
        return this.lock(async () => {
            this.head = null;
            this.tail = null;
            this.cacheMap.clear();
            this.cacheSize = 0;
            this.hits = 0;
            this.misses = 0;
            Logger.info('Cache cleared');
        });
    }
}
