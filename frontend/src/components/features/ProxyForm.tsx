import { useState } from "react";
import { Card } from '../UI/Card';
import { Status } from '../../types/common';

/**
 * Props interface for the ProxyForm component
 * @interface ProxyFormProps
 * @property {(url: string) => void} onSubmit - Callback function triggered when form is submitted
 * @property {boolean} [isLoading] - Optional flag to indicate loading state during form submission
 * @property {Status} [status] - Optional status of the form submission process
 */
interface ProxyFormProps {
    onSubmit: (url: string) => void;
    isLoading?: boolean;
    status?: Status;
}

/**
 * SubmitButton Component
 * Renders a button with loading state handling
 * 
 * @param {Object} props - Component props
 * @param {boolean} [props.isLoading] - Flag to indicate loading state
 * @returns {JSX.Element} Rendered button
 */
const SubmitButton = ({ isLoading }: { isLoading?: boolean }) => (
    <button
        type="submit"
        disabled={isLoading}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 
                 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
        {isLoading ? 'Sending...' : 'Send Request'}
    </button>
);

/**
 * ProxyForm Component
 * 
 * A form component that collects and validates URL input for proxy requests.
 * Features:
 * - URL input validation using HTML5 validation
 * - Loading state handling
 * - Responsive submit button with loading indicator
 * - Consistent card-based layout
 * 
 * @param {ProxyFormProps} props - Component props
 * @returns {JSX.Element} Rendered form component
 */
export const ProxyForm: React.FC<ProxyFormProps> = ({
    onSubmit,
    isLoading}) => {
    // State to manage the URL input value
    const [url, setUrl] = useState('');

    /**
     * Handles form submission
     * Prevents default form behavior and calls the onSubmit callback with the current URL
     * 
     * @param {React.FormEvent} e - Form submission event
     */
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (url.trim()) {
            onSubmit(url);
        }
    };

    return (
        <Card title="Proxy Request">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    {/* URL input field with HTML5 validation */}
                    <input
                        type="url"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="Enter URL (e.g., https://example.com)"
                        className="w-full p-2 border rounded focus:ring-2 
                                 focus:ring-blue-300 focus:border-blue-500 
                                 transition-all"
                        required
                    />
                </div>
                {/* Submit button with loading state */}
                <SubmitButton isLoading={isLoading} />
            </form>
        </Card>
    );
};
