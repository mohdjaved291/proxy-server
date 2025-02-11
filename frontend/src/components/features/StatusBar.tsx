import { useState, useEffect, useCallback } from 'react';
import { Card } from '../UI/Card';
import { Status } from '../../types/common';

/**
 * Props interface for the StatusBar component
 * @interface StatusBarProps
 * @property {Status} [status] - Current status of the component
 * @property {number} port - Port number where the proxy server is running
 * @property {boolean} [isConnected] - Optional prop to override the connection state
 */
interface StatusBarProps {
    status?: Status;
    port: number;
    isConnected?: boolean;
}

/**
 * StatusIndicator Component
 * Displays the current connection state with appropriate styling
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.isConnected - Current connection state
 * @returns {JSX.Element} Rendered status indicator
 */
const StatusIndicator = ({ isConnected }: { isConnected: boolean }) => (
    <span className={`ml-2 font-medium ${isConnected ? 'text-green-500' : 'text-red-500'
        }`}>
        {isConnected ? 'Connected' : 'Disconnected'}
    </span>
);

/**
 * StatusBar Component
 * 
 * Displays the connection status of a proxy server and monitors its availability.
 * Features:
 * - Real-time connection status monitoring
 * - Automatic status checks every 5 seconds
 * - Visual indicators for connected/disconnected states
 * - Port number display
 * 
 * @param {StatusBarProps} props - Component props
 * @returns {JSX.Element} Rendered status bar
 */
export const StatusBar: React.FC<StatusBarProps> = ({
    port,
    isConnected: externalIsConnected
}) => {
    // Track the connection state of the proxy server
    const [isConnected, setIsConnected] = useState(Boolean(externalIsConnected));

    /**
     * Checks the server status by making a GET request to the status endpoint
     * Uses the provided port number to construct the URL
     * Updates the connection state based on the response
     */
    const checkServerStatus = useCallback(async () => {
        try {
            const response = await fetch(`http://localhost:${port}/status`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                },
            });
            setIsConnected(response.ok);
        } catch (error) {
            setIsConnected(false);
            console.error('Server check failed:', error);
        }
    }, [port]);

    /**
     * Effect hook to handle server status monitoring
     * - Performs initial status check on component mount
     * - Sets up recurring status checks every 5 seconds
     * - Cleans up interval on component unmount
     */
    useEffect(() => {
        checkServerStatus();
        const interval = setInterval(checkServerStatus, 5000);
        return () => clearInterval(interval);
    }, [checkServerStatus]);

    return (
        <Card className="!p-4">
            <div className="flex justify-between items-center">
                <div className="flex items-center">
                    Proxy Server Status:
                    <StatusIndicator isConnected={isConnected} />
                </div>
                <div className="font-mono">Port: {port}</div>
            </div>
        </Card>
    );
};
