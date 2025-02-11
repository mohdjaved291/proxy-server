/**
 * Represents the current state of an operation or component
 * Used for loading states and error handling
 */
export type Status = 'idle' | 'loading' | 'error' | 'success';

/**
 * Indicates whether a request was served from cache
 * Used for monitoring and displaying cache performance
 */
export type CacheStatus = 'Cache Hit' | 'Cache Miss';

/**
 * Represents a single request in the request history
 * Used for logging and displaying request information
 */
export interface RequestEntry {
    url: string;           // The URL that was requested
    time: string;          // Timestamp of the request
    cacheStatus: CacheStatus; // Whether request was served from cache
}

/**
 * Base interface for React component props
 * Provides common properties used across multiple components
 */
export interface BaseComponentProps {
    className?: string;         // Optional CSS class names
    children?: React.ReactNode; // Optional child elements
}

/**
 * Props for card components
 * Extends base props with card-specific properties
 */
export interface CardProps extends BaseComponentProps {
    title?: string; // Optional card title
}

/**
 * Props for table components
 * Extends base props with table-specific properties
 */
export interface TableProps extends BaseComponentProps {
    headers: string[]; // Array of column headers
}

/**
 * Props for table row components
 * Extends base props with row-specific properties
 */
export interface TableRowProps extends BaseComponentProps {
    columns: React.ReactNode[]; // Array of column contents
}
