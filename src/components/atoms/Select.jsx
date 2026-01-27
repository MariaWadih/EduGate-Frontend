import React from 'react';

const Select = ({
    children,
    className = '',
    fullWidth = false,
    ...props
}) => {
    return (
        <select
            className={`search-input ${className}`}
            style={{
                width: fullWidth ? '100%' : 'auto',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '10px',
                ...props.style
            }}
            {...props}
        >
            {children}
        </select>
    );
};

export default Select;
