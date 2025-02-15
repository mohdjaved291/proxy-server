/**
 * UnifiedProxyComponent
 * 
 * Main component that integrates all proxy-related functionality.
 * Features:
 * - Proxy request handling with caching
 * - Real-time status monitoring
 * - Cache statistics display
 * - Request history tracking
 * - Error handling
 * 
 * The component uses a custom hook (useProxyServer) to manage all state
 * and business logic, keeping the component focused on presentation.
 */

import { Alert, AlertDescription } from './UI/Alert';
import { ProxyForm } from './features/ProxyForm';
import { StatusBar } from './features/StatusBar';
import { RequestHistory } from './features/RequestHistory';
import { CacheMessages } from './features/CacheMessages';
import { CacheStatsDisplay } from './features/CacheStatsDisplay';
import { useProxyServer } from '../hooks/useProxyServer';

export const UnifiedProxyComponent = () => {
    // Destructure all necessary state and handlers from the custom hook
    const {
        status,         // Current status of the proxy server
        error,          // Error message if any
        cacheMessages,  // Array of cache-related status messages
        requestHistory, // Array of previous requests
        cacheStats,     // Current cache statistics
        handleRequest,  // Function to handle new proxy requests
        clearCache     // Function to clear the cache
    } = useProxyServer();

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container max-w-3xl mx-auto px-4">
                <div className="grid gap-8">
                    {/* Status Bar - Displays current connection status */}
                    <StatusBar />

                    {/* Proxy Form - Handles URL input and submission */}
                    <ProxyForm
                        onSubmit={handleRequest}
                        isLoading={status === 'loading'}
                    />

                    {/* Cache Information Section */}
                    <div className="flex flex-col gap-4">
                        {/* Cache Statistics Display */}
                        <CacheStatsDisplay
                            stats={cacheStats}
                            onClearCache={clearCache}
                        />

                        {/* Cache Process Messages */}
                        <CacheMessages messages={cacheMessages} />
                    </div>

                    {/* Error Alert - Shows only when there's an error */}
                    {error && (
                        <Alert variant="destructive">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {/* Request History Table */}
                    <RequestHistory history={requestHistory} />
                </div>
            </div>
        </div>
    );
};
