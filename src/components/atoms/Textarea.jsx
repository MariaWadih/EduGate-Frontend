import React from 'react';

const Textarea = ({
    className = '',
    fullWidth = false,
    rows = 4,
    ...props
}) => {
    return (
        <textarea
            className={`search-input ${className}`}
            rows={rows}
            style={{
                width: fullWidth ? '100%' : 'auto',
                resize: 'none',
                ...props.style
            }}
            {...props}
        />
    );
};

export default Textarea;
