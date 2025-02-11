import React from 'react';

interface CardProps {
    title?: string;
    children: React.ReactNode;
    className?: string;
}

/**
 * Card Component
 * 
 * A reusable container component with consistent styling.
 * Features:
 * - Optional title
 * - Consistent padding and shadow
 * - Customizable through className prop
 * 
 * @param {CardProps} props - Component props
 * @returns {JSX.Element} Rendered card container
 */

export const Card: React.FC<CardProps> = ({
    title,
    children,
    className = ''
}) => {
    return (
        <div className={`bg-white p-6 rounded-lg shadow-sm ${className}`}>
            {title && (
                <h3 className="text-lg font-medium mb-3">{title}</h3>
            )}
            {children}
        </div>
    );
};
