import { useState, useEffect, useCallback } from 'react';
import { CacheStats } from '../types/cache';
import { RequestEntry, Status } from '../types/common';
import { makeProxyRequest } from '../services/proxyService';
import { cacheStorage } from '../services/cacheStorage';

/**
 * Custom hook for managing proxy server state and operations
 * 
 * This hook centralizes all proxy-related functionality including:
 * - Cache management
 * - Request handling
 * - History tracking
 * - Status management
 * - Error handling
 * 
 * @returns {Object} Collection of state and handler functions
 */
export const useProxyServer = () => {
    // State declarations with their purposes
    const [status, setStatus] = useState<Status>('idle');                          // Tracks current proxy request status
    const [error, setError] = useState<string>('');                               // Stores error messages
    const [cacheMessages, setCacheMessages] = useState<string[]>([]);             // Logs cache-related operations
    const [requestHistory, setRequestHistory] = useState<RequestEntry[]>([]);     // Maintains history of requests
    const [cacheStats, setCacheStats] = useState<CacheStats>(cacheStorage.getStats()); // Tracks cache statistics

    /**
     * Initialize cache stats when component mounts
     * Ensures cache stats are in sync with actual cache state
     */
    useEffect(() => {
        setCacheStats(cacheStorage.getStats());
    }, []);

    /**
     * Clears the cache and updates related states
     * Memoized to prevent unnecessary re-renders
     */
    const clearCache = useCallback(() => {
        cacheStorage.clearCache();
        setCacheStats(cacheStorage.getStats());
        setCacheMessages(['Cache cleared']);
    }, []);

    /**
     * Main function to handle proxy requests
     * Implements the caching strategy and error handling
     * 
     * Flow:
     * 1. Reset states for new request
     * 2. Check cache for existing response
     * 3. Make network request if needed
     * 4. Update cache and history
     * 5. Handle any errors
     * 
     * @param {string} url - The URL to proxy
     */
    const handleRequest = async (url: string) => {
        // Reset states for new request
        setError('');
        setStatus('loading');
        setCacheMessages([]);

        try {
            // Check cache first
            const cachedResponse = cacheStorage.getFromCache(url);
            if (cachedResponse) {
                // Handle cache hit
                setCacheMessages(prev => [...prev, 'Cache HIT - Serving from cache']);
                updateRequestHistory(url, 'Cache Hit');
                setStatus('success');
                return;
            }

            // Handle cache miss
            setCacheMessages(prev => [...prev, 'Cache MISS - Fetching from origin']);
            const response = await makeProxyRequest(url);

            // Validate response
            if (!response.success) {
                throw new Error(response.error || 'Request failed');
            }

            // Update cache and history
            cacheStorage.saveToCache(url, response);
            updateRequestHistory(url, 'Cache Miss');
            setStatus('success');

            // Open proxied URL in new tab
            const proxyUrl = `http://localhost:8080/proxy?targetUrl=${encodeURIComponent(formatUrl(url))}`;
            window.open(proxyUrl, '_blank');

        } catch (err) {
            // Error handling
            console.error('Proxy request error:', err);
            setError(err instanceof Error ? err.message : 'An error occurred');
            setStatus('error');
        }
    };

    /**
     * Updates the request history with new entries
     * Maintains a maximum of 10 entries (FIFO)
     * 
     * @param {string} url - The requested URL
     * @param {string} cacheStatus - Whether the request was a cache hit or miss
     */
    const updateRequestHistory = (url: string, cacheStatus: 'Cache Hit' | 'Cache Miss') => {
        const displayUrl = formatUrl(url);
        setRequestHistory(prev => [{
            url: displayUrl,
            time: new Date().toLocaleString(),
            cacheStatus
        }, ...prev.slice(0, 9)]);  // Keep only the last 10 entries
    };

    /**
     * Formats URLs to ensure they include the protocol
     * 
     * @param {string} url - URL to format
     * @returns {string} Formatted URL with protocol
     */
    const formatUrl = (url: string) => url.startsWith('http') ? url : `http://${url}`;

    // Return all necessary state and handlers
    return {
        status,         // Current status of the proxy request
        error,          // Any error messages
        cacheMessages,  // Cache operation logs
        requestHistory, // History of requests
        cacheStats,     // Current cache statistics
        handleRequest,  // Main request handler
        clearCache     // Cache clearing function
    };
};
