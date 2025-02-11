import { Card } from '../UI/Card';
import { Table, TableRow } from '../UI/Table';
import { RequestEntry } from '../../types/common';

/**
 * Interface for a single request entry in the history
 * @interface RequestHistoryProps
 * @property {RequestEntry[]} history - Array of request entries to display
 */
interface RequestHistoryProps {
    history: RequestEntry[];
}

/**
 * RequestHistory Component
 * 
 * Displays a table of recent proxy requests with their cache status.
 * Features:
 * - Responsive table layout with horizontal scroll for mobile
 * - Visual indicators for cache hits/misses
 * - Chronological display of requests
 * 
 * @param {RequestHistoryProps} props - Component props containing the request history array
 * @returns {JSX.Element} Rendered table of request history
 */
export const RequestHistory: React.FC<RequestHistoryProps> = ({ history }) => {
    // Define table headers for consistent column structure
    const headers = ['URL', 'Time', 'Cache Status'];

    return (
        <Card title="Recent Requests">
            <Table headers={headers}>
                {/* Map through history entries to create table rows */}
                {history.map((request, index) => (
                    <TableRow
                        key={index}
                        columns={[
                            request.url,
                            request.time,
                            // Dynamic styling for cache status indicator
                            <span
                                className={`px-2 py-1 rounded-full text-sm ${request.cacheStatus === 'Cache Hit'
                                    ? 'bg-green-100 text-green-800' // Green styling for cache hits
                                    : 'bg-blue-100 text-blue-800'   // Blue styling for cache misses
                                    }`}
                            >
                                {request.cacheStatus}
                            </span>
                        ]}
                    />
                ))}
            </Table>
        </Card>
    );
};
