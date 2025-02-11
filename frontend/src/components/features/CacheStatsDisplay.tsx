import { Card } from '../UI/Card';
import { CacheStats } from '../../types/cache';

/**
 * Props interface for the CacheStatsDisplay component.
 * @interface CacheStatsDisplayProps
 * @property {CacheStats} stats - Object containing cache performance metrics
 * @property {() => void} [onClearCache] - Optional callback function to clear the cache
 */
interface CacheStatsDisplayProps {
    stats: CacheStats;
    onClearCache?: () => void;
}

/**
 * Props interface for the StatsCard component
 * @interface StatsCardProps
 * @property {string} label - Label for the statistic
 * @property {React.ReactNode} value - Value to display
 * @property {string} [className] - Optional CSS classes for styling
 */
interface StatsCardProps {
    label: string;
    value: React.ReactNode;
    className?: string;
}

/**
 * StatsCard Component - Internal component for displaying individual statistics
 * 
 * @component
 * @param {StatsCardProps} props - Component props
 * @returns {JSX.Element} A styled card displaying a single statistic
 */
const StatsCard = ({ label, value, className = '' }: StatsCardProps) => (
    // Individual stat card with gray background and rounded corners
    <div className="p-4 bg-gray-50 rounded">
        <p className="text-sm text-gray-600">{label}</p>
        <p className={`font-mono ${className}`}>{value}</p>
    </div>
);

/**
 * Component that displays cache performance statistics in a grid layout.
 * Shows hits, misses, hit ratio, and current cache size.
 * 
 * Features:
 * - Grid layout for easy scanning of metrics
 * - Color-coded statistics for better visibility
 * - Responsive design that works on all screen sizes
 * - Automatic hit ratio calculation
 * 
 * @component
 * @param {CacheStatsDisplayProps} props - Component props
 * @returns {React.ReactElement} A styled grid of cache statistics
 */
export const CacheStatsDisplay: React.FC<CacheStatsDisplayProps> = ({ stats }) => {
    // Calculate hit ratio as (hits / total requests) * 100
    const hitRatio = ((stats.hits / stats.totalRequests) * 100 || 0).toFixed(1);

    return (
        // Main container with white background and rounded corners
        <Card title="Cache Statistics">
            {/* Grid layout for statistics cards */}
            <div className="grid grid-cols-2 gap-4">
                {/* Cache Hits Card */}
                <StatsCard
                    label="Cache Hits"
                    value={stats.hits}
                    className="text-2xl text-green-600"
                />
                {/* Cache Misses Card */}
                <StatsCard
                    label="Cache Misses"
                    value={stats.misses}
                    className="text-2xl text-blue-600"
                />
                {/* Hit Ratio Card - Calculated as (hits / total requests) * 100 */}
                <StatsCard
                    label="Hit Ratio"
                    value={`${hitRatio}%`}
                    className="text-lg"
                />
                {/* Cache Size Card */}
                <StatsCard
                    label="Cache Size"
                    value={`${stats.cacheSize} entries`}
                    className="text-lg"
                />
            </div>
        </Card>
    );
};
