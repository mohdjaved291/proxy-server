import React from 'react';

/**
 * Props interface for the Alert component
 * @interface AlertProps
 * @property {'default' | 'destructive'} [variant='default'] - Visual style variant  of the alert
 * @property {React.ReactNode} children - Content to be rendered inside the alert
 * @property {string} [className] - Additional CSS classes for custom styling
*/

interface AlertProps {
    variant?: 'default' | 'destructive';
    children: React.ReactNode;
    className?: string;
}

/**
 * Alert Component
 * 
 * A flexible alert component that supports different visual styles
 * and can contain custom content.
 * 
 * Features:
 * - Multiple visual variants (default/destructive)
 * - Customizable through className prop
 * - Supports nested components
 */
export const Alert: React.FC<AlertProps> = ({
    variant = 'default',
    children,
    className = ''
}) => {
    // Base styling classes for all alert variants
    const baseClasses = "rounded-lg p-4 border";

    // Variant-specific styling classes
    const variantClasses = {
        default: "bg-blue-50 border-blue-200 text-blue-800",
        destructive: "bg-red-50 border-red-200 text-red-800"
    };

    return (
        <div className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
            {children}
        </div>
    );
};

/**
 * AlertTitle Component
 * 
 * Renders a title section within an Alert component
 * with consistent styling.
 */
export const AlertTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <h5 className="font-medium mb-1">{children}</h5>
);

/**
 * AlertDescription Component
 * 
 * Renders a description section within an Alert component
 * with consistent styling.
 */
export const AlertDescription: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="text-sm">{children}</div>
);
