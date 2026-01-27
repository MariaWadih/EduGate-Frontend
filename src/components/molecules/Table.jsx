import React from 'react';

const Table = ({ children }) => {
    return (
        <div className="table-container">
            <table>
                {children}
            </table>
        </div>
    );
};

const TableHead = ({ children }) => {
    return <thead>{children}</thead>;
};

const TableBody = ({ children }) => {
    return <tbody>{children}</tbody>;
};

const TableRow = ({ children, ...props }) => {
    return <tr {...props}>{children}</tr>;
};

const TableHeader = ({ children, align = 'left', ...props }) => {
    return (
        <th style={{ textAlign: align, ...props.style }} {...props}>
            {children}
        </th>
    );
};

const TableCell = ({ children, align = 'left', ...props }) => {
    return (
        <td style={{ textAlign: align, ...props.style }} {...props}>
            {children}
        </td>
    );
};

Table.Head = TableHead;
Table.Body = TableBody;
Table.Row = TableRow;
Table.Header = TableHeader;
Table.Cell = TableCell;

export default Table;
