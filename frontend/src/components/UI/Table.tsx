interface TableProps {
    headers: string[];
    children: React.ReactNode;
    className?: string;
}

interface TableRowProps {
    columns: React.ReactNode[];
    className?: string;
}

/**
 * Table Component
 * 
 * A reusable table component with consistent styling and mobile responsiveness.
 * Features:
 * - Responsive design with horizontal scroll
 * - Consistent header styling
 * - Customizable through className prop
 * 
 * @param {TableProps} props - Component props
 * @returns {JSX.Element} Rendered table
 */
export const Table: React.FC<TableProps> = ({
    headers,
    children,
    className = ''
}) => {
    return (
        <div className="overflow-x-auto">
            <table className={`w-full ${className}`}>
                <thead>
                    <tr>
                        {headers.map((header, index) => (
                            <th key={index} className="text-left pb-2">
                                {header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {children}
                </tbody>
            </table>
        </div>
    );
};

/**
 * TableRow Component
 * 
 * A reusable row component for the Table.
 * Features:
 * - Consistent cell styling
 * - Flexible column content
 * 
 * @param {TableRowProps} props - Component props
 * @returns {JSX.Element} Rendered table row
 */
export const TableRow: React.FC<TableRowProps> = ({
    columns,
    className = ''
}) => {
    return (
        <tr className={className}>
            {columns.map((column, index) => (
                <td key={index} className="py-2">
                    {column}
                </td>
            ))}
        </tr>
    );
};