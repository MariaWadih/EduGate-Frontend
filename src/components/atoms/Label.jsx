import React from 'react';

const Label = ({ children, required = false, ...props }) => {
    return (
        <label
            style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '0.875rem',
                fontWeight: 600,
                ...props.style
            }}
            {...props}
        >
            {children}
            {required && <span style={{ color: 'var(--danger)', marginLeft: '4px' }}>*</span>}
        </label>
    );
};

export default Label;
