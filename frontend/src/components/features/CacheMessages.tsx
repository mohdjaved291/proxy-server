import { Card } from '../UI/Card';

/**
 * Interface defining the props for the CacheMessages component
 * @interface CacheMessagesProps
 * @property {string[]} messages - Array of cache-related messages to display
 */
interface CacheMessagesProps {
    messages: string[];
}

/**
 * CacheMessages Component
 * Displays cache-related messages in a styled container
 * 
 * Features:
 * - Returns null if no messages (component won't render)
 * - Displays messages in monospace font for better readability
 * - Each message is contained in its own bordered card
 * - Messages are displayed in chronological order
 * 
 * @param {CacheMessagesProps} props - Component props
 * @param {string[]} props.messages - Array of messages to display
 * @returns {JSX.Element | null} Rendered component or null if no messages
 */
export const CacheMessages = ({ messages }: CacheMessagesProps) => {
    // Don't render anything if there are no messages
    if (messages.length === 0) return null;

    return (
        <Card title="Cache Process">
            {/* Messages container with vertical spacing between messages */}
            <div className="space-y-2">
                {/* Map through each message and render in a styled container */}
                {messages.map((message, index) => (
                    <div
                        key={index}
                        className="font-mono text-sm p-2 bg-gray-50 rounded border border-gray-100"
                    >
                        {message}
                    </div>
                ))}
            </div>
        </Card>
    );
};
